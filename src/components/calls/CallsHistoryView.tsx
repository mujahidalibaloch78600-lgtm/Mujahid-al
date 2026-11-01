import React from 'react';
import {
  Phone,
  Video,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  ArrowDownLeft,
  ArrowUpRight,
  Shield,
} from 'lucide-react';
import { CallRecord, RTDUser } from '../../types';
import { storageService } from '../../services/storageService';

interface CallsHistoryViewProps {
  onStartVoiceCall: (user: RTDUser) => void;
  onStartVideoCall: (user: RTDUser) => void;
}

export const CallsHistoryView: React.FC<CallsHistoryViewProps> = ({
  onStartVoiceCall,
  onStartVideoCall,
}) => {
  const calls = storageService.getCalls();
  const allUsers = storageService.getAllUsers();
  const currentUser = storageService.getCurrentUser();

  const getUserForCall = (call: CallRecord): RTDUser | undefined => {
    const targetId = call.callerId === currentUser.id ? call.receiverId : call.callerId;
    return allUsers.find((u) => u.id === targetId);
  };

  const formatSeconds = (sec: number) => {
    if (sec === 0) return 'Missed';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m > 0 ? `${m}m ` : ''}${s}s`;
  };

  return (
    <div className="flex-1 overflow-y-auto divide-y divide-gray-100 bg-white">
      {/* End to End Security Banner */}
      <div className="px-4 py-3 bg-emerald-50/60 flex items-center justify-center space-x-1.5 text-[11px] text-emerald-800 border-b border-emerald-100">
        <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span>Your personal calls are end-to-end encrypted</span>
      </div>

      {calls.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <Phone className="w-10 h-10 mx-auto text-gray-300 mb-2" />
          <p className="text-xs font-semibold text-gray-700">No call history yet</p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Tap the phone or video icon in any chat to call friends.
          </p>
        </div>
      ) : (
        calls.map((call) => {
          const otherUser = getUserForCall(call);
          const isMissed = call.direction === 'missed';
          const isOutgoing = call.direction === 'outgoing';

          return (
            <div
              key={call.id}
              className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <img
                  src={
                    call.callerId === currentUser.id
                      ? call.receiverAvatar
                      : call.callerAvatar
                  }
                  alt=""
                  className="w-11 h-11 rounded-full object-cover ring-1 ring-gray-200"
                />

                <div>
                  <div className="flex items-center space-x-1.5">
                    <span
                      className={`text-xs font-bold ${
                        isMissed ? 'text-red-600' : 'text-gray-900'
                      }`}
                    >
                      {call.callerId === currentUser.id
                        ? call.receiverName
                        : call.callerName}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5 text-[11px] text-gray-500 mt-0.5">
                    {/* Direction arrow */}
                    {isMissed ? (
                      <ArrowDownLeft className="w-3.5 h-3.5 text-red-500" />
                    ) : isOutgoing ? (
                      <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                    )}

                    <span>{call.timestamp}</span>
                    <span>•</span>
                    <span className="font-medium">{formatSeconds(call.durationSeconds)}</span>
                  </div>
                </div>
              </div>

              {/* Quick Callback Actions */}
              <div className="flex items-center space-x-1">
                {otherUser && (
                  <>
                    <button
                      onClick={() => onStartVoiceCall(otherUser)}
                      title="Voice Call"
                      className="p-2 rounded-full hover:bg-emerald-50 text-emerald-700 hover:text-emerald-800 transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onStartVideoCall(otherUser)}
                      title="Video Call"
                      className="p-2 rounded-full hover:bg-emerald-50 text-emerald-700 hover:text-emerald-800 transition-colors"
                    >
                      <Video className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};
