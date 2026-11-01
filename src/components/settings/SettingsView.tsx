import React, { useState } from 'react';
import {
  ArrowLeft,
  Lock,
  Eye,
  CheckCheck,
  ShieldAlert,
  Bell,
  Database,
  Download,
  Trash2,
  Moon,
  Sun,
  Shield,
  Smartphone,
  Check,
} from 'lucide-react';
import { PrivacySettings } from '../../types';
import { storageService } from '../../services/storageService';

interface SettingsViewProps {
  onBack: () => void;
  onResetData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onBack, onResetData }) => {
  const [privacy, setPrivacy] = useState<PrivacySettings>(storageService.getPrivacySettings());
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [notificationSound, setNotificationSound] = useState(true);
  const [vibrate, setVibrate] = useState(true);

  const currentUser = storageService.getCurrentUser();

  const handleUpdatePrivacy = (updates: Partial<PrivacySettings>) => {
    const updated = { ...privacy, ...updates };
    setPrivacy(updated);
    storageService.savePrivacySettings(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const exportBackup = () => {
    const data = {
      user: currentUser,
      chats: storageService.getChats(),
      messages: storageService.getAllMessages(),
      calls: storageService.getCalls(),
      privacy,
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rtd_app_backup_${currentUser.rtdId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50 select-none overflow-hidden">
      {/* Top App Bar */}
      <div className="h-14 bg-[#075E54] text-white px-4 flex items-center justify-between shadow-md shrink-0">
        <div className="flex items-center space-x-3">
          <button onClick={onBack} className="p-1 rounded-full hover:bg-white/10">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-base font-bold">Settings & Privacy</span>
        </div>
        {saveSuccess && (
          <span className="text-xs text-emerald-300 font-semibold flex items-center space-x-1">
            <Check className="w-3.5 h-3.5" />
            <span>Saved</span>
          </span>
        )}
      </div>

      {/* Settings Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* User Card */}
        <div className="bg-white p-4 rounded-2xl shadow-xs border border-gray-100 flex items-center space-x-3">
          <img
            src={currentUser.avatarUrl}
            alt=""
            className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-500/20"
          />
          <div>
            <div className="text-sm font-bold text-gray-900">{currentUser.displayName}</div>
            <div className="text-xs text-emerald-700 font-mono font-bold">{currentUser.rtdId}</div>
            <div className="text-[11px] text-gray-400">{currentUser.phoneNumber}</div>
          </div>
        </div>

        {/* Section: Privacy & Security */}
        <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 bg-emerald-50/50 border-b border-gray-100 flex items-center space-x-2">
            <Lock className="w-4 h-4 text-emerald-700" />
            <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
              Privacy Controls
            </span>
          </div>

          <div className="p-4 space-y-4 divide-y divide-gray-100">
            {/* Last Seen Visibility */}
            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-1">
                Who can see my Last Seen & Online
              </label>
              <select
                value={privacy.lastSeenVisibility}
                onChange={(e) =>
                  handleUpdatePrivacy({
                    lastSeenVisibility: e.target.value as 'everyone' | 'contacts' | 'nobody',
                  })
                }
                className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="everyone">Everyone</option>
                <option value="contacts">My Contacts Only</option>
                <option value="nobody">Nobody</option>
              </select>
              <p className="text-[10px] text-gray-400 mt-1">
                If you don't share your last seen, you won't be able to see others' last seen.
              </p>
            </div>

            {/* Profile Photo Visibility */}
            <div className="pt-3">
              <label className="block text-xs font-semibold text-gray-800 mb-1">
                Who can see my Profile Photo
              </label>
              <select
                value={privacy.profilePhotoVisibility}
                onChange={(e) =>
                  handleUpdatePrivacy({
                    profilePhotoVisibility: e.target.value as 'everyone' | 'contacts' | 'nobody',
                  })
                }
                className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="everyone">Everyone</option>
                <option value="contacts">My Contacts Only</option>
                <option value="nobody">Nobody</option>
              </select>
            </div>

            {/* Read Receipts */}
            <div className="pt-3 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-gray-800 block">Read Receipts</span>
                <span className="text-[10px] text-gray-400">
                  Show blue double checks when messages are read.
                </span>
              </div>
              <input
                type="checkbox"
                checked={privacy.readReceipts}
                onChange={(e) => handleUpdatePrivacy({ readReceipts: e.target.checked })}
                className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Section: Push Notifications */}
        <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 bg-emerald-50/50 border-b border-gray-100 flex items-center space-x-2">
            <Bell className="w-4 h-4 text-emerald-700" />
            <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
              Push Notifications (FCM)
            </span>
          </div>

          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-gray-800 block">Conversation Tones</span>
                <span className="text-[10px] text-gray-400">Play sounds for incoming and outgoing messages</span>
              </div>
              <input
                type="checkbox"
                checked={notificationSound}
                onChange={(e) => setNotificationSound(e.target.checked)}
                className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div>
                <span className="text-xs font-semibold text-gray-800 block">Vibrate</span>
                <span className="text-[10px] text-gray-400">Haptic vibration on message arrival</span>
              </div>
              <input
                type="checkbox"
                checked={vibrate}
                onChange={(e) => setVibrate(e.target.checked)}
                className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Section: Data & Backup */}
        <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 bg-emerald-50/50 border-b border-gray-100 flex items-center space-x-2">
            <Database className="w-4 h-4 text-emerald-700" />
            <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
              Chats Backup & Data
            </span>
          </div>

          <div className="p-4 space-y-3">
            <button
              onClick={exportBackup}
              className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold py-2.5 px-3 rounded-xl flex items-center justify-center space-x-2 border border-emerald-200 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export Complete Chat Backup (JSON)</span>
            </button>

            <button
              onClick={() => {
                if (window.confirm('Reset local test messages, chats and reset to sample state?')) {
                  onResetData();
                }
              }}
              className="w-full bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold py-2.5 px-3 rounded-xl flex items-center justify-center space-x-2 border border-red-200 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Reset Database to Sample Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
