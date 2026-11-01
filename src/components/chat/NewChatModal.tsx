import React, { useState } from 'react';
import { Search, UserCheck, MessageSquare, X, Phone, Shield, Sparkles } from 'lucide-react';
import { RTDUser } from '../../types';
import { storageService } from '../../services/storageService';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (user: RTDUser) => void;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({
  isOpen,
  onClose,
  onSelectUser,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const currentUser = storageService.getCurrentUser();
  const allUsers = storageService.getAllUsers().filter((u) => u.id !== currentUser.id);

  if (!isOpen) return null;

  const filteredUsers = searchQuery.trim()
    ? storageService.findUserByQuery(searchQuery).filter((u) => u.id !== currentUser.id)
    : allUsers;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden border border-emerald-100 flex flex-col max-h-[85vh]">
        {/* Top Header */}
        <div className="bg-[#075E54] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-emerald-300" />
            <div>
              <h3 className="text-sm font-bold">New Direct Chat</h3>
              <p className="text-[11px] text-emerald-100/80">Search by Phone Number or RTD ID</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="p-4 bg-gray-50 border-b border-gray-100">
          <div className="relative">
            <Search className="w-4 h-4 text-emerald-600 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search phone (+1...) or RTD ID (RTD-000...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="w-full text-xs bg-white border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-gray-500 mt-2 px-1">
            <span>Tip: Try typing "RTD" or "555"</span>
            <span className="text-emerald-700 font-medium font-mono text-[10px] bg-emerald-50 px-1.5 py-0.5 rounded">
              {filteredUsers.length} users found
            </span>
          </div>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100 p-2">
          {filteredUsers.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <UserCheck className="w-10 h-10 mx-auto text-gray-300 mb-2" />
              <p className="text-xs font-semibold text-gray-700">No RTD users found</p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Check the phone number or RTD ID format
              </p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                onClick={() => {
                  onSelectUser(user);
                  onClose();
                }}
                className="flex items-center justify-between p-2.5 hover:bg-emerald-50/50 rounded-2xl cursor-pointer transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={user.avatarUrl}
                      alt={user.displayName}
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-emerald-500/20 shadow-xs"
                    />
                    {user.online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                    )}
                  </div>
                  <div className="text-left">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-xs font-bold text-gray-900 group-hover:text-emerald-700">
                        {user.displayName}
                      </span>
                      {user.role === 'admin' && (
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-full">
                          ADMIN
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-[10px] text-gray-500 mt-0.5">
                      <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-1 rounded">
                        {user.rtdId}
                      </span>
                      <span>•</span>
                      <span>{user.phoneNumber}</span>
                    </div>
                    <p className="text-[11px] text-gray-400 truncate max-w-[170px] mt-0.5">
                      {user.statusMessage}
                    </p>
                  </div>
                </div>

                <button className="bg-emerald-600 group-hover:bg-emerald-700 text-white p-2 rounded-xl text-xs shadow-xs transition-colors">
                  <MessageSquare className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
