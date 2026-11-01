import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, PhoneOff, Shield, Grid, User } from 'lucide-react';
import { RTDUser } from '../../types';
import { soundService } from '../../services/soundService';
import { storageService } from '../../services/storageService';

interface VoiceCallModalProps {
  isOpen: boolean;
  contact: RTDUser;
  onEndCall: (durationSeconds: number) => void;
}

export const VoiceCallModal: React.FC<VoiceCallModalProps> = ({
  isOpen,
  contact,
  onEndCall,
}) => {
  const [callState, setCallState] = useState<'calling' | 'ringing' | 'connected'>('calling');
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [showKeypad, setShowKeypad] = useState(false);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!isOpen) return;

    soundService.startOutgoingRingtone();
    setDuration(0);
    setCallState('calling');

    const ringTimeout = setTimeout(() => {
      setCallState('ringing');
    }, 1500);

    const connectTimeout = setTimeout(() => {
      soundService.stopRingtone();
      setCallState('connected');
    }, 4000);

    return () => {
      clearTimeout(ringTimeout);
      clearTimeout(connectTimeout);
      soundService.stopRingtone();
    };
  }, [isOpen]);

  // Duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOpen && callState === 'connected') {
      interval = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, callState]);

  if (!isOpen) return null;

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleEnd = () => {
    soundService.playCallEnded();
    const currentUser = storageService.getCurrentUser();
    storageService.logCall({
      callerId: currentUser.id,
      callerName: currentUser.displayName,
      callerAvatar: currentUser.avatarUrl,
      receiverId: contact.id,
      receiverName: contact.displayName,
      receiverAvatar: contact.avatarUrl,
      type: 'voice',
      direction: 'outgoing',
      durationSeconds: duration,
    });
    onEndCall(duration);
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-between bg-gradient-to-b from-[#075E54] via-[#094840] to-[#042823] text-white p-6 select-none animate-fadeIn">
      {/* Top Bar with Security Badge */}
      <div className="text-center pt-2">
        <div className="inline-flex items-center space-x-1.5 bg-black/20 backdrop-blur-md px-3 py-1 rounded-full text-[11px] text-emerald-200 border border-emerald-400/20">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>RTD End-to-End Encrypted Voice</span>
        </div>
      </div>

      {/* Middle: Callee Info & Pulsing Avatar */}
      <div className="flex flex-col items-center justify-center my-auto">
        <div className="relative mb-6">
          {callState !== 'connected' ? (
            <>
              <div className="absolute inset-0 rounded-full bg-emerald-400/30 animate-ping"></div>
              <div className="absolute -inset-4 rounded-full bg-emerald-400/20 animate-pulse"></div>
            </>
          ) : (
            <div className="absolute -inset-2 rounded-full bg-emerald-500/30 animate-pulse"></div>
          )}

          <img
            src={contact.avatarUrl}
            alt={contact.displayName}
            className="relative w-32 h-32 rounded-full object-cover ring-4 ring-emerald-400/40 shadow-2xl"
          />
        </div>

        <h2 className="text-xl font-bold tracking-wide">{contact.displayName}</h2>
        <div className="text-xs font-mono text-emerald-300 font-semibold mt-1">
          {contact.rtdId}
        </div>
        <p className="text-xs text-white/70 mt-0.5">{contact.phoneNumber}</p>

        {/* Call Status / Timer */}
        <div className="mt-4 text-sm font-semibold tracking-wider text-emerald-100">
          {callState === 'calling' && 'Calling...'}
          {callState === 'ringing' && 'Ringing...'}
          {callState === 'connected' && formatDuration(duration)}
        </div>
      </div>

      {/* Dialpad view if toggled */}
      {showKeypad && (
        <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto my-4 bg-black/30 p-4 rounded-2xl backdrop-blur-md">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((k) => (
            <button
              key={k}
              className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-base flex items-center justify-center active:scale-95 transition-transform"
            >
              {k}
            </button>
          ))}
        </div>
      )}

      {/* Action Controls */}
      <div className="pb-6">
        <div className="flex items-center justify-center space-x-6 mb-8">
          {/* Mute */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
              isMuted ? 'bg-white text-gray-900 shadow-lg' : 'bg-white/15 text-white hover:bg-white/25'
            }`}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          {/* Keypad */}
          <button
            onClick={() => setShowKeypad(!showKeypad)}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
              showKeypad ? 'bg-white text-gray-900 shadow-lg' : 'bg-white/15 text-white hover:bg-white/25'
            }`}
          >
            <Grid className="w-6 h-6" />
          </button>

          {/* Speaker */}
          <button
            onClick={() => setIsSpeaker(!isSpeaker)}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
              isSpeaker ? 'bg-white text-gray-900 shadow-lg' : 'bg-white/15 text-white hover:bg-white/25'
            }`}
          >
            {isSpeaker ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
          </button>
        </div>

        {/* End Call Button */}
        <div className="flex justify-center">
          <button
            onClick={handleEnd}
            className="w-18 h-18 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-xl active:scale-95 transition-transform"
          >
            <PhoneOff className="w-8 h-8" />
          </button>
        </div>
      </div>
    </div>
  );
};
