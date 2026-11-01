import {
  RTDUser,
  Chat,
  Message,
  CallRecord,
  PrivacySettings,
  SystemAnnouncement,
} from '../types';
import {
  INITIAL_CURRENT_USER,
  INITIAL_CONTACTS,
  INITIAL_CHATS,
  INITIAL_MESSAGES,
  INITIAL_CALLS,
  INITIAL_PRIVACY_SETTINGS,
} from '../data/mockData';

const STORAGE_KEYS = {
  CURRENT_USER: 'rtd_current_user',
  ALL_USERS: 'rtd_all_users',
  CHATS: 'rtd_chats',
  MESSAGES: 'rtd_messages',
  CALLS: 'rtd_calls',
  PRIVACY: 'rtd_privacy_settings',
  ANNOUNCEMENTS: 'rtd_announcements',
  AUTH_STATE: 'rtd_auth_state', // 'authenticated' | 'unauthenticated'
};

class StorageService {
  private getStorageItem<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(key);
      if (!data) return fallback;
      return JSON.parse(data) as T;
    } catch {
      return fallback;
    }
  }

  private setStorageItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('Storage write failed', e);
    }
  }

  // Auth State
  getAuthState(): boolean {
    const val = localStorage.getItem(STORAGE_KEYS.AUTH_STATE);
    return val !== 'unauthenticated'; // Default authenticated for immediate exploration
  }

  setAuthState(isAuthenticated: boolean): void {
    localStorage.setItem(
      STORAGE_KEYS.AUTH_STATE,
      isAuthenticated ? 'authenticated' : 'unauthenticated'
    );
  }

  // Current User
  getCurrentUser(): RTDUser {
    return this.getStorageItem<RTDUser>(
      STORAGE_KEYS.CURRENT_USER,
      INITIAL_CURRENT_USER
    );
  }

  updateCurrentUser(updates: Partial<RTDUser>): RTDUser {
    const current = this.getCurrentUser();
    const updated = { ...current, ...updates };
    this.setStorageItem(STORAGE_KEYS.CURRENT_USER, updated);

    // Also update in all users directory
    const all = this.getAllUsers();
    const idx = all.findIndex((u) => u.id === updated.id);
    if (idx >= 0) {
      all[idx] = updated;
      this.setStorageItem(STORAGE_KEYS.ALL_USERS, all);
    }
    return updated;
  }

  // All Users / Directory
  getAllUsers(): RTDUser[] {
    const fallback = [INITIAL_CURRENT_USER, ...INITIAL_CONTACTS];
    return this.getStorageItem<RTDUser[]>(STORAGE_KEYS.ALL_USERS, fallback);
  }

  saveAllUsers(users: RTDUser[]): void {
    this.setStorageItem(STORAGE_KEYS.ALL_USERS, users);
  }

  registerUser(phoneNumber: string, displayName: string, avatarUrl?: string): RTDUser {
    // Generate unique RTD ID: "RTD-" + 6 random digits
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const rtdId = `RTD-${randomNum}`;
    const newUser: RTDUser = {
      id: `usr_${Date.now()}`,
      rtdId,
      phoneNumber,
      displayName: displayName.trim() || `RTD User ${randomNum.toString().slice(-4)}`,
      avatarUrl:
        avatarUrl ||
        `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&h=256&q=80`,
      statusMessage: 'Hey there! I am using RTD APP 💬',
      online: true,
      lastSeen: 'online',
      role: 'user',
      createdAt: new Date().toISOString(),
    };

    const all = this.getAllUsers();
    all.unshift(newUser);
    this.setStorageItem(STORAGE_KEYS.ALL_USERS, all);
    this.setStorageItem(STORAGE_KEYS.CURRENT_USER, newUser);
    this.setAuthState(true);
    return newUser;
  }

  findUserByQuery(query: string): RTDUser[] {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const all = this.getAllUsers();
    return all.filter(
      (u) =>
        u.rtdId.toLowerCase().includes(q) ||
        u.phoneNumber.replace(/\s+/g, '').includes(q.replace(/\s+/g, '')) ||
        u.displayName.toLowerCase().includes(q)
    );
  }

  // Chats
  getChats(): Chat[] {
    return this.getStorageItem<Chat[]>(STORAGE_KEYS.CHATS, INITIAL_CHATS);
  }

  saveChats(chats: Chat[]): void {
    this.setStorageItem(STORAGE_KEYS.CHATS, chats);
  }

  getChatById(chatId: string): Chat | undefined {
    return this.getChats().find((c) => c.id === chatId);
  }

  createOrGetDirectChat(otherUser: RTDUser): Chat {
    const chats = this.getChats();
    const current = this.getCurrentUser();
    const existing = chats.find(
      (c) =>
        !c.isGroup &&
        c.participantIds.includes(otherUser.id) &&
        c.participantIds.includes(current.id)
    );

    if (existing) return existing;

    const newChat: Chat = {
      id: `chat_${otherUser.id}_${Date.now()}`,
      isGroup: false,
      name: otherUser.displayName,
      avatarUrl: otherUser.avatarUrl,
      participantIds: [current.id, otherUser.id],
      unreadCount: 0,
      updatedAt: new Date().toISOString(),
      lastMessage: {
        text: 'Chat started',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'system',
        status: 'read',
      },
    };

    chats.unshift(newChat);
    this.saveChats(chats);
    return newChat;
  }

  createGroupChat(
    name: string,
    participantIds: string[],
    avatarUrl?: string,
    description?: string
  ): Chat {
    const current = this.getCurrentUser();
    const allParticipants = Array.from(new Set([current.id, ...participantIds]));

    const newGroup: Chat = {
      id: `group_${Date.now()}`,
      isGroup: true,
      name: name.trim(),
      avatarUrl:
        avatarUrl ||
        'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=256&h=256&q=80',
      description: description || 'RTD Group Chat',
      participantIds: allParticipants,
      adminIds: [current.id],
      unreadCount: 0,
      updatedAt: new Date().toISOString(),
      lastMessage: {
        text: `${current.displayName} created group "${name}"`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'system',
        status: 'read',
      },
    };

    const chats = this.getChats();
    chats.unshift(newGroup);
    this.saveChats(chats);
    return newGroup;
  }

  // Messages
  getAllMessages(): { [chatId: string]: Message[] } {
    return this.getStorageItem<{ [chatId: string]: Message[] }>(
      STORAGE_KEYS.MESSAGES,
      INITIAL_MESSAGES
    );
  }

  getMessagesForChat(chatId: string): Message[] {
    const all = this.getAllMessages();
    return all[chatId] || [];
  }

  sendMessage(chatId: string, messageInput: Omit<Message, 'id' | 'timestamp' | 'status'>): Message {
    const all = this.getAllMessages();
    const currentList = all[chatId] || [];

    const newMsg: Message = {
      ...messageInput,
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
    };

    currentList.push(newMsg);
    all[chatId] = currentList;
    this.setStorageItem(STORAGE_KEYS.MESSAGES, all);

    // Update last message in chat list
    const chats = this.getChats();
    const chatIndex = chats.findIndex((c) => c.id === chatId);
    if (chatIndex >= 0) {
      let previewText = newMsg.content;
      if (newMsg.type === 'audio') previewText = `🎤 Voice message (${newMsg.mediaDuration || 5}s)`;
      if (newMsg.type === 'image') previewText = `📷 Photo ${newMsg.content ? ': ' + newMsg.content : ''}`;
      if (newMsg.type === 'video') previewText = `🎥 Video ${newMsg.content ? ': ' + newMsg.content : ''}`;

      chats[chatIndex].lastMessage = {
        text: previewText,
        timestamp: newMsg.timestamp,
        senderName: newMsg.senderName,
        type: newMsg.type,
        status: 'sent',
      };
      chats[chatIndex].updatedAt = new Date().toISOString();

      // move to top
      const [updatedChat] = chats.splice(chatIndex, 1);
      chats.unshift(updatedChat);
      this.saveChats(chats);
    }

    return newMsg;
  }

  addReaction(chatId: string, messageId: string, emoji: string, userId: string): void {
    const all = this.getAllMessages();
    const messages = all[chatId] || [];
    const target = messages.find((m) => m.id === messageId);
    if (!target) return;

    if (!target.reactions) target.reactions = {};
    if (!target.reactions[emoji]) target.reactions[emoji] = [];

    if (target.reactions[emoji].includes(userId)) {
      target.reactions[emoji] = target.reactions[emoji].filter((id) => id !== userId);
      if (target.reactions[emoji].length === 0) {
        delete target.reactions[emoji];
      }
    } else {
      target.reactions[emoji].push(userId);
    }

    this.setStorageItem(STORAGE_KEYS.MESSAGES, all);
  }

  deleteMessage(chatId: string, messageId: string): void {
    const all = this.getAllMessages();
    const messages = all[chatId] || [];
    const target = messages.find((m) => m.id === messageId);
    if (target) {
      target.isDeleted = true;
      target.content = '🚫 This message was deleted';
      delete target.mediaUrl;
      this.setStorageItem(STORAGE_KEYS.MESSAGES, all);
    }
  }

  // Calls
  getCalls(): CallRecord[] {
    return this.getStorageItem<CallRecord[]>(STORAGE_KEYS.CALLS, INITIAL_CALLS);
  }

  logCall(call: Omit<CallRecord, 'id' | 'timestamp'>): CallRecord {
    const calls = this.getCalls();
    const newRecord: CallRecord = {
      ...call,
      id: `call_${Date.now()}`,
      timestamp: 'Just now',
    };
    calls.unshift(newRecord);
    this.setStorageItem(STORAGE_KEYS.CALLS, calls);
    return newRecord;
  }

  // Privacy Settings
  getPrivacySettings(): PrivacySettings {
    return this.getStorageItem<PrivacySettings>(
      STORAGE_KEYS.PRIVACY,
      INITIAL_PRIVACY_SETTINGS
    );
  }

  savePrivacySettings(settings: PrivacySettings): void {
    this.setStorageItem(STORAGE_KEYS.PRIVACY, settings);
  }

  // System Announcements
  getAnnouncements(): SystemAnnouncement[] {
    return this.getStorageItem<SystemAnnouncement[]>(STORAGE_KEYS.ANNOUNCEMENTS, [
      {
        id: 'ann_1',
        title: 'Welcome to RTD APP v2.4 (Jetpack Compose)',
        message:
          'Experience end-to-end messaging with unique RTD user IDs, voice notes, video calling, and green & white Android design.',
        timestamp: 'Nov 1, 2026',
        author: 'RTD System Admin',
      },
    ]);
  }

  broadcastAnnouncement(title: string, message: string): SystemAnnouncement {
    const announcements = this.getAnnouncements();
    const current = this.getCurrentUser();
    const newAnn: SystemAnnouncement = {
      id: `ann_${Date.now()}`,
      title,
      message,
      timestamp: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
      author: `${current.displayName} (Admin)`,
    };
    announcements.unshift(newAnn);
    this.setStorageItem(STORAGE_KEYS.ANNOUNCEMENTS, announcements);
    return newAnn;
  }

  // Reset to sample data
  resetDatabase(): void {
    localStorage.clear();
    this.setStorageItem(STORAGE_KEYS.CURRENT_USER, INITIAL_CURRENT_USER);
    this.setStorageItem(STORAGE_KEYS.ALL_USERS, [INITIAL_CURRENT_USER, ...INITIAL_CONTACTS]);
    this.setStorageItem(STORAGE_KEYS.CHATS, INITIAL_CHATS);
    this.setStorageItem(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES);
    this.setStorageItem(STORAGE_KEYS.CALLS, INITIAL_CALLS);
    this.setStorageItem(STORAGE_KEYS.PRIVACY, INITIAL_PRIVACY_SETTINGS);
    this.setAuthState(true);
  }
}

export const storageService = new StorageService();
