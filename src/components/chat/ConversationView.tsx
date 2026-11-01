import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Mic,
  Send,
  Smile,
  Image as ImageIcon,
  Check,
  CheckCheck,
  Clock,
  Play,
  Pause,
  Trash2,
  CornerUpLeft,
  X,
  Volume2,
  FileVideo,
  Shield,
  Square,
  Users,
} from 'lucide-react';
import { Chat, Message, RTDUser, MessageType } from '../../types';
import { storageService } from '../../services/storageService';
import { soundService } from '../../services/soundService';

interface ConversationViewProps {
  chat: Chat;
  onBack: () => void;
  onStartVoiceCall: (user: RTDUser) => void;
  onStartVideoCall: (user: RTDUser) => void;
  onOpenMedia: (message: Message) => void;
  onOpenChatInfo?: () => void;
}

const EMOJI_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🔥', '👏'];

export const ConversationView: React.FC<ConversationViewProps> = ({
  chat,
  onBack,
  onStartVoiceCall,
  onStartVideoCall,
  onOpenMedia,
  onOpenChatInfo,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [replyMessage, setReplyMessage] = useState<Message | null>(null);
  const [activeReactionMsgId, setActiveReactionMsgId] = useState<string | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [audioSpeed, setAudioSpeed] = useState<number>(1);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [isPeerTyping, setIsPeerTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const currentUser = storageService.getCurrentUser();
  const allUsers = storageService.getAllUsers();

  // Find other participant for 1-on-1 chat
  const otherUser = !chat.isGroup
    ? allUsers.find((u) => u.id !== currentUser.id && chat.participantIds.includes(u.id)) || {
        id: 'usr_unknown',
        rtdId: 'RTD-000000',
        phoneNumber: '+1 555-000-0000',
        displayName: chat.name,
        avatarUrl: chat.avatarUrl,
        statusMessage: 'Hey there! I am using RTD APP',
        online: true,
        lastSeen: 'online',
        role: 'user',
        createdAt: '',
      }
    : null;

  // Load messages
  const refreshMessages = () => {
    const list = storageService.getMessagesForChat(chat.id);
    setMessages(list);
  };

  useEffect(() => {
    refreshMessages();
  }, [chat.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isPeerTyping]);

  // Voice recording timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRecordingVoice) {
      timer = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRecordingVoice]);

  // Real voice recording via MediaRecorder
  const startVoiceRecording = async () => {
    try {
      soundService.playRecordStart();
      setRecordingSeconds(0);
      setIsRecordingVoice(true);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          sendVoiceMessage(base64Audio, Math.max(1, recordingSeconds));
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
    } catch {
      // Fallback simulated voice note if microphone blocked
      console.warn('Microphone permission not granted, using simulated audio note.');
    }
  };

  const stopVoiceRecording = () => {
    soundService.playRecordStop();
    setIsRecordingVoice(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else {
      // simulated voice note
      sendVoiceMessage(undefined, Math.max(1, recordingSeconds || 4));
    }
    setRecordingSeconds(0);
  };

  const cancelVoiceRecording = () => {
    soundService.playRecordStop();
    setIsRecordingVoice(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    audioChunksRef.current = [];
    setRecordingSeconds(0);
  };

  const sendVoiceMessage = (audioUrl?: string, durationSec = 4) => {
    const newMsg = storageService.sendMessage(chat.id, {
      chatId: chat.id,
      senderId: currentUser.id,
      senderName: currentUser.displayName,
      senderRtdId: currentUser.rtdId,
      senderAvatar: currentUser.avatarUrl,
      type: 'audio',
      content: 'Voice note',
      mediaUrl: audioUrl,
      mediaDuration: durationSec,
      replyTo: replyMessage
        ? {
            id: replyMessage.id,
            senderName: replyMessage.senderName,
            content: replyMessage.content,
            type: replyMessage.type,
          }
        : undefined,
    });
    soundService.playSentMessage();
    setReplyMessage(null);
    refreshMessages();
  };

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const content = inputText.trim();
    setInputText('');

    const newMsg = storageService.sendMessage(chat.id, {
      chatId: chat.id,
      senderId: currentUser.id,
      senderName: currentUser.displayName,
      senderRtdId: currentUser.rtdId,
      senderAvatar: currentUser.avatarUrl,
      type: 'text',
      content,
      replyTo: replyMessage
        ? {
            id: replyMessage.id,
            senderName: replyMessage.senderName,
            content: replyMessage.content,
            type: replyMessage.type,
          }
        : undefined,
    });

    soundService.playSentMessage();
    setReplyMessage(null);
    refreshMessages();

    // Trigger simulated peer response in 1-on-1 chats to demonstrate live two-way messaging & online status
    if (!chat.isGroup && otherUser) {
      setTimeout(() => {
        setIsPeerTyping(true);
      }, 900);

      setTimeout(() => {
        setIsPeerTyping(false);
        const replyAnswers = [
          'Received! The RTD APP Kotlin Compose architecture looks super clean.',
          'Awesome! RTD user ID lookup and messaging are working flawlessly.',
          'Got it! Ready to test voice and video call screens anytime.',
          'Checked! Message reactions, voice waveform, and green bubbles look crisp.',
        ];
        const randomAnswer = replyAnswers[Math.floor(Math.random() * replyAnswers.length)];

        storageService.sendMessage(chat.id, {
          chatId: chat.id,
          senderId: otherUser.id,
          senderName: otherUser.displayName,
          senderRtdId: otherUser.rtdId,
          senderAvatar: otherUser.avatarUrl,
          type: 'text',
          content: randomAnswer,
        });
        soundService.playReceivedMessage();
        refreshMessages();
      }, 2600);
    }
  };

  // Image attachment
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      storageService.sendMessage(chat.id, {
        chatId: chat.id,
        senderId: currentUser.id,
        senderName: currentUser.displayName,
        senderRtdId: currentUser.rtdId,
        senderAvatar: currentUser.avatarUrl,
        type: 'image',
        content: file.name,
        mediaUrl: base64Url,
      });
      soundService.playSentMessage();
      refreshMessages();
      setShowAttachmentMenu(false);
    };
    reader.readAsDataURL(file);
  };

  // Video attachment
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      storageService.sendMessage(chat.id, {
        chatId: chat.id,
        senderId: currentUser.id,
        senderName: currentUser.displayName,
        senderRtdId: currentUser.rtdId,
        senderAvatar: currentUser.avatarUrl,
        type: 'video',
        content: `Video Clip (${(file.size / (1024 * 1024)).toFixed(1)} MB)`,
        mediaUrl: base64Url,
        mediaDuration: 12,
      });
      soundService.playSentMessage();
      refreshMessages();
      setShowAttachmentMenu(false);
    };
    reader.readAsDataURL(file);
  };

  const handleAddReaction = (messageId: string, emoji: string) => {
    storageService.addReaction(chat.id, messageId, emoji, currentUser.id);
    setActiveReactionMsgId(null);
    refreshMessages();
  };

  const handleDeleteMessage = (messageId: string) => {
    storageService.deleteMessage(chat.id, messageId);
    refreshMessages();
  };

  const toggleAudioPlayback = (messageId: string) => {
    if (playingAudioId === messageId) {
      setPlayingAudioId(null);
    } else {
      setPlayingAudioId(messageId);
      // Auto stop after duration
      setTimeout(() => {
        setPlayingAudioId(null);
      }, 5000 / audioSpeed);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#EFEAE2] relative overflow-hidden select-none">
      {/* Subtle Android Chat Wallpaper pattern */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#075E54 1px, transparent 1px)`,
          backgroundSize: '16px 16px',
        }}
      />

      {/* Top App Bar (Android Jetpack Compose TopAppBar) */}
      <div className="h-14 bg-[#075E54] text-white px-3 flex items-center justify-between shadow-md z-20 shrink-0">
        <div className="flex items-center space-x-2">
          <button
            onClick={onBack}
            className="p-1 rounded-full hover:bg-white/10 text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div
            onClick={onOpenChatInfo}
            className="flex items-center space-x-2 cursor-pointer hover:opacity-90"
          >
            <div className="relative">
              <img
                src={chat.avatarUrl}
                alt={chat.name}
                className="w-9 h-9 rounded-full object-cover ring-1 ring-white/20"
              />
              {!chat.isGroup && otherUser?.online && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#075E54] rounded-full"></span>
              )}
            </div>

            <div>
              <div className="text-xs font-bold text-white flex items-center space-x-1.5 leading-tight">
                <span className="truncate max-w-[130px] sm:max-w-[200px]">{chat.name}</span>
                {chat.isGroup && (
                  <span className="text-[10px] bg-emerald-800 text-emerald-200 px-1 rounded">
                    Group
                  </span>
                )}
              </div>
              <div className="text-[10px] text-emerald-100/80 leading-tight">
                {isPeerTyping ? (
                  <span className="text-emerald-300 font-semibold animate-pulse">typing...</span>
                ) : chat.isGroup ? (
                  `${chat.participantIds.length} members`
                ) : otherUser?.online ? (
                  'online'
                ) : (
                  otherUser?.lastSeen || 'recently'
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center space-x-1">
          {!chat.isGroup && otherUser && (
            <>
              <button
                onClick={() => onStartVideoCall(otherUser)}
                title="Video Call"
                className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
              >
                <Video className="w-4 h-4" />
              </button>
              <button
                onClick={() => onStartVoiceCall(otherUser)}
                title="Voice Call"
                className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
              >
                <Phone className="w-4 h-4" />
              </button>
            </>
          )}
          <button
            onClick={onOpenChatInfo}
            title="Chat Info"
            className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 z-10">
        {/* End to end encryption banner */}
        <div className="text-center my-2">
          <div className="inline-flex items-center space-x-1.5 bg-[#FFF9C4]/80 text-[#5D4037] text-[10px] px-3 py-1.5 rounded-lg shadow-2xs border border-[#FFF59D]/60 max-w-[90%]">
            <Shield className="w-3 h-3 text-amber-700 shrink-0" />
            <span>Messages and calls are end-to-end encrypted. No one outside can read or listen.</span>
          </div>
        </div>

        {messages.map((msg) => {
          const isMe = msg.senderId === currentUser.id;
          const showReactions = activeReactionMsgId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex flex-col group ${isMe ? 'items-end' : 'items-start'} relative`}
            >
              {/* Message Bubble */}
              <div
                onContextMenu={(e) => {
                  e.preventDefault();
                  setActiveReactionMsgId(showReactions ? null : msg.id);
                }}
                className={`relative max-w-[82%] sm:max-w-[70%] rounded-2xl px-3 py-2 shadow-xs transition-all ${
                  isMe
                    ? 'bg-[#E7FFDB] text-gray-900 rounded-tr-xs border border-[#D0F0C0]'
                    : 'bg-white text-gray-900 rounded-tl-xs border border-gray-100'
                } ${msg.isDeleted ? 'italic text-gray-400 bg-gray-100' : ''}`}
              >
                {/* Sender Name for group chats */}
                {!isMe && chat.isGroup && (
                  <div className="text-[10px] font-bold text-emerald-800 mb-0.5 flex items-center space-x-1">
                    <span>{msg.senderName}</span>
                    <span className="font-mono text-[9px] text-gray-400 font-normal">
                      {msg.senderRtdId}
                    </span>
                  </div>
                )}

                {/* Quoted Reply if any */}
                {msg.replyTo && (
                  <div className="mb-1.5 p-1.5 bg-black/5 rounded-lg border-l-3 border-emerald-600 text-[10px]">
                    <div className="font-bold text-emerald-800">{msg.replyTo.senderName}</div>
                    <div className="text-gray-600 truncate">{msg.replyTo.content}</div>
                  </div>
                )}

                {/* Photo message */}
                {msg.type === 'image' && msg.mediaUrl && (
                  <div className="mb-1 rounded-xl overflow-hidden cursor-pointer" onClick={() => onOpenMedia(msg)}>
                    <img
                      src={msg.mediaUrl}
                      alt="Attachment"
                      className="max-h-56 w-full object-cover rounded-xl hover:opacity-95 transition-opacity"
                    />
                  </div>
                )}

                {/* Video message */}
                {msg.type === 'video' && (
                  <div className="mb-1 rounded-xl overflow-hidden cursor-pointer relative bg-black" onClick={() => onOpenMedia(msg)}>
                    <video
                      src={msg.mediaUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'}
                      className="max-h-52 w-full object-cover rounded-xl"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/20">
                      <div className="w-10 h-10 rounded-full bg-white/90 text-emerald-700 flex items-center justify-center shadow-md">
                        <Play className="w-5 h-5 ml-0.5 fill-current" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Audio voice note */}
                {msg.type === 'audio' && (
                  <div className="flex items-center space-x-2 py-1 min-w-[200px]">
                    <button
                      onClick={() => toggleAudioPlayback(msg.id)}
                      className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0 hover:bg-emerald-700 transition-colors"
                    >
                      {playingAudioId === msg.id ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      )}
                    </button>

                    {/* Waveform visualizer bars */}
                    <div className="flex-1 flex items-center space-x-0.5 h-6">
                      {[12, 22, 16, 28, 14, 20, 30, 18, 24, 12, 26, 16, 22, 14].map((h, i) => (
                        <div
                          key={i}
                          style={{ height: `${h}px` }}
                          className={`w-1 rounded-full transition-all ${
                            playingAudioId === msg.id
                              ? 'bg-emerald-600 animate-pulse'
                              : 'bg-emerald-300'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Speed multiplier toggle */}
                    <button
                      onClick={() => setAudioSpeed(audioSpeed === 1 ? 1.5 : audioSpeed === 1.5 ? 2 : 1)}
                      className="text-[9px] font-bold bg-white/80 border border-emerald-300 text-emerald-800 px-1.5 py-0.5 rounded-full"
                    >
                      {audioSpeed}x
                    </button>
                  </div>
                )}

                {/* Text Content */}
                {msg.content && msg.type !== 'audio' && (
                  <div className="text-xs leading-relaxed break-words">{msg.content}</div>
                )}

                {/* Bottom Timestamp & Status Checkmarks */}
                <div className="flex items-center justify-end space-x-1 text-[9px] text-gray-500 mt-1">
                  <span>{msg.timestamp}</span>
                  {isMe && !msg.isDeleted && (
                    <span>
                      {msg.status === 'sending' ? (
                        <Clock className="w-3 h-3 text-gray-400" />
                      ) : msg.status === 'sent' ? (
                        <Check className="w-3 h-3 text-gray-400" />
                      ) : (
                        <CheckCheck
                          className={`w-3.5 h-3.5 ${
                            msg.status === 'read' ? 'text-[#34B7F1]' : 'text-gray-400'
                          }`}
                        />
                      )}
                    </span>
                  )}
                </div>

                {/* Display reactions */}
                {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                  <div className="absolute -bottom-2 right-2 flex items-center space-x-0.5 bg-white rounded-full px-1.5 py-0.5 shadow-sm border border-gray-200 text-[10px]">
                    {Object.entries(msg.reactions).map(([emoji, users]) => (
                      <span key={emoji} title={`${users.length} reaction(s)`}>
                        {emoji} {users.length > 1 ? users.length : ''}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Hover quick action bar */}
              <div
                className={`hidden group-hover:flex items-center space-x-1 text-gray-400 my-0.5 ${
                  isMe ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <button
                  onClick={() => setActiveReactionMsgId(showReactions ? null : msg.id)}
                  title="React"
                  className="p-1 hover:text-emerald-700 hover:bg-black/5 rounded-full"
                >
                  <Smile className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setReplyMessage(msg)}
                  title="Reply"
                  className="p-1 hover:text-emerald-700 hover:bg-black/5 rounded-full"
                >
                  <CornerUpLeft className="w-3.5 h-3.5" />
                </button>
                {isMe && !msg.isDeleted && (
                  <button
                    onClick={() => handleDeleteMessage(msg.id)}
                    title="Delete"
                    className="p-1 hover:text-red-600 hover:bg-black/5 rounded-full"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Reaction picker popover */}
              {showReactions && (
                <div className="flex items-center space-x-1.5 bg-white p-1.5 rounded-full shadow-lg border border-gray-200 z-30 my-1 animate-scaleIn">
                  {EMOJI_REACTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleAddReaction(msg.id, emoji)}
                      className="hover:scale-125 transition-transform text-sm p-1 rounded-full hover:bg-gray-100"
                    >
                      {emoji}
                    </button>
                  ))}
                  <button
                    onClick={() => setActiveReactionMsgId(null)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {isPeerTyping && (
          <div className="flex items-center space-x-1.5 bg-white px-3 py-2 rounded-2xl w-fit shadow-xs border border-gray-100">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce"></div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]"></div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]"></div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Reply Quote Banner */}
      {replyMessage && (
        <div className="bg-white/95 px-4 py-2 border-t border-emerald-100 flex items-center justify-between z-20">
          <div className="border-l-4 border-emerald-600 pl-2 text-xs">
            <span className="font-bold text-emerald-800">Replying to {replyMessage.senderName}</span>
            <p className="text-gray-600 truncate max-w-xs text-[11px]">{replyMessage.content}</p>
          </div>
          <button
            onClick={() => setReplyMessage(null)}
            className="p-1 rounded-full text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Attachment options drawer */}
      {showAttachmentMenu && (
        <div className="bg-white p-3 border-t border-gray-200 grid grid-cols-3 gap-3 z-20 shadow-lg animate-slideUp">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-emerald-50 text-gray-700 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-1">
              <ImageIcon className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-medium">Photo</span>
          </button>

          <button
            onClick={() => videoInputRef.current?.click()}
            className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-emerald-50 text-gray-700 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mb-1">
              <FileVideo className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-medium">Video</span>
          </button>

          <button
            onClick={() => {
              // send simulated location
              storageService.sendMessage(chat.id, {
                chatId: chat.id,
                senderId: currentUser.id,
                senderName: currentUser.displayName,
                senderRtdId: currentUser.rtdId,
                senderAvatar: currentUser.avatarUrl,
                type: 'text',
                content: '📍 Live Location shared: 37.7749° N, 122.4194° W (San Francisco, CA)',
              });
              soundService.playSentMessage();
              refreshMessages();
              setShowAttachmentMenu(false);
            }}
            className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-emerald-50 text-gray-700 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mb-1">
              <span className="text-sm">📍</span>
            </div>
            <span className="text-[11px] font-medium">Location</span>
          </button>
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
      <input
        type="file"
        ref={videoInputRef}
        accept="video/*"
        onChange={handleVideoUpload}
        className="hidden"
      />

      {/* Bottom Input Bar (Android Material 3 pill shape) */}
      <div className="p-2 bg-[#F0F2F5] flex items-center space-x-2 z-20 shrink-0 border-t border-gray-200">
        {isRecordingVoice ? (
          /* Live Recording Interface */
          <div className="flex-1 bg-white rounded-full px-4 py-2 flex items-center justify-between border border-emerald-400 shadow-sm animate-pulse">
            <div className="flex items-center space-x-2 text-red-600">
              <div className="w-3 h-3 rounded-full bg-red-600 animate-ping" />
              <span className="text-xs font-mono font-bold">
                0:{recordingSeconds.toString().padStart(2, '0')}
              </span>
              <span className="text-xs font-medium text-gray-600">Recording voice note...</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={cancelVoiceRecording}
                className="text-xs text-red-600 hover:text-red-700 font-semibold px-2"
              >
                Cancel
              </button>
              <button
                onClick={stopVoiceRecording}
                className="w-8 h-8 rounded-full bg-[#00A884] text-white flex items-center justify-center shadow-xs"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </div>
          </div>
        ) : (
          /* Normal Message Input */
          <>
            <div className="flex-1 bg-white rounded-full px-3 py-1.5 flex items-center space-x-2 border border-gray-200 shadow-xs">
              <button
                type="button"
                onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                className="text-gray-500 hover:text-emerald-700 p-1"
                title="Attachments"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <form onSubmit={handleSendText} className="flex-1 flex items-center">
                <input
                  type="text"
                  placeholder="Message..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="w-full text-xs text-gray-900 placeholder:text-gray-400 bg-transparent focus:outline-none"
                />
              </form>
            </div>

            {/* If text is present, show send button. Otherwise show Mic button for voice note */}
            {inputText.trim() ? (
              <button
                onClick={handleSendText}
                className="w-10 h-10 rounded-full bg-[#00A884] hover:bg-[#008f70] text-white flex items-center justify-center shadow-md active:scale-95 transition-all"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            ) : (
              <button
                onClick={startVoiceRecording}
                title="Hold or click to record voice note"
                className="w-10 h-10 rounded-full bg-[#00A884] hover:bg-[#008f70] text-white flex items-center justify-center shadow-md active:scale-95 transition-all"
              >
                <Mic className="w-4 h-4" />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};
