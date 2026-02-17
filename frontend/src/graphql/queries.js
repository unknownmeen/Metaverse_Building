import { gql } from '@apollo/client';

/* ───────────── Fragments ───────────── */

export const USER_FIELDS = gql`
  fragment UserFields on UserEntity {
    id
    name
    phone
    avatar
    avatarId
    role
  }
`;

export const MISSION_FIELDS = gql`
  fragment MissionFields on MissionEntity {
    id
    title
    description
    status
    priority
    dueDate
    createdAt
    assignee {
      ...UserFields
    }
    judgingSteps {
      id
      title
      status
      order
      judge {
        ...UserFields
      }
    }
  }
  ${USER_FIELDS}
`;

const PRODUCT_FIELDS_BASE = gql`
  fragment ProductFieldsBase on ProductEntity {
    id
    title
    description
    parentId
    missions {
      ...MissionFields
    }
  }
`;

/* ───────────── Auth ───────────── */

export const ME = gql`
  query Me {
    me {
      ...UserFields
    }
  }
  ${USER_FIELDS}
`;

/* ───────────── Products ───────────── */
/* عمق ۱۲ سطح برای پشتیبانی از تو در توهای زیاد (بدون fragment بازگشتی) */
export const PRODUCT_TREE = gql`
  query ProductTree($rootId: String) {
    productTree(rootId: $rootId) {
      ...ProductFieldsBase
      children {
        ...ProductFieldsBase
        children {
          ...ProductFieldsBase
          children {
            ...ProductFieldsBase
            children {
              ...ProductFieldsBase
              children {
                ...ProductFieldsBase
                children {
                  ...ProductFieldsBase
                  children {
                    ...ProductFieldsBase
                    children {
                      ...ProductFieldsBase
                      children {
                        ...ProductFieldsBase
                        children {
                          ...ProductFieldsBase
                          children {
                            ...ProductFieldsBase
                            children {
                              ...ProductFieldsBase
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  ${MISSION_FIELDS}
  ${PRODUCT_FIELDS_BASE}
`;

export const PRODUCT_BREADCRUMB = gql`
  query ProductBreadcrumb($id: String!) {
    productBreadcrumb(id: $id) {
      id
      title
    }
  }
`;

export const GET_PRODUCT = gql`
  query GetProduct($id: String!) {
    product(id: $id) {
      id
      title
      description
      parentId
      children {
        id
        title
      }
      missions {
        ...MissionFields
      }
    }
  }
  ${MISSION_FIELDS}
`;

/* ───────────── Missions ───────────── */

export const GET_MISSION = gql`
  query GetMission($id: String!) {
    mission(id: $id) {
      ...MissionFields
    }
  }
  ${MISSION_FIELDS}
`;

export const GET_MISSIONS_BY_PRODUCT = gql`
  query GetMissionsByProduct($productId: String!) {
    missionsByProduct(productId: $productId) {
      ...MissionFields
    }
  }
  ${MISSION_FIELDS}
`;

/* ───────────── Users ───────────── */

export const GET_USERS = gql`
  query GetUsers {
    users {
      ...UserFields
    }
  }
  ${USER_FIELDS}
`;

/* ───────────── Notifications ───────────── */

export const GET_NOTIFICATIONS = gql`
  query GetNotifications {
    notifications {
      id
      type
      text
      read
      missionId
      stepId
      createdAt
      sender {
        ...UserFields
      }
    }
  }
  ${USER_FIELDS}
`;

export const GET_UNREAD_NOTIFICATION_COUNT = gql`
  query GetUnreadNotificationCount {
    unreadNotificationCount
  }
`;

/* ───────────── Chat ───────────── */

export const GET_CHAT_MESSAGES = gql`
  query GetChatMessages($missionId: String!, $stepId: String) {
    chatMessages(missionId: $missionId, stepId: $stepId) {
      id
      text
      fileName
      fileUrl
      stepId
      createdAt
      sender {
        ...UserFields
      }
    }
  }
  ${USER_FIELDS}
`;

/* ───────────── Attachments ───────────── */

export const GET_ATTACHMENTS_BY_PRODUCT = gql`
  query AttachmentsByProduct($productId: String!) {
    attachmentsByProduct(productId: $productId) {
      id
      name
      url
      type
      productId
      missionId
      createdAt
    }
  }
`;

export const GET_ATTACHMENTS_BY_MISSION = gql`
  query AttachmentsByMission($missionId: String!) {
    attachmentsByMission(missionId: $missionId) {
      id
      name
      url
      type
      productId
      missionId
      createdAt
    }
  }
`;

/* ───────────── Judging ───────────── */

export const GET_JUDGING_STEP = gql`
  query GetJudgingStep($id: String!) {
    judgingStep(id: $id) {
      id
      title
      order
      status
      judge {
        ...UserFields
      }
    }
  }
  ${USER_FIELDS}
`;
