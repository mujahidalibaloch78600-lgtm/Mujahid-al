import React from 'react';
import { X, Download, Share2 } from 'lucide-react';
import { Message } from '../../types';

interface MediaViewerModalProps {
  message: Message | null;
  onClose: () => void;
}

export const MediaViewerModal: React.FC<MediaViewerModalProps> = ({ message, onClose }) => {
  if (!message || (!message.mediaUrl && message.type !== 'video')) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="relative max-w-2xl w-full flex flex-col items-center">
        {/* Top Actions */}
        <div className="w-full flex items-center justify-between text-white pb-3 px-2">
          <div>
            <div className="text-xs font-semibold">{message.senderName}</div>
            <div className="text-[10px] text-white/70">{message.timestamp}</div>
          </div>
          <div className="flex items-center space-x-2">
            {message.mediaUrl && (
              <a
                href={message.mediaUrl}
                download="rtd-media"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
              >
                <Download className="w-4 h-4" />
              </a>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Media Content */}
        <div className="max-h-[75vh] w-full flex items-center justify-center overflow-hidden rounded-2xl bg-black/40">
          {message.type === 'image' && message.mediaUrl && (
            <img
              src={message.mediaUrl}
              alt="Media"
              className="max-h-[75vh] max-w-full object-contain rounded-2xl shadow-2xl"
            />
          )}

          {message.type === 'video' && (
            <video
              src={message.mediaUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'}
              controls
              autoPlay
              className="max-h-[75vh] max-w-full rounded-2xl shadow-2xl"
            />
          )}
        </div>

        {message.content && (
          <div className="mt-3 text-center text-xs text-white/90 bg-black/50 px-4 py-2 rounded-xl backdrop-blur-xs max-w-md">
            {message.content}
          </div>
        )}
      </div>
    </div>
  );
};
