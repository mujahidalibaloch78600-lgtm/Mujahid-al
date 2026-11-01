import React, { useState, useEffect } from 'react';
import {
  Code2,
  Server,
  Users,
  Shield,
  Smartphone,
  RefreshCw,
  LogOut,
  Bell,
  Sparkles,
} from 'lucide-react';
import { RTDUser, Chat, Message } from './types';
import { storageService } from './services/storageService';
import { soundService } from './services/soundService';

import { AndroidFrame } from './components/AndroidFrame';
import { ChatList } from './components/chat/ChatList';
import { ConversationView } from './components/chat/ConversationView';
import { CallsHistoryView } from './components/calls/CallsHistoryView';
import { PhoneAuthModal } from './components/auth/PhoneAuthModal';
import { NewChatModal } from './components/chat/NewChatModal';
import { NewGroupModal } from './components/chat/NewGroupModal';
import { UserProfileModal } from './components/profile/UserProfileModal';
import { VoiceCallModal } from './components/calls/VoiceCallModal';
import { VideoCallModal } from './components/calls/VideoCallModal';
import { MediaViewerModal } from './components/chat/MediaViewerModal';
import { SettingsView } from './components/settings/SettingsView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { NotificationBanner } from './components/notifications/NotificationBanner';
import { BackendStatusModal } from './components/backend/BackendStatusModal';
import { ComposeCodeViewer } from './components/codeview/ComposeCodeViewer';

export default function App() {
  const [currentUser, setCurrentUser] = useState<RTDUser>(storageService.getCurrentUser());
  const [activeScreen, setActiveScreen] = useState<'chats' | 'conversation' | 'settings' | 'admin'>('chats');
  const [activeTab, setActiveTab] = useState<'chats' | 'groups' | 'calls'>('chats');
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [viewMode, setViewMode] = useState<'phone' | 'tablet' | 'full'>('phone');

  // Modals
  const [showAuthModal, setShowAuthModal] = useState<boolean>(!storageService.getAuthState());
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showBackendMatrix, setShowBackendMatrix] = useState(false);
  const [showCodeViewer, setShowCodeViewer] = useState(false);
  const [activeMediaMessage, setActiveMediaMessage] = useState<Message | null>(null);

  // Calls
  const [callingContact, setCallingContact] = useState<RTDUser | null>(null);
  const [callType, setCallType] = useState<'voice' | 'video' | null>(null);

  // Push notification state
  const [incomingNotification, setIncomingNotification] = useState<Message | null>(null);

  // Refresh user state
  const refreshUser = () => {
    setCurrentUser(storageService.getCurrentUser());
  };

  // Open Chat
  const handleSelectChat = (chat: Chat) => {
    setActiveChat(chat);
    setActiveScreen('conversation');
    // Clear unread count
    if (chat.unreadCount > 0) {
      const chats = storageService.getChats();
      const target = chats.find((c) => c.id === chat.id);
      if (target) {
        target.unreadCount = 0;
        storageService.saveChats(chats);
      }
    }
  };

  // Start chat with user from Search modal
  const handleStartChatWithUser = (user: RTDUser) => {
    const chat = storageService.createOrGetDirectChat(user);
    handleSelectChat(chat);
  };

  // Voice Call
  const handleStartVoiceCall = (user: RTDUser) => {
    setCallingContact(user);
    setCallType('voice');
  };

  // Video Call
  const handleStartVideoCall = (user: RTDUser) => {
    setCallingContact(user);
    setCallType('video');
  };

  // End Call
  const handleEndCall = (_duration: number) => {
    setCallingContact(null);
    setCallType(null);
  };

  // Switch Active User Perspective (For testing two-way real-time messaging)
  const handleSwitchUser = (user: RTDUser) => {
    storageService.updateCurrentUser(user);
    setCurrentUser(user);
    setActiveChat(null);
    setActiveScreen('chats');
  };

  // Trigger test incoming push notification
  const handleTestPushNotification = () => {
    const sampleMsg: Message = {
      id: `msg_notif_${Date.now()}`,
      chatId: 'chat_sarah',
      senderId: 'usr_002',
      senderName: 'Sarah Jenkins',
      senderRtdId: 'RTD-401923',
      senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&h=256&q=80',
      type: 'text',
      content: 'Hey Alex! Just testing the Android push notification banner 🔔',
      status: 'delivered',
      timestamp: 'Just now',
    };
    soundService.playReceivedMessage();
    setIncomingNotification(sampleMsg);
    setTimeout(() => {
      setIncomingNotification((curr) => (curr?.id === sampleMsg.id ? null : curr));
    }, 5500);
  };

  return (
    <div className="min-h-screen bg-[#ECEAE4] flex flex-col font-sans">
      {/* Top AI Studio Workspace Header Bar */}
      <header className="bg-white border-b border-gray-200/80 px-4 py-2.5 flex items-center justify-between shadow-2xs select-none">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#00A884] to-[#075E54] flex items-center justify-center text-white shadow-xs">
            <span className="font-black text-xs tracking-tighter">RTD</span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-sm font-bold text-gray-900 leading-tight">
                RTD APP <span className="font-normal text-gray-500">• Android Messaging</span>
              </h1>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                Green & White
              </span>
            </div>
            <p className="text-[11px] text-gray-500">
              Kotlin • Jetpack Compose • Firebase Architecture • Unique RTD User ID
            </p>
          </div>
        </div>

        {/* Global Action Tools */}
        <div className="flex items-center space-x-2">
          {/* Kotlin Code Viewer Button */}
          <button
            onClick={() => setShowCodeViewer(true)}
            className="flex items-center space-x-1.5 bg-gray-900 hover:bg-black text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-xs transition-all"
          >
            <Code2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Jetpack Compose Code</span>
          </button>

          {/* Backend & Calling Status Matrix */}
          <button
            onClick={() => setShowBackendMatrix(true)}
            className="flex items-center space-x-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold px-3 py-1.5 rounded-xl border border-emerald-200 shadow-xs transition-all"
          >
            <Server className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Backend Matrix</span>
          </button>

          {/* Test Push Notification */}
          <button
            onClick={handleTestPushNotification}
            title="Simulate incoming push notification"
            className="flex items-center space-x-1 bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-gray-200 shadow-2xs transition-all"
          >
            <Bell className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden md:inline">Test Push</span>
          </button>

          {/* Multi-User Perspective Switcher */}
          <div className="relative group">
            <button
              title="Switch user perspective"
              className="flex items-center space-x-1.5 bg-white hover:bg-gray-50 text-gray-800 text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-gray-200 shadow-2xs"
            >
              <img
                src={currentUser.avatarUrl}
                alt=""
                className="w-4 h-4 rounded-full object-cover"
              />
              <span className="max-w-[75px] truncate hidden sm:inline">{currentUser.displayName}</span>
              <RefreshCw className="w-3 h-3 text-gray-400" />
            </button>

            {/* Dropdown to switch perspective */}
            <div className="absolute right-0 top-9 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-1 hidden group-hover:block z-50 animate-scaleIn">
              <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-gray-400">
                Switch Test Account
              </div>
              {storageService.getAllUsers().slice(0, 4).map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleSwitchUser(u)}
                  className={`w-full px-3 py-2 text-left text-xs flex items-center space-x-2 hover:bg-emerald-50 ${
                    u.id === currentUser.id ? 'bg-emerald-50/60 font-bold text-emerald-800' : 'text-gray-700'
                  }`}
                >
                  <img src={u.avatarUrl} alt="" className="w-5 h-5 rounded-full object-cover" />
                  <div className="truncate">
                    <div className="truncate">{u.displayName}</div>
                    <div className="text-[10px] text-gray-400 font-mono">{u.rtdId}</div>
                  </div>
                </button>
              ))}
              <div className="border-t border-gray-100 mt-1 pt-1">
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="w-full px-3 py-1.5 text-left text-xs text-emerald-700 font-semibold hover:bg-emerald-50 flex items-center space-x-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Register New Phone & RTD ID</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content: Android Hardware Enclosure */}
      <main className="flex-1 flex items-center justify-center p-2 sm:p-4 overflow-auto">
        <AndroidFrame
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          notificationSlot={
            <NotificationBanner
              message={incomingNotification}
              onOpenMessage={(msg) => {
                const targetChat = storageService.getChatById(msg.chatId);
                if (targetChat) {
                  handleSelectChat(targetChat);
                }
                setIncomingNotification(null);
              }}
              onDismiss={() => setIncomingNotification(null)}
            />
          }
        >
          {/* Screen 1: Chats / Groups / Calls List */}
          {activeScreen === 'chats' && (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {activeTab === 'calls' ? (
                <div className="flex-1 flex flex-col h-full">
                  <div className="bg-[#075E54] text-white px-4 pt-3 pb-2 shadow-md shrink-0">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-black tracking-tight">RTD APP</span>
                      <button
                        onClick={() => setShowProfileModal(true)}
                        className="p-1 rounded-full hover:bg-white/10"
                      >
                        <img
                          src={currentUser.avatarUrl}
                          alt=""
                          className="w-7 h-7 rounded-full object-cover ring-2 ring-emerald-300"
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs font-bold mt-3 border-b border-emerald-700/60">
                      <button
                        onClick={() => setActiveTab('chats')}
                        className="flex-1 py-2 text-center uppercase tracking-wider text-emerald-200 hover:text-white"
                      >
                        Chats
                      </button>
                      <button
                        onClick={() => setActiveTab('groups')}
                        className="flex-1 py-2 text-center uppercase tracking-wider text-emerald-200 hover:text-white"
                      >
                        Groups
                      </button>
                      <button
                        onClick={() => setActiveTab('calls')}
                        className="flex-1 py-2 text-center uppercase tracking-wider text-white relative"
                      >
                        <span>Calls</span>
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white rounded-t-full"></div>
                      </button>
                    </div>
                  </div>

                  <CallsHistoryView
                    onStartVoiceCall={handleStartVoiceCall}
                    onStartVideoCall={handleStartVideoCall}
                  />
                </div>
              ) : (
                <ChatList
                  onSelectChat={handleSelectChat}
                  onOpenNewChat={() => setShowNewChatModal(true)}
                  onOpenNewGroup={() => setShowNewGroupModal(true)}
                  onOpenProfile={() => setShowProfileModal(true)}
                  onOpenSettings={() => setActiveScreen('settings')}
                  onOpenAdmin={() => setActiveScreen('admin')}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                />
              )}
            </div>
          )}

          {/* Screen 2: Conversation View */}
          {activeScreen === 'conversation' && activeChat && (
            <ConversationView
              chat={activeChat}
              onBack={() => {
                setActiveScreen('chats');
                setActiveChat(null);
              }}
              onStartVoiceCall={handleStartVoiceCall}
              onStartVideoCall={handleStartVideoCall}
              onOpenMedia={setActiveMediaMessage}
              onOpenChatInfo={() => {
                if (activeChat.isGroup) {
                  setShowNewGroupModal(false);
                } else {
                  setShowProfileModal(true);
                }
              }}
            />
          )}

          {/* Screen 3: Settings & Privacy */}
          {activeScreen === 'settings' && (
            <SettingsView
              onBack={() => setActiveScreen('chats')}
              onResetData={() => {
                storageService.resetDatabase();
                refreshUser();
                setActiveChat(null);
                setActiveScreen('chats');
              }}
            />
          )}

          {/* Screen 4: Admin Dashboard */}
          {activeScreen === 'admin' && (
            <AdminDashboard
              onBack={() => setActiveScreen('chats')}
              onOpenBackendMatrix={() => setShowBackendMatrix(true)}
            />
          )}

          {/* Full Screen Voice Call Modal Overlay */}
          {callingContact && callType === 'voice' && (
            <VoiceCallModal
              isOpen={true}
              contact={callingContact}
              onEndCall={handleEndCall}
            />
          )}

          {/* Full Screen Video Call Modal Overlay */}
          {callingContact && callType === 'video' && (
            <VideoCallModal
              isOpen={true}
              contact={callingContact}
              onEndCall={handleEndCall}
            />
          )}
        </AndroidFrame>
      </main>

      {/* Phone Number OTP & RTD ID Registration Modal */}
      <PhoneAuthModal
        isOpen={showAuthModal}
        onSuccess={(user) => {
          setCurrentUser(user);
          setShowAuthModal(false);
        }}
        onClose={() => setShowAuthModal(false)}
      />

      {/* Search Friends by Phone or RTD ID Modal */}
      <NewChatModal
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        onSelectUser={handleStartChatWithUser}
      />

      {/* New Group Chat Creator Modal */}
      <NewGroupModal
        isOpen={showNewGroupModal}
        onClose={() => setShowNewGroupModal(false)}
        onGroupCreated={(groupChat) => {
          handleSelectChat(groupChat);
        }}
      />

      {/* User Profile & RTD ID QR Card Modal */}
      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onUserUpdated={(u) => setCurrentUser(u)}
      />

      {/* Photo and Video Fullscreen Lightbox Modal */}
      <MediaViewerModal
        message={activeMediaMessage}
        onClose={() => setActiveMediaMessage(null)}
      />

      {/* Backend & Calling Service Requirements Matrix */}
      <BackendStatusModal
        isOpen={showBackendMatrix}
        onClose={() => setShowBackendMatrix(false)}
      />

      {/* Kotlin & Jetpack Compose Codebase Viewer */}
      <ComposeCodeViewer
        isOpen={showCodeViewer}
        onClose={() => setShowCodeViewer(false)}
      />
    </div>
  );
}
