import React, { useState } from 'react';
import { Users, X, Check, Camera, Sparkles } from 'lucide-react';
import { RTDUser, Chat } from '../../types';
import { storageService } from '../../services/storageService';

interface NewGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGroupCreated: (chat: Chat) => void;
}

const GROUP_AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=256&h=256&q=80',
];

export const NewGroupModal: React.FC<NewGroupModalProps> = ({
  isOpen,
  onClose,
  onGroupCreated,
}) => {
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(GROUP_AVATAR_PRESETS[0]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  const currentUser = storageService.getCurrentUser();
  const availableUsers = storageService.getAllUsers().filter((u) => u.id !== currentUser.id);

  if (!isOpen) return null;

  const toggleUserSelection = (userId: string) => {
    if (selectedUserIds.includes(userId)) {
      setSelectedUserIds(selectedUserIds.filter((id) => id !== userId));
    } else {
      setSelectedUserIds([...selectedUserIds, userId]);
    }
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) {
      setErrorMsg('Please enter a group subject / name');
      return;
    }
    if (selectedUserIds.length === 0) {
      setErrorMsg('Please select at least 1 participant');
      return;
    }

    const newGroup = storageService.createGroupChat(
      groupName.trim(),
      selectedUserIds,
      selectedAvatar,
      description.trim() || undefined
    );
    onGroupCreated(newGroup);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden border border-emerald-100 flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="bg-[#075E54] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-emerald-300" />
            <div>
              <h3 className="text-sm font-bold">New RTD Group</h3>
              <p className="text-[11px] text-emerald-100/80">Add members & group subject</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mx-4 mt-3 text-xs bg-red-50 text-red-700 p-2 rounded-xl border border-red-200">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleCreateGroup} className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Avatar and Group Name */}
          <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-2xl border border-gray-100">
            <div className="relative shrink-0">
              <img
                src={selectedAvatar}
                alt="Group icon"
                className="w-13 h-13 rounded-full object-cover ring-2 ring-emerald-500 shadow-xs"
              />
              <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-1 rounded-full">
                <Camera className="w-3 h-3" />
              </div>
            </div>

            <div className="flex-1">
              <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                Group Name
              </label>
              <input
                type="text"
                placeholder="e.g. Android Devs 🚀"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                autoFocus
                className="w-full text-xs bg-white border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Group Icon Presets */}
          <div>
            <span className="block text-[11px] font-semibold text-gray-600 mb-1.5">
              Choose Group Icon
            </span>
            <div className="flex items-center space-x-2">
              {GROUP_AVATAR_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedAvatar(preset)}
                  className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-all ${
                    selectedAvatar === preset
                      ? 'border-emerald-600 ring-2 ring-emerald-200 scale-105'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={preset} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Group Description */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-700 mb-1">
              Group Description (Optional)
            </label>
            <input
              type="text"
              placeholder="What is this group about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Participants Picker */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-800">
                Select Participants ({selectedUserIds.length})
              </span>
              <span className="text-[11px] text-gray-400">
                {availableUsers.length} contacts available
              </span>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {availableUsers.map((user) => {
                const isSelected = selectedUserIds.includes(user.id);
                return (
                  <div
                    key={user.id}
                    onClick={() => toggleUserSelection(user.id)}
                    className={`flex items-center justify-between p-2 rounded-xl cursor-pointer border transition-colors ${
                      isSelected
                        ? 'bg-emerald-50/70 border-emerald-300'
                        : 'bg-white border-gray-100 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <img
                        src={user.avatarUrl}
                        alt={user.displayName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <div className="text-xs font-semibold text-gray-900">{user.displayName}</div>
                        <div className="text-[10px] text-emerald-700 font-mono font-bold">
                          {user.rtdId}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${
                        isSelected
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-[#00A884] hover:bg-[#008f70] text-white font-semibold text-xs py-3 rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5"
          >
            <span>Create Group Chat</span>
            <Sparkles className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
