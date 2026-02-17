import { gql } from '@apollo/client';
import { USER_FIELDS, MISSION_FIELDS } from './queries';

/* ───────────── Auth ───────────── */

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      expiresIn
    }
  }
`;

/* ───────────── Products ───────────── */

export const CREATE_PRODUCT = gql`
  mutation CreateProduct($input: CreateProductInput!) {
    createProduct(input: $input) {
      id
      title
      description
    }
  }
`;

export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($id: String!, $input: UpdateProductInput!) {
    updateProduct(id: $id, input: $input) {
      id
      title
      description
    }
  }
`;

export const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: String!) {
    deleteProduct(id: $id)
  }
`;

/* ───────────── Missions ───────────── */

export const CREATE_MISSION = gql`
  mutation CreateMission($input: CreateMissionInput!) {
    createMission(input: $input) {
      ...MissionFields
    }
  }
  ${MISSION_FIELDS}
`;

export const UPDATE_MISSION = gql`
  mutation UpdateMission($id: String!, $input: UpdateMissionInput!) {
    updateMission(id: $id, input: $input) {
      ...MissionFields
    }
  }
  ${MISSION_FIELDS}
`;

export const UPDATE_MISSION_STATUS = gql`
  mutation UpdateMissionStatus($id: String!, $status: MissionStatus!) {
    updateMissionStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;

export const TAKE_MISSION = gql`
  mutation TakeMission($id: String!) {
    takeMission(id: $id) {
      id
      status
      assignee {
        ...UserFields
      }
    }
  }
  ${USER_FIELDS}
`;

/* ───────────── Chat ───────────── */

export const SEND_MESSAGE = gql`
  mutation SendMessage($input: SendMessageInput!) {
    sendMessage(input: $input) {
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

/* ───────────── Judging ───────────── */

export const CREATE_JUDGING_STEP = gql`
  mutation CreateJudgingStep($input: CreateJudgingStepInput!) {
    createJudgingStep(input: $input) {
      id
      title
      order
      status
    }
  }
`;

export const UPDATE_STEP_STATUS = gql`
  mutation UpdateStepStatus($id: String!, $status: StepStatus!) {
    updateStepStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;

/* ───────────── Notifications ───────────── */

export const MARK_NOTIFICATION_READ = gql`
  mutation MarkNotificationRead($id: String!) {
    markNotificationRead(id: $id)
  }
`;

export const MARK_ALL_NOTIFICATIONS_READ = gql`
  mutation MarkAllNotificationsRead {
    markAllNotificationsRead
  }
`;

/* ───────────── User Profile ───────────── */

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: UpdateUserInput!) {
    updateProfile(input: $input) {
      ...UserFields
    }
  }
  ${USER_FIELDS}
`;

/* ───────────── Upload ───────────── */

export const UPLOAD_FILE = gql`
  mutation UploadFile($fileUrl: String) {
    uploadFile(fileUrl: $fileUrl)
  }
`;

/* ───────────── Attachments ───────────── */

export const CREATE_ATTACHMENT = gql`
  mutation CreateAttachment($input: CreateAttachmentInput!) {
    createAttachment(input: $input) {
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

export const DELETE_ATTACHMENT = gql`
  mutation DeleteAttachment($id: String!) {
    deleteAttachment(id: $id)
  }
`;
