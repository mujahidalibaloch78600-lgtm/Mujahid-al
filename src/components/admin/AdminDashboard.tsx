import React, { useState } from 'react';
import {
  ArrowLeft,
  Shield,
  Users,
  MessageSquare,
  PhoneCall,
  Megaphone,
  Ban,
  CheckCircle2,
  AlertTriangle,
  Server,
  Cloud,
  Check,
  Search,
} from 'lucide-react';
import { RTDUser } from '../../types';
import { storageService } from '../../services/storageService';

interface AdminDashboardProps {
  onBack: () => void;
  onOpenBackendMatrix: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack, onOpenBackendMatrix }) => {
  const [users, setUsers] = useState<RTDUser[]>(storageService.getAllUsers());
  const [searchQuery, setSearchQuery] = useState('');
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMsg, setAnnouncementMsg] = useState('');
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  const chats = storageService.getChats();
  const allMessages = storageService.getAllMessages();
  const calls = storageService.getCalls();

  const totalMessageCount = Object.values(allMessages).reduce((acc, list) => acc + list.length, 0);

  const handleToggleBan = (userId: string) => {
    const updatedUsers = users.map((u) => {
      if (u.id === userId) {
        return { ...u, isBanned: !u.isBanned };
      }
      return u;
    });
    setUsers(updatedUsers);
    storageService.saveAllUsers(updatedUsers);
  };

  const handleToggleRole = (userId: string) => {
    const updatedUsers = users.map((u) => {
      if (u.id === userId) {
        return { ...u, role: (u.role === 'admin' ? 'user' : 'admin') as 'admin' | 'user' };
      }
      return u;
    });
    setUsers(updatedUsers);
    storageService.saveAllUsers(updatedUsers);
  };

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementTitle.trim() || !announcementMsg.trim()) return;

    storageService.broadcastAnnouncement(announcementTitle.trim(), announcementMsg.trim());
    setAnnouncementTitle('');
    setAnnouncementMsg('');
    setBroadcastSuccess(true);
    setTimeout(() => setBroadcastSuccess(false), 3000);
  };

  const filteredUsers = users.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.displayName.toLowerCase().includes(q) ||
      u.rtdId.toLowerCase().includes(q) ||
      u.phoneNumber.includes(q)
    );
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50 select-none overflow-hidden">
      {/* Top Header */}
      <div className="h-14 bg-[#075E54] text-white px-4 flex items-center justify-between shadow-md shrink-0">
        <div className="flex items-center space-x-2">
          <button onClick={onBack} className="p-1 rounded-full hover:bg-white/10">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-1.5">
            <Shield className="w-4 h-4 text-emerald-300" />
            <span className="text-base font-bold">RTD Admin Console</span>
          </div>
        </div>

        <button
          onClick={onOpenBackendMatrix}
          className="text-[11px] bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-2.5 py-1 rounded-lg flex items-center space-x-1 shadow-xs"
        >
          <Cloud className="w-3.5 h-3.5" />
          <span>Cloud Matrix</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* KPI Metrics */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-white p-3 rounded-2xl shadow-xs border border-gray-100">
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="text-[11px] font-semibold">Registered Users</span>
              <Users className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl font-black text-gray-900">{users.length}</div>
            <div className="text-[10px] text-emerald-600 font-medium">All with unique RTD IDs</div>
          </div>

          <div className="bg-white p-3 rounded-2xl shadow-xs border border-gray-100">
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="text-[11px] font-semibold">Chats & Groups</span>
              <MessageSquare className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl font-black text-gray-900">{chats.length}</div>
            <div className="text-[10px] text-gray-400 font-medium">
              {chats.filter((c) => c.isGroup).length} Groups • {totalMessageCount} Msgs
            </div>
          </div>
        </div>

        {/* Backend & Calling Service Notice Card */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-amber-900 text-xs">
          <div className="flex items-center space-x-1.5 font-bold mb-1 text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Cloud & Calling Services Status</span>
          </div>
          <p className="text-[11px] leading-relaxed text-amber-800/90">
            Running with real in-memory & IndexedDB persistence, Web Audio synthesis, and browser media stream calling. To deploy to the Google Play Store, connect Firebase Phone Auth & WebRTC signaling.
          </p>
          <button
            onClick={onOpenBackendMatrix}
            className="mt-2 text-[11px] font-bold text-amber-900 underline hover:text-amber-700"
          >
            Inspect Complete Backend Architecture Checklist →
          </button>
        </div>

        {/* System Broadcast Announcement */}
        <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-4">
          <div className="flex items-center space-x-2 text-xs font-bold text-gray-800 mb-2">
            <Megaphone className="w-4 h-4 text-emerald-600" />
            <span>Send System Announcement to All Users</span>
          </div>

          {broadcastSuccess && (
            <div className="mb-2 p-2 bg-emerald-50 text-emerald-800 rounded-xl text-xs flex items-center space-x-1 border border-emerald-200">
              <Check className="w-3.5 h-3.5" />
              <span>Broadcast announcement sent successfully!</span>
            </div>
          )}

          <form onSubmit={handleBroadcast} className="space-y-2">
            <input
              type="text"
              placeholder="Announcement Title..."
              value={announcementTitle}
              onChange={(e) => setAnnouncementTitle(e.target.value)}
              className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <textarea
              rows={2}
              placeholder="Announcement Message..."
              value={announcementMsg}
              onChange={(e) => setAnnouncementMsg(e.target.value)}
              className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              className="w-full bg-[#00A884] hover:bg-[#008f70] text-white text-xs font-semibold py-2 rounded-xl transition-colors shadow-xs"
            >
              Publish Broadcast
            </button>
          </form>
        </div>

        {/* User Directory Management */}
        <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden">
          <div className="p-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-800">User Directory ({users.length})</span>
            <div className="relative w-44">
              <Search className="w-3 h-3 text-gray-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search user..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-[10px] bg-white border border-gray-200 rounded-lg pl-7 pr-2 py-1 text-gray-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
            {filteredUsers.map((u) => (
              <div key={u.id} className="p-3 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center space-x-2.5">
                  <img src={u.avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover" />
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-xs font-bold text-gray-900">{u.displayName}</span>
                      {u.role === 'admin' && (
                        <span className="text-[9px] bg-purple-100 text-purple-800 font-bold px-1.5 py-0.2 rounded-full">
                          ADMIN
                        </span>
                      )}
                      {u.isBanned && (
                        <span className="text-[9px] bg-red-100 text-red-800 font-bold px-1.5 py-0.2 rounded-full">
                          BANNED
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-gray-500 font-mono">
                      <span className="text-emerald-700 font-bold">{u.rtdId}</span> • {u.phoneNumber}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleToggleRole(u.id)}
                    title={u.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                    className="text-[10px] bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded-md font-medium"
                  >
                    {u.role === 'admin' ? 'User' : 'Admin'}
                  </button>

                  <button
                    onClick={() => handleToggleBan(u.id)}
                    title={u.isBanned ? 'Unban User' : 'Ban User'}
                    className={`text-[10px] px-2 py-1 rounded-md font-medium ${
                      u.isBanned
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-red-50 text-red-700 hover:bg-red-100'
                    }`}
                  >
                    {u.isBanned ? 'Unban' : 'Ban'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
