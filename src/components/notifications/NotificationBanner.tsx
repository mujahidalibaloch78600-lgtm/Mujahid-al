import React from 'react';
import { MessageSquare, X, CornerUpLeft } from 'lucide-react';
import { Message } from '../../types';

interface NotificationBannerProps {
  message: Message | null;
  onOpenMessage: (message: Message) => void;
  onDismiss: () => void;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  message,
  onOpenMessage,
  onDismiss,
}) => {
  if (!message) return null;

  return (
    <div className="bg-[#1E1E1E]/95 backdrop-blur-md text-white p-3 rounded-2xl shadow-2xl border border-white/10 flex items-center justify-between select-none animate-slideDown">
      <div
        onClick={() => onOpenMessage(message)}
        className="flex items-center space-x-3 cursor-pointer flex-1 min-w-0"
      >
        <img
          src={message.senderAvatar}
          alt={message.senderName}
          className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500 shrink-0"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-white truncate">
              {message.senderName}
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">
              {message.senderRtdId}
            </span>
            <span className="text-[10px] text-gray-400 ml-auto">now</span>
          </div>

          <p className="text-xs text-gray-200 truncate mt-0.5">
            {message.type === 'audio'
              ? '🎤 Voice note'
              : message.type === 'image'
              ? '📷 Photo'
              : message.type === 'video'
              ? '🎥 Video'
              : message.content}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-1 ml-2">
        <button
          onClick={() => onOpenMessage(message)}
          className="p-1.5 rounded-full hover:bg-white/20 text-emerald-400"
          title="Open Chat"
        >
          <CornerUpLeft className="w-4 h-4" />
        </button>
        <button
          onClick={onDismiss}
          className="p-1.5 rounded-full hover:bg-white/20 text-gray-400 hover:text-white"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
