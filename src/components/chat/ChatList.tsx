import React, { useState } from 'react';
import {
  Search,
  MoreVertical,
  MessageSquarePlus,
  Users,
  Phone,
  Pin,
  Check,
  CheckCheck,
  Mic,
  Camera,
  Settings,
  Shield,
  CircleDot,
  Radio,
} from 'lucide-react';
import { Chat, RTDUser } from '../../types';
import { storageService } from '../../services/storageService';

interface ChatListProps {
  onSelectChat: (chat: Chat) => void;
  onOpenNewChat: () => void;
  onOpenNewGroup: () => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  onOpenAdmin: () => void;
  activeTab: 'chats' | 'groups' | 'calls';
  onTabChange: (tab: 'chats' | 'groups' | 'calls') => void;
}

export const ChatList: React.FC<ChatListProps> = ({
  onSelectChat,
  onOpenNewChat,
  onOpenNewGroup,
  onOpenProfile,
  onOpenSettings,
  onOpenAdmin,
  activeTab,
  onTabChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showFabOptions, setShowFabOptions] = useState(false);

  const currentUser = storageService.getCurrentUser();
  const chats = storageService.getChats();

  const filteredChats = chats.filter((chat) => {
    // Filter by tab
    if (activeTab === 'groups' && !chat.isGroup) return false;
    if (activeTab === 'chats' && chat.isGroup) return false;

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = chat.name.toLowerCase().includes(q);
      const msgMatch = chat.lastMessage?.text.toLowerCase().includes(q);
      return nameMatch || msgMatch;
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-white relative select-none">
      {/* Android Top App Bar */}
      <div className="bg-[#075E54] text-white px-4 pt-3 pb-2 shadow-md shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-black tracking-tight text-white">RTD APP</span>
            <span className="text-[10px] bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 px-1.5 py-0.5 rounded-full font-mono font-bold">
              {currentUser.rtdId}
            </span>
          </div>

          <div className="flex items-center space-x-1 relative">
            <button
              onClick={onOpenProfile}
              title="My Profile"
              className="p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <img
                src={currentUser.avatarUrl}
                alt="Profile"
                className="w-7 h-7 rounded-full object-cover ring-2 ring-emerald-300"
              />
            </button>

            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {/* Android Dropdown Menu */}
            {showMenu && (
              <div className="absolute right-0 top-10 w-48 bg-white text-gray-800 rounded-2xl shadow-2xl py-1.5 z-40 border border-gray-100 animate-scaleIn">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onOpenNewGroup();
                  }}
                  className="w-full px-4 py-2 text-left text-xs hover:bg-emerald-50 flex items-center space-x-2"
                >
                  <Users className="w-4 h-4 text-emerald-700" />
                  <span>New Group</span>
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onOpenProfile();
                  }}
                  className="w-full px-4 py-2 text-left text-xs hover:bg-emerald-50 flex items-center space-x-2"
                >
                  <span className="font-mono text-emerald-700 font-bold">RTD</span>
                  <span>My Profile & RTD ID</span>
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onOpenSettings();
                  }}
                  className="w-full px-4 py-2 text-left text-xs hover:bg-emerald-50 flex items-center space-x-2"
                >
                  <Settings className="w-4 h-4 text-gray-600" />
                  <span>Settings & Privacy</span>
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onOpenAdmin();
                  }}
                  className="w-full px-4 py-2 text-left text-xs hover:bg-emerald-50 flex items-center space-x-2 border-t border-gray-100 text-emerald-800 font-semibold"
                >
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <span>Admin Interface</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation (Material 3 Tabs) */}
        <div className="flex items-center justify-between text-xs font-bold mt-3 border-b border-emerald-700/60">
          <button
            onClick={() => onTabChange('chats')}
            className={`flex-1 py-2 text-center uppercase tracking-wider relative transition-colors ${
              activeTab === 'chats' ? 'text-white' : 'text-emerald-200/80 hover:text-white'
            }`}
          >
            <span>Chats</span>
            {activeTab === 'chats' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white rounded-t-full"></div>
            )}
          </button>

          <button
            onClick={() => onTabChange('groups')}
            className={`flex-1 py-2 text-center uppercase tracking-wider relative transition-colors ${
              activeTab === 'groups' ? 'text-white' : 'text-emerald-200/80 hover:text-white'
            }`}
          >
            <span>Groups</span>
            {activeTab === 'groups' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white rounded-t-full"></div>
            )}
          </button>

          <button
            onClick={() => onTabChange('calls')}
            className={`flex-1 py-2 text-center uppercase tracking-wider relative transition-colors ${
              activeTab === 'calls' ? 'text-white' : 'text-emerald-200/80 hover:text-white'
            }`}
          >
            <span>Calls</span>
            {activeTab === 'calls' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white rounded-t-full"></div>
            )}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      {activeTab !== 'calls' && (
        <div className="p-2.5 bg-gray-50/80 border-b border-gray-100 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={`Search ${activeTab === 'groups' ? 'groups' : 'chats'} or messages...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs bg-white border border-gray-200 rounded-full pl-9 pr-4 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
            />
          </div>
        </div>
      )}

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
        {filteredChats.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            <Users className="w-10 h-10 mx-auto text-gray-300 mb-2" />
            <p className="text-xs font-semibold text-gray-700">No conversations here</p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Tap the green floating button to start a chat or create a group!
            </p>
          </div>
        ) : (
          filteredChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => onSelectChat(chat)}
              className="flex items-center justify-between px-3.5 py-3 hover:bg-emerald-50/40 cursor-pointer transition-colors"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div className="relative shrink-0">
                  <img
                    src={chat.avatarUrl}
                    alt={chat.name}
                    className="w-12 h-12 rounded-full object-cover ring-1 ring-gray-200"
                  />
                  {!chat.isGroup && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-bold text-gray-900 truncate">
                      {chat.name}
                    </span>
                    <span className="text-[10px] text-gray-400 shrink-0 ml-2">
                      {chat.lastMessage?.timestamp}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1 text-[11px] text-gray-500 truncate pr-2">
                      {chat.lastMessage?.status === 'read' && (
                        <CheckCheck className="w-3.5 h-3.5 text-[#34B7F1] shrink-0" />
                      )}
                      {chat.lastMessage?.type === 'audio' && (
                        <Mic className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      )}
                      {chat.lastMessage?.type === 'image' && (
                        <Camera className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      )}
                      <span className="truncate">
                        {chat.lastMessage?.text || 'Tap to message'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0">
                      {chat.pinned && <Pin className="w-3 h-3 text-gray-400" />}
                      {chat.unreadCount > 0 && (
                        <span className="w-5 h-5 rounded-full bg-[#25D366] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating Action Button (FAB) for Android */}
      <div className="absolute bottom-4 right-4 z-30 flex flex-col items-end space-y-2">
        {showFabOptions && (
          <div className="flex flex-col items-end space-y-2 mb-1 animate-slideUp">
            <button
              onClick={() => {
                setShowFabOptions(false);
                onOpenNewGroup();
              }}
              className="flex items-center space-x-2 bg-white text-gray-800 text-xs font-semibold px-3 py-2 rounded-2xl shadow-lg border border-gray-100 hover:bg-emerald-50 transition-colors"
            >
              <span>New Group</span>
              <Users className="w-4 h-4 text-emerald-700" />
            </button>

            <button
              onClick={() => {
                setShowFabOptions(false);
                onOpenNewChat();
              }}
              className="flex items-center space-x-2 bg-white text-gray-800 text-xs font-semibold px-3 py-2 rounded-2xl shadow-lg border border-gray-100 hover:bg-emerald-50 transition-colors"
            >
              <span>Search RTD ID / Phone</span>
              <Search className="w-4 h-4 text-emerald-700" />
            </button>
          </div>
        )}

        <button
          onClick={() => setShowFabOptions(!showFabOptions)}
          title="New Message"
          className="w-14 h-14 rounded-2xl bg-[#00A884] hover:bg-[#008f70] text-white flex items-center justify-center shadow-xl active:scale-95 transition-all"
        >
          <MessageSquarePlus className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
