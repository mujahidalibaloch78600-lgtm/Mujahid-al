import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  RefreshCw,
  Shield,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { RTDUser } from '../../types';
import { soundService } from '../../services/soundService';
import { storageService } from '../../services/storageService';

interface VideoCallModalProps {
  isOpen: boolean;
  contact: RTDUser;
  onEndCall: (durationSeconds: number) => void;
}

export const VideoCallModal: React.FC<VideoCallModalProps> = ({
  isOpen,
  contact,
  onEndCall,
}) => {
  const [callState, setCallState] = useState<'connecting' | 'connected'>('connecting');
  const [duration, setDuration] = useState(0);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize camera
  useEffect(() => {
    if (!isOpen) return;

    soundService.startOutgoingRingtone();
    setDuration(0);
    setCallState('connecting');

    // Attempt to access user media
    let localStream: MediaStream | null = null;
    navigator.mediaDevices
      ?.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localStream = stream;
        streamRef.current = stream;
        setHasCameraPermission(true);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        console.warn('Camera access denied or unavailable, using simulation view:', err);
        setHasCameraPermission(false);
      });

    const connectTimeout = setTimeout(() => {
      soundService.stopRingtone();
      setCallState('connected');
    }, 3500);

    return () => {
      clearTimeout(connectTimeout);
      soundService.stopRingtone();
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
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
      type: 'video',
      direction: 'outgoing',
      durationSeconds: duration,
    });
    onEndCall(duration);
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
      }
    }
    setIsVideoMuted(!isVideoMuted);
  };

  const toggleAudio = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
      }
    }
    setIsAudioMuted(!isAudioMuted);
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-between bg-black text-white overflow-hidden select-none animate-fadeIn">
      {/* Background Remote Video Stream (Simulated high-res video peer) */}
      <div className="absolute inset-0 z-0">
        <img
          src={contact.avatarUrl}
          alt={contact.displayName}
          className="w-full h-full object-cover filter brightness-75 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60"></div>
      </div>

      {/* Top Header */}
      <div className="relative z-10 p-5 flex items-start justify-between">
        <div>
          <div className="inline-flex items-center space-x-1.5 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-[11px] text-emerald-300 border border-emerald-500/20 mb-2">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>RTD End-to-End Encrypted</span>
          </div>
          <h2 className="text-lg font-bold drop-shadow-md">{contact.displayName}</h2>
          <div className="text-xs text-white/80 font-mono">
            {contact.rtdId} • {callState === 'connecting' ? 'Connecting video...' : formatDuration(duration)}
          </div>
        </div>

        {/* Picture-in-Picture Local Camera View */}
        <div className="w-24 h-36 sm:w-28 sm:h-40 rounded-2xl overflow-hidden shadow-2xl border-2 border-emerald-500 bg-gray-900 relative">
          {hasCameraPermission && !isVideoMuted ? (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover -scale-x-100"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800 text-gray-400 p-2 text-center">
              <VideoOff className="w-6 h-6 mb-1 text-gray-500" />
              <span className="text-[9px]">Camera Off</span>
            </div>
          )}
          <span className="absolute bottom-1 right-1 bg-black/60 text-[9px] px-1 rounded text-white font-medium">
            You
          </span>
        </div>
      </div>

      {/* Middle status if connecting */}
      {callState === 'connecting' && (
        <div className="relative z-10 flex flex-col items-center justify-center my-auto">
          <div className="w-16 h-16 rounded-full border-4 border-emerald-400 border-t-transparent animate-spin mb-3"></div>
          <span className="text-sm font-semibold tracking-wide text-white drop-shadow">
            Establishing P2P WebRTC Video Stream...
          </span>
        </div>
      )}

      {/* Bottom Floating Controls */}
      <div className="relative z-10 p-6 flex flex-col items-center">
        <div className="flex items-center justify-center space-x-4 mb-2 bg-black/50 backdrop-blur-md px-6 py-3.5 rounded-full border border-white/10 shadow-2xl">
          {/* Flip / Switch Camera */}
          <button
            onClick={() => {
              // Simulated camera flip feedback
              soundService.playSentMessage();
            }}
            title="Switch Camera"
            className="w-12 h-12 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white active:scale-95 transition-all"
          >
            <RefreshCw className="w-5 h-5" />
          </button>

          {/* Toggle Video */}
          <button
            onClick={toggleVideo}
            title={isVideoMuted ? 'Turn Camera On' : 'Turn Camera Off'}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              isVideoMuted ? 'bg-red-500 text-white shadow-md' : 'bg-white/15 hover:bg-white/25 text-white'
            }`}
          >
            {isVideoMuted ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </button>

          {/* Toggle Audio */}
          <button
            onClick={toggleAudio}
            title={isAudioMuted ? 'Unmute Mic' : 'Mute Mic'}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              isAudioMuted ? 'bg-red-500 text-white shadow-md' : 'bg-white/15 hover:bg-white/25 text-white'
            }`}
          >
            {isAudioMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* End Call */}
          <button
            onClick={handleEnd}
            title="End Call"
            className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg active:scale-95 transition-all"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
