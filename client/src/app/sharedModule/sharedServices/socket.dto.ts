// Socket.IO Data Transfer Objects (DTOs) for type safety

// Messenger DTOs
export interface MessengerMessageDTO {
  id: string;
  userId: number;
  userName: string;
  userEmail: string;
  groupId: number;
  message: string;
  isAdmin: boolean;
  messagedAt: string;
}

export interface MessengerGroupDTO {
  id: number;
  name: string;
  description?: string;
  ownerId: number;
  requiresApproval: boolean;
  memberCount: number;
  membership: GroupMembershipDTO | null;
  pendingRequests: GroupMembershipDTO[];
  createdAt: string;
}

export interface GroupMembershipDTO {
  id: number;
  userId: number;
  status: 'pending' | 'approved' | 'rejected';
  role: 'owner' | 'member';
  name?: string;
  email?: string;
}

// Socket Event DTOs
export interface MessengerJoinGroupDTO {
  groupId: number;
}

export interface MessengerJoinedDTO {
  groupId: number;
}

export interface MessengerJoinRejectedDTO {
  groupId: number;
  reason: string;
}

export interface MessengerErrorDTO {
  message: string;
  success?: boolean;
}

export interface MessengerTypingStartDTO {
  userId: number;
  groupId: number;
}

export interface MessengerTypingStopDTO {
  userId: number;
  groupId: number;
}

// Group Events DTOs
export interface GroupCreatedDTO {
  group: {
    id: number;
    name: string;
    description?: string;
    ownerId: number;
    requiresApproval: boolean;
    createdAt: string;
  };
  owner: {
    id: number;
    name: string;
    email: string;
  };
}

export interface JoinRequestDTO {
  groupId: number;
  groupName: string;
  membership: GroupMembershipDTO;
  requester: {
    id: number;
    name: string;
    email: string;
  };
}

export interface JoinApprovedDTO {
  groupId: number;
  groupName: string;
  membership: GroupMembershipDTO;
}

export interface MemberJoinedDTO {
  groupId: number;
  membership: GroupMembershipDTO;
}

export interface MembershipUpdatedDTO {
  groupId: number;
  membership: GroupMembershipDTO;
  action: 'approve' | 'reject';
}

// Approval Events DTOs
export interface ApprovalStatusChangedDTO {
  userId: number;
  status: number;
  approved: boolean;
  message: string;
  userName: string;
  userEmail: string;
}

export interface AdminUserStatusChangedDTO {
  userId: number;
  status: number;
  userName: string;
  userEmail: string;
  changedBy: string;
}

// Socket Response DTOs
export interface MessengerSendMessageResponseDTO {
  success: boolean;
  message?: MessengerMessageDTO;
  error?: string;
}

