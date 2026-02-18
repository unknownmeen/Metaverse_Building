import { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import { useApolloClient } from '@apollo/client/react';
import { PRODUCT_TREE, ME, GET_USERS, GET_NOTIFICATIONS } from '../graphql/queries';
import { tokenService } from '../services/tokenService';
import {
  transformProductTree,
  transformUser,
  transformUsers,
  transformNotifications,
} from '../graphql/adapters';

const AppContext = createContext();
const PRODUCTS_POLL_MS = 7000;
const NOTIFICATIONS_POLL_MS = 4000;

/* ───────────── Tree Traversal Helpers ───────────── */

function findProductById(node, id) {
  if (!node) return null;
  if (node.id === id) return node;
  if (node.children) {
    for (const child of node.children) {
      if (child.type === 'product') {
        const found = findProductById(child, id);
        if (found) return found;
      }
    }
  }
  return null;
}

function findMissionById(node, id) {
  if (!node) return null;
  if (node.children) {
    for (const child of node.children) {
      if (child.type === 'mission' && child.id === id) return child;
      if (child.type === 'product') {
        const found = findMissionById(child, id);
        if (found) return found;
      }
    }
  }
  return null;
}

function buildPath(product, targetId, path = []) {
  if (!product) return null;
  if (product.id === targetId) return [...path, { id: product.id, title: product.title }];
  if (product.children) {
    for (const child of product.children) {
      if (child.type === 'product') {
        const result = buildPath(child, targetId, [...path, { id: product.id, title: product.title }]);
        if (result) return result;
      }
    }
  }
  return null;
}

function findProductContainingMission(node, missionId) {
  if (!node) return null;
  if (node.children) {
    const hasMission = node.children.some((c) => c.type === 'mission' && c.id === missionId);
    if (hasMission) return node;
    for (const child of node.children) {
      if (child.type === 'product') {
        const found = findProductContainingMission(child, missionId);
        if (found) return found;
      }
    }
  }
  return null;
}

function upsertUser(userMap, user) {
  if (!user?.id) return;
  const existing = userMap.get(user.id) || {};
  userMap.set(user.id, { ...existing, ...user });
}

function collectUsersFromTree(node, userMap) {
  if (!node?.children) return;
  for (const child of node.children) {
    if (child.type === 'mission') {
      upsertUser(userMap, child.assigneeUser);
      for (const step of child.judgingSteps || []) {
        upsertUser(userMap, step.judge);
      }
    } else if (child.type === 'product') {
      collectUsersFromTree(child, userMap);
    }
  }
}

function deriveUsersFromProducts(products, currentUser) {
  const userMap = new Map();
  upsertUser(userMap, currentUser);
  collectUsersFromTree(products, userMap);
  return Array.from(userMap.values());
}

function mergeUsers(primaryUsers, fallbackUsers) {
  const userMap = new Map();
  for (const user of fallbackUsers || []) upsertUser(userMap, user);
  for (const user of primaryUsers || []) upsertUser(userMap, user);
  return Array.from(userMap.values());
}

function isAuthFailure(error) {
  const graphQLErrors = error?.graphQLErrors || [];
  const hasAuthGraphQLError = graphQLErrors.some((err) =>
    ['UNAUTHENTICATED', 'UNAUTHORIZED'].includes(err?.extensions?.code)
  );
  const networkStatus = error?.networkError?.statusCode || error?.statusCode;
  const message = String(error?.message || '');
  const hasAuthMessage = /unauthenticated|unauthorized|token|jwt.*expir|expired/i.test(message);
  return hasAuthGraphQLError || networkStatus === 401 || hasAuthMessage;
}

/* ───────────── State & Reducer ───────────── */

const initialState = {
  user: null,
  isAdmin: false,
  isLoggedIn: false,
  loading: true,
  products: null,
  users: [],
  currentProductId: null,
  breadcrumb: [],
  notifications: [],
  selectedMission: null,
  missionDrawerStepId: null,
  showMissionDrawer: false,
  showProductInfoDrawer: false,
  showCreateSubProductDrawer: false,
  showCreateMissionDrawer: false,
  selectedProductForInfo: null,
  drawerParentProductId: null,
};

function reducer(state, action) {
  switch (action.type) {
    /* ─── Data Loading ─── */
    case 'SET_LOADING':
      return { ...state, loading: action.loading };

    case 'SET_AUTH_DATA': {
      const user = action.user;
      const existingUsers = state.users || [];
      const userExists = existingUsers.some((u) => u.id === user.id);
      const nextUsers = userExists
        ? existingUsers.map((u) => (u.id === user.id ? { ...u, ...user } : u))
        : [...existingUsers, user];
      return {
        ...state,
        user,
        users: nextUsers,
        isLoggedIn: true,
        isAdmin: user.role === 'admin',
      };
    }

    case 'SET_PRODUCTS': {
      const products = action.products;
      const isInitialLoad = !state.currentProductId;
      return {
        ...state,
        products,
        ...(isInitialLoad
          ? {
              currentProductId: products.id,
              breadcrumb: [{ id: products.id, title: products.title }],
            }
          : {}),
      };
    }

    case 'SET_USERS':
      return { ...state, users: action.users };

    case 'SET_NOTIFICATIONS':
      return { ...state, notifications: action.notifications };

    /* ─── Auth ─── */
    case 'LOGOUT':
      return { ...initialState, loading: false };

    case 'TOGGLE_ROLE':
      return { ...state, isAdmin: !state.isAdmin };

    /* ─── Navigation ─── */
    case 'NAVIGATE_TO_PRODUCT': {
      const path = buildPath(state.products, action.productId);
      return {
        ...state,
        currentProductId: action.productId,
        breadcrumb: path || state.breadcrumb,
      };
    }

    case 'NAVIGATE_BREADCRUMB': {
      const idx = state.breadcrumb.findIndex((b) => b.id === action.productId);
      return {
        ...state,
        currentProductId: action.productId,
        breadcrumb: state.breadcrumb.slice(0, idx + 1),
      };
    }

    /* ─── Drawer UI ─── */
    case 'OPEN_MISSION_DRAWER':
      return {
        ...state,
        selectedMission: action.mission,
        missionDrawerStepId: action.stepId ?? null,
        showMissionDrawer: true,
      };
    case 'CLOSE_MISSION_DRAWER':
      return { ...state, showMissionDrawer: false, selectedMission: null, missionDrawerStepId: null };
    case 'OPEN_PRODUCT_INFO_DRAWER':
      return { ...state, selectedProductForInfo: action.product, showProductInfoDrawer: true };
    case 'CLOSE_PRODUCT_INFO_DRAWER':
      return { ...state, showProductInfoDrawer: false, selectedProductForInfo: null };
    case 'OPEN_CREATE_SUB_PRODUCT':
      return { ...state, showCreateSubProductDrawer: true, drawerParentProductId: action.parentId };
    case 'CLOSE_CREATE_SUB_PRODUCT':
      return { ...state, showCreateSubProductDrawer: false, drawerParentProductId: null };
    case 'OPEN_CREATE_MISSION':
      return { ...state, showCreateMissionDrawer: true, drawerParentProductId: action.parentId };
    case 'CLOSE_CREATE_MISSION':
      return { ...state, showCreateMissionDrawer: false, drawerParentProductId: null };

    /* ─── Notifications (optimistic local update) ─── */
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.id ? { ...n, read: true } : n
        ),
      };

    default:
      return state;
  }
}

/* ───────────── Provider ───────────── */

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const client = useApolloClient();
  const refreshingProductsRef = useRef(false);
  const refreshingNotificationsRef = useRef(false);

  /**
   * Fetch all initial data from the API after authentication.
   * Runs core queries for all users and admin-only queries conditionally.
   */
  const fetchInitialData = useCallback(async () => {
    let isSuccess = false;
    try {
      dispatch({ type: 'SET_LOADING', loading: true });

      const meResult = await client.query({ query: ME });
      const currentUser = meResult.data?.me ? transformUser(meResult.data.me) : null;
      if (!currentUser) {
        throw new Error('Failed to fetch authenticated user profile');
      }
      dispatch({ type: 'SET_AUTH_DATA', user: currentUser });

      const usersPromise =
        currentUser.role === 'admin'
          ? client.query({ query: GET_USERS }).catch((error) => {
              console.warn('Failed to fetch users list:', error);
              return null;
            })
          : Promise.resolve(null);

      const [productsResult, notificationsResult, usersResult] = await Promise.all([
        client.query({ query: PRODUCT_TREE }),
        client.query({ query: GET_NOTIFICATIONS }).catch((error) => {
          console.warn('Failed to fetch notifications:', error);
          return null;
        }),
        usersPromise,
      ]);

      const transformedProducts = productsResult.data?.productTree
        ? transformProductTree(productsResult.data.productTree)
        : null;
      const derivedUsers = deriveUsersFromProducts(transformedProducts, currentUser);

      if (currentUser.role === 'admin') {
        const apiUsers = usersResult?.data?.users ? transformUsers(usersResult.data.users) : [];
        dispatch({ type: 'SET_USERS', users: mergeUsers(apiUsers, derivedUsers) });
      } else {
        dispatch({ type: 'SET_USERS', users: derivedUsers });
      }

      if (transformedProducts) {
        dispatch({
          type: 'SET_PRODUCTS',
          products: transformedProducts,
        });
      }

      if (notificationsResult?.data?.notifications) {
        dispatch({
          type: 'SET_NOTIFICATIONS',
          notifications: transformNotifications(notificationsResult.data.notifications),
        });
      }
      isSuccess = true;
    } catch (error) {
      console.error('Failed to fetch initial data:', error);
      if (tokenService.isTokenExpired() || isAuthFailure(error)) {
        tokenService.removeToken();
        dispatch({ type: 'LOGOUT' });
      }
    } finally {
      dispatch({ type: 'SET_LOADING', loading: false });
    }
    return isSuccess;
  }, [client]);

  useEffect(() => {
    if (tokenService.isAuthenticated()) {
      fetchInitialData();
    } else {
      dispatch({ type: 'SET_LOADING', loading: false });
    }
  }, [fetchInitialData]);

  /**
   * Refresh the product tree from the server.
   * Call after any mutation that modifies products/missions.
   */
  const refreshProducts = useCallback(async () => {
    if (refreshingProductsRef.current || !tokenService.isAuthenticated()) return;
    try {
      refreshingProductsRef.current = true;
      client.cache.evict({ fieldName: 'productTree' });
      client.cache.gc();
      const { data } = await client.query({
        query: PRODUCT_TREE,
        fetchPolicy: 'network-only',
      });
      if (data?.productTree) {
        dispatch({
          type: 'SET_PRODUCTS',
          products: transformProductTree(data.productTree),
        });
      }
    } catch (error) {
      console.error('Failed to refresh products:', error);
    } finally {
      refreshingProductsRef.current = false;
    }
  }, [client]);

  /**
   * Refresh notifications from the server.
   */
  const refreshNotifications = useCallback(async () => {
    if (refreshingNotificationsRef.current || !tokenService.isAuthenticated()) return;
    try {
      refreshingNotificationsRef.current = true;
      const { data } = await client.query({
        query: GET_NOTIFICATIONS,
        fetchPolicy: 'network-only',
      });
      if (data?.notifications) {
        dispatch({
          type: 'SET_NOTIFICATIONS',
          notifications: transformNotifications(data.notifications),
        });
      }
    } catch (error) {
      console.error('Failed to refresh notifications:', error);
    } finally {
      refreshingNotificationsRef.current = false;
    }
  }, [client]);

  useEffect(() => {
    if (!state.isLoggedIn || state.loading) return;

    let isStopped = false;

    const syncNow = async () => {
      if (isStopped || document.hidden) return;
      await Promise.allSettled([refreshProducts(), refreshNotifications()]);
    };

    const onVisibilityChange = () => {
      if (!document.hidden) {
        syncNow();
      }
    };

    const onFocus = () => {
      syncNow();
    };

    const productsInterval = setInterval(() => {
      if (!document.hidden) refreshProducts();
    }, PRODUCTS_POLL_MS);

    const notificationsInterval = setInterval(() => {
      if (!document.hidden) refreshNotifications();
    }, NOTIFICATIONS_POLL_MS);

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('focus', onFocus);
    syncNow();

    return () => {
      isStopped = true;
      clearInterval(productsInterval);
      clearInterval(notificationsInterval);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('focus', onFocus);
    };
  }, [state.isLoggedIn, state.loading, refreshProducts, refreshNotifications]);

  /**
   * Logout: clear token, reset Apollo cache, reset state.
   */
  const logout = useCallback(() => {
    tokenService.removeToken();
    client.clearStore();
    dispatch({ type: 'LOGOUT' });
  }, [client]);

  /* ─── Derived Values & Helpers ─── */

  const getCurrentProduct = useCallback(() => {
    if (!state.products || !state.currentProductId) return null;
    return findProductById(state.products, state.currentProductId);
  }, [state.products, state.currentProductId]);

  const getUserById = useCallback(
    (id) => {
      return state.users.find((u) => u.id === id) || null;
    },
    [state.users]
  );

  const getMissionById = useCallback(
    (id) => {
      if (!state.products) return null;
      return findMissionById(state.products, id);
    },
    [state.products]
  );

  const getProductContainingMission = useCallback(
    (missionId) => {
      if (!state.products) return null;
      return findProductContainingMission(state.products, missionId);
    },
    [state.products]
  );

  const unreadCount = state.notifications.filter((n) => !n.read).length;

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        getCurrentProduct,
        getUserById,
        getMissionById,
        getProductContainingMission,
        unreadCount,
        refreshProducts,
        refreshNotifications,
        fetchInitialData,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
