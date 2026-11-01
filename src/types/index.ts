export interface RTDUser {
  id: string; // Internal UID
  rtdId: string; // e.g. "RTD-928412"
  phoneNumber: string; // e.g. "+1 (555) 234-5678"
  displayName: string;
  avatarUrl: string;
  statusMessage: string;
  online: boolean;
  lastSeen: string; // ISO string or relative time
  role: 'user' | 'admin';
  isBanned?: boolean;
  createdAt: string;
}

export type MessageType = 'text' | 'image' | 'video' | 'audio' | 'system';
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';

export interface MessageReaction {
  emoji: string;
  userId: string;
  count: number;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderRtdId: string;
  senderAvatar: string;
  type: MessageType;
  content: string; // text or media caption
  mediaUrl?: string; // base64 or object URL
  mediaDuration?: number; // for audio/video in seconds
  mediaSize?: string;
  status: MessageStatus;
  timestamp: string;
  replyTo?: {
    id: string;
    senderName: string;
    content: string;
    type: MessageType;
  };
  reactions?: { [emoji: string]: string[] }; // emoji -> array of userIds
  isDeleted?: boolean;
}

export interface Chat {
  id: string;
  isGroup: boolean;
  name: string; // contact name or group name
  avatarUrl: string;
  description?: string;
  participantIds: string[]; // RTD user IDs
  adminIds?: string[]; // for group chats
  lastMessage?: {
    text: string;
    timestamp: string;
    senderName?: string;
    type: MessageType;
    status: MessageStatus;
  };
  unreadCount: number;
  updatedAt: string;
  pinned?: boolean;
  muted?: boolean;
}

export interface CallRecord {
  id: string;
  callerId: string;
  callerName: string;
  callerAvatar: string;
  receiverId: string;
  receiverName: string;
  receiverAvatar: string;
  type: 'voice' | 'video';
  direction: 'incoming' | 'outgoing' | 'missed';
  timestamp: string;
  durationSeconds: number;
}

export interface PrivacySettings {
  lastSeenVisibility: 'everyone' | 'contacts' | 'nobody';
  profilePhotoVisibility: 'everyone' | 'contacts' | 'nobody';
  onlineStatusVisibility: 'everyone' | 'same_as_last_seen';
  readReceipts: boolean;
  blockedUserIds: string[];
}

export interface SystemAnnouncement {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  author: string;
}
