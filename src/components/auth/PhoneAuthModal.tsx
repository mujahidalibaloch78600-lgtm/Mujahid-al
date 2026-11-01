import React, { useState, useEffect } from 'react';
import { Smartphone, CheckCircle, ArrowRight, ShieldCheck, Copy, Sparkles, Image as ImageIcon, Camera, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { RTDUser } from '../../types';
import { storageService } from '../../services/storageService';

interface PhoneAuthModalProps {
  isOpen: boolean;
  onSuccess: (user: RTDUser) => void;
  onClose?: () => void;
}

const COUNTRY_CODES = [
  { country: 'United States', code: '+1', flag: '🇺🇸' },
  { country: 'Pakistan', code: '+92', flag: '🇵🇰' },
  { country: 'India', code: '+91', flag: '🇮🇳' },
  { country: 'United Kingdom', code: '+44', flag: '🇬🇧' },
  { country: 'United Arab Emirates', code: '+971', flag: '🇦🇪' },
  { country: 'Germany', code: '+49', flag: '🇩🇪' },
  { country: 'Canada', code: '+1', flag: '🇨🇦' },
  { country: 'Saudi Arabia', code: '+966', flag: '🇸🇦' },
  { country: 'Australia', code: '+61', flag: '🇦🇺' },
];

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&h=256&q=80',
];

export const PhoneAuthModal: React.FC<PhoneAuthModalProps> = ({
  isOpen,
  onSuccess,
  onClose,
}) => {
  const [step, setStep] = useState<'phone' | 'otp' | 'profile' | 'welcome'>('phone');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const [displayName, setDisplayName] = useState('');
  const [statusMessage, setStatusMessage] = useState('Hey there! I am using RTD APP 💬');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_PRESETS[0]);
  const [createdUser, setCreatedUser] = useState<RTDUser | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Countdown timer for OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp' && countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  if (!isOpen) return null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    if (cleanNumber.length < 7) {
      setErrorMsg('Please enter a valid phone number');
      return;
    }
    setErrorMsg('');
    setCountdown(60);
    setStep('otp');
  };

  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) {
      // Handle paste
      const pasted = val.replace(/\D/g, '').slice(0, 6).split('');
      const newOtp = [...otpDigits];
      pasted.forEach((char, i) => {
        if (i < 6) newOtp[i] = char;
      });
      setOtpDigits(newOtp);
      return;
    }

    const newDigits = [...otpDigits];
    newDigits[index] = val;
    setOtpDigits(newDigits);

    // auto advance
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerifyOtp = () => {
    const code = otpDigits.join('');
    if (code.length < 6) {
      setErrorMsg('Please enter the 6-digit OTP code');
      return;
    }
    setErrorMsg('');
    setStep('profile');
  };

  const handleFillDemoOtp = () => {
    setOtpDigits(['1', '2', '3', '4', '5', '6']);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setErrorMsg('Please enter your full name');
      return;
    }
    const fullPhone = `${selectedCountry.code} ${phoneNumber}`;
    const user = storageService.registerUser(fullPhone, displayName.trim(), selectedAvatar);
    if (statusMessage.trim()) {
      storageService.updateCurrentUser({ statusMessage: statusMessage.trim() });
      user.statusMessage = statusMessage.trim();
    }
    setCreatedUser(user);

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#00A884', '#25D366', '#128C7E', '#34B7F1'],
      });
    } catch {
      // ignore
    }

    setStep('welcome');
  };

  const handleCopyRtdId = () => {
    if (createdUser?.rtdId) {
      navigator.clipboard.writeText(createdUser.rtdId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2500);
    }
  };

  const handleComplete = () => {
    if (createdUser) {
      onSuccess(createdUser);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden border border-emerald-100 flex flex-col">
        {/* Header Bar */}
        <div className="bg-[#075E54] px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-300/30">
              <span className="text-emerald-300 font-black text-sm">RTD</span>
            </div>
            <div>
              <h2 className="text-base font-bold leading-tight">RTD APP Registration</h2>
              <p className="text-[11px] text-emerald-100/80">Android Kotlin & Jetpack Compose</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white text-xs px-2 py-1 rounded-md hover:bg-white/10"
            >
              Skip
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 text-xs bg-red-50 text-red-700 p-2.5 rounded-xl border border-red-200">
              {errorMsg}
            </div>
          )}

          {/* STEP 1: Phone Number */}
          {step === 'phone' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="text-center mb-5">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <Smartphone className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-gray-900">Enter your phone number</h3>
                <p className="text-xs text-gray-500 mt-1">
                  RTD APP will send a 6-digit one-time verification password via SMS.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Country / Region
                </label>
                <select
                  value={selectedCountry.code}
                  onChange={(e) => {
                    const found = COUNTRY_CODES.find((c) => c.code === e.target.value);
                    if (found) setSelectedCountry(found);
                  }}
                  className="w-full text-xs bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {COUNTRY_CODES.map((c, i) => (
                    <option key={i} value={c.code}>
                      {c.flag} {c.country} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Phone Number
                </label>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold bg-gray-100 text-gray-700 px-3 py-2.5 rounded-xl border border-gray-300">
                    {selectedCountry.code}
                  </span>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="555-019-2831"
                    autoFocus
                    className="flex-1 text-xs bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-100 text-[11px] text-emerald-800 flex items-start space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Every user is assigned a permanent, unique <strong>RTD User ID</strong> (e.g. RTD-849201) upon verification.
                </span>
              </div>

              <button
                type="submit"
                className="w-full bg-[#00A884] hover:bg-[#008f70] text-white font-semibold text-xs py-3 rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5"
              >
                <span>Continue & Request OTP</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 2: OTP Verification */}
          {step === 'otp' && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-inner">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-gray-900">Verify your number</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Code sent to <span className="font-semibold text-gray-800">{selectedCountry.code} {phoneNumber}</span>
                </p>
                <button
                  onClick={() => setStep('phone')}
                  className="text-[11px] text-emerald-600 hover:underline font-medium mt-0.5"
                >
                  Edit phone number
                </button>
              </div>

              {/* 6 Digit Input Boxes */}
              <div className="flex justify-between space-x-1.5 my-3">
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-input-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !digit && index > 0) {
                        const prev = document.getElementById(`otp-input-${index - 1}`);
                        prev?.focus();
                      }
                    }}
                    className="w-10 h-12 text-center text-lg font-bold bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-gray-900"
                  />
                ))}
              </div>

              {/* Demo Helper Button */}
              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={handleFillDemoOtp}
                  className="text-emerald-700 hover:text-emerald-800 font-medium flex items-center space-x-1 text-[11px] bg-emerald-50 px-2 py-1 rounded-md"
                >
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  <span>Auto-fill Demo OTP (123456)</span>
                </button>

                <span className="text-gray-400 text-[11px]">
                  {countdown > 0 ? (
                    `Resend in ${countdown}s`
                  ) : (
                    <button
                      onClick={() => setCountdown(60)}
                      className="text-emerald-600 font-semibold hover:underline"
                    >
                      Resend OTP
                    </button>
                  )}
                </span>
              </div>

              <button
                type="button"
                onClick={handleVerifyOtp}
                className="w-full bg-[#00A884] hover:bg-[#008f70] text-white font-semibold text-xs py-3 rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5 mt-2"
              >
                <span>Verify & Proceed</span>
                <CheckCircle className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 3: Profile Setup */}
          {step === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="text-center mb-3">
                <h3 className="text-base font-bold text-gray-900">Set Up Your Profile</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Choose an avatar and enter how friends will see you.
                </p>
              </div>

              {/* Avatar Selector */}
              <div className="flex flex-col items-center">
                <div className="relative mb-2">
                  <img
                    src={selectedAvatar}
                    alt="Selected Avatar"
                    className="w-20 h-20 rounded-full object-cover ring-3 ring-emerald-500 shadow-md"
                  />
                  <div className="absolute bottom-0 right-0 bg-[#00A884] p-1.5 rounded-full text-white shadow-sm">
                    <Camera className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="flex items-center space-x-2 mt-1">
                  {AVATAR_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedAvatar(preset)}
                      className={`w-7 h-7 rounded-full overflow-hidden border-2 transition-all ${
                        selectedAvatar === preset
                          ? 'border-emerald-600 scale-110 shadow-xs'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={preset} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Alex Johnson"
                  autoFocus
                  className="w-full text-xs bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  About / Status Message
                </label>
                <input
                  type="text"
                  value={statusMessage}
                  onChange={(e) => setStatusMessage(e.target.value)}
                  placeholder="Available, Busy, At work..."
                  className="w-full text-xs bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#00A884] hover:bg-[#008f70] text-white font-semibold text-xs py-3 rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5"
              >
                <span>Complete Profile & Generate RTD ID</span>
                <Sparkles className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 4: Welcome & Unique RTD ID Card */}
          {step === 'welcome' && createdUser && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle className="w-9 h-9" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900">Welcome to RTD APP!</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Your phone was verified and your unique RTD ID has been generated.
                </p>
              </div>

              {/* Unique RTD ID Badge */}
              <div className="bg-gradient-to-br from-emerald-600 to-[#075E54] text-white p-4 rounded-2xl shadow-lg relative overflow-hidden text-left">
                <div className="absolute top-2 right-2 text-white/10 font-black text-4xl select-none pointer-events-none">
                  RTD
                </div>
                <div className="text-[10px] uppercase font-bold text-emerald-200 tracking-wider">
                  Unique User Identifier
                </div>
                <div className="text-2xl font-mono font-black tracking-widest my-1 flex items-center justify-between">
                  <span>{createdUser.rtdId}</span>
                  <button
                    onClick={handleCopyRtdId}
                    className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded-md flex items-center space-x-1 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedId ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <div className="text-xs text-emerald-100/90 pt-1 border-t border-white/20 flex items-center justify-between">
                  <span>{createdUser.displayName}</span>
                  <span>{createdUser.phoneNumber}</span>
                </div>
              </div>

              <p className="text-[11px] text-gray-500">
                Friends can find and message you using either your phone number or this RTD ID.
              </p>

              <button
                type="button"
                onClick={handleComplete}
                className="w-full bg-[#00A884] hover:bg-[#008f70] text-white font-semibold text-xs py-3 rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5"
              >
                <span>Start Messaging</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
