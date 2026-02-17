import { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
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
      return {
        ...state,
        user,
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

  /**
   * Fetch all initial data from the API after authentication.
   * Runs all queries in parallel for maximum performance.
   */
  const fetchInitialData = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', loading: true });

      const [meResult, productsResult, usersResult, notificationsResult] =
        await Promise.all([
          client.query({ query: ME }),
          client.query({ query: PRODUCT_TREE }),
          client.query({ query: GET_USERS }),
          client.query({ query: GET_NOTIFICATIONS }),
        ]);

      if (meResult.data?.me) {
        dispatch({ type: 'SET_AUTH_DATA', user: transformUser(meResult.data.me) });
      }

      if (productsResult.data?.productTree) {
        dispatch({
          type: 'SET_PRODUCTS',
          products: transformProductTree(productsResult.data.productTree),
        });
      }

      if (usersResult.data?.users) {
        dispatch({ type: 'SET_USERS', users: transformUsers(usersResult.data.users) });
      }

      if (notificationsResult.data?.notifications) {
        dispatch({
          type: 'SET_NOTIFICATIONS',
          notifications: transformNotifications(notificationsResult.data.notifications),
        });
      }
    } catch (error) {
      console.error('Failed to fetch initial data:', error);
      tokenService.removeToken();
      dispatch({ type: 'LOGOUT' });
    } finally {
      dispatch({ type: 'SET_LOADING', loading: false });
    }
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
    try {
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
    }
  }, [client]);

  /**
   * Refresh notifications from the server.
   */
  const refreshNotifications = useCallback(async () => {
    try {
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
    }
  }, [client]);

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
