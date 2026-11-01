import React, { useState } from 'react';
import {
  X,
  Camera,
  Copy,
  Check,
  QrCode,
  ShieldCheck,
  Edit2,
  Save,
  Phone,
  Sparkles,
  Info,
} from 'lucide-react';
import { RTDUser } from '../../types';
import { storageService } from '../../services/storageService';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated: (user: RTDUser) => void;
}

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&h=256&q=80',
];

const STATUS_PRESETS = [
  'Available',
  'Busy',
  'In a meeting 📞',
  'At work',
  'Battery about to die 🪫',
  'Only urgent calls',
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  onUserUpdated,
}) => {
  const currentUser = storageService.getCurrentUser();
  const [displayName, setDisplayName] = useState(currentUser.displayName);
  const [statusMessage, setStatusMessage] = useState(currentUser.statusMessage);
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [showQr, setShowQr] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    const updated = storageService.updateCurrentUser({
      displayName: displayName.trim() || currentUser.displayName,
      statusMessage: statusMessage.trim() || currentUser.statusMessage,
      avatarUrl,
    });
    onUserUpdated(updated);
    setIsEditingName(false);
    setIsEditingStatus(false);
  };

  const copyRtdId = () => {
    navigator.clipboard.writeText(currentUser.rtdId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 select-none">
      <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden border border-emerald-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#075E54] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-base font-bold">Profile & RTD ID</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Avatar and photo change */}
          <div className="flex flex-col items-center">
            <div className="relative mb-2">
              <img
                src={avatarUrl}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover ring-4 ring-emerald-500/30 shadow-md"
              />
              <div className="absolute bottom-0 right-0 bg-[#00A884] text-white p-2 rounded-full shadow-md">
                <Camera className="w-4 h-4" />
              </div>
            </div>

            <span className="text-[11px] text-gray-500 mb-2">Select Avatar Preset:</span>
            <div className="flex items-center space-x-2">
              {AVATAR_OPTIONS.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setAvatarUrl(img);
                    const updated = storageService.updateCurrentUser({ avatarUrl: img });
                    onUserUpdated(updated);
                  }}
                  className={`w-7 h-7 rounded-full overflow-hidden border-2 transition-transform ${
                    avatarUrl === img
                      ? 'border-emerald-600 scale-110 shadow-xs'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Unique RTD ID Card */}
          <div className="bg-gradient-to-br from-[#075E54] to-emerald-700 text-white p-4 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-200 tracking-wider">
                  Unique User Identifier
                </span>
                <div className="text-2xl font-mono font-black tracking-widest my-0.5">
                  {currentUser.rtdId}
                </div>
              </div>
              <button
                onClick={() => setShowQr(!showQr)}
                className="p-2 bg-white/15 hover:bg-white/25 rounded-xl text-white transition-colors"
                title="View QR Code"
              >
                <QrCode className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-between text-xs text-emerald-100 pt-2 border-t border-white/20 mt-2">
              <span>{currentUser.phoneNumber}</span>
              <button
                onClick={copyRtdId}
                className="bg-white/20 hover:bg-white/30 text-white text-[11px] font-semibold px-2 py-1 rounded-md flex items-center space-x-1"
              >
                {copiedId ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId ? 'Copied' : 'Copy ID'}</span>
              </button>
            </div>

            {/* QR Code preview overlay */}
            {showQr && (
              <div className="mt-3 bg-white p-3 rounded-xl text-center text-gray-800 animate-slideUp">
                <div className="w-28 h-28 mx-auto bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-emerald-400">
                  <div className="text-center p-2">
                    <QrCode className="w-12 h-12 text-emerald-800 mx-auto" />
                    <span className="text-[9px] font-mono font-bold text-gray-600 block mt-1">
                      {currentUser.rtdId}
                    </span>
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 mt-1.5">
                  Scan to immediately start a chat with {currentUser.displayName}
                </p>
              </div>
            )}
          </div>

          {/* Name Editor */}
          <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-gray-500">Your Name</span>
              {!isEditingName ? (
                <button
                  onClick={() => setIsEditingName(true)}
                  className="text-emerald-700 text-xs flex items-center space-x-1"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  className="text-emerald-700 text-xs font-bold flex items-center space-x-1"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
              )}
            </div>

            {isEditingName ? (
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                autoFocus
                className="w-full text-xs bg-white border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            ) : (
              <div className="text-sm font-bold text-gray-900">{currentUser.displayName}</div>
            )}
            <p className="text-[10px] text-gray-400 mt-1">
              This is visible to your RTD contacts and in groups.
            </p>
          </div>

          {/* About / Status Message Editor */}
          <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-gray-500">About & Status</span>
              {!isEditingStatus ? (
                <button
                  onClick={() => setIsEditingStatus(true)}
                  className="text-emerald-700 text-xs flex items-center space-x-1"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  className="text-emerald-700 text-xs font-bold flex items-center space-x-1"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
              )}
            </div>

            {isEditingStatus ? (
              <input
                type="text"
                value={statusMessage}
                onChange={(e) => setStatusMessage(e.target.value)}
                autoFocus
                className="w-full text-xs bg-white border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            ) : (
              <div className="text-xs text-gray-800">{currentUser.statusMessage}</div>
            )}

            {/* Quick Status Presets */}
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {STATUS_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setStatusMessage(preset);
                    const updated = storageService.updateCurrentUser({ statusMessage: preset });
                    onUserUpdated(updated);
                  }}
                  className="text-[10px] bg-white border border-gray-200 text-gray-700 px-2 py-1 rounded-lg hover:border-emerald-500 hover:text-emerald-700 transition-colors"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Phone Number Info */}
          <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block">Phone Number</span>
                <span className="text-xs font-bold text-gray-900">{currentUser.phoneNumber}</span>
              </div>
            </div>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
              <ShieldCheck className="w-3 h-3" />
              <span>Verified</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
