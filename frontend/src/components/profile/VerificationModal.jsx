import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, Mail, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import api from '../../utils/axiosApi.util';
import { useAuth } from '../../context/AuthContext';

const VerificationModal = ({ isOpen, onClose, user, onVerifiedSuccess }) => {
  const { setUser } = useAuth();

  const [step, setStep] = useState(1); // 1: Request Code, 2: Enter Code
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  if (!isOpen) return null;

  const handleStartVerification = async () => {
    setError('');
    setInfoMessage('');
    setLoading(true);

    try {
      const res = await api.get('/users/verify-start');
      setInfoMessage('Verification code sent to your email! Please check your inbox.');
      setStep(2);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckCode = async (e) => {
    e.preventDefault();
    setError('');

    if (!code.trim()) {
      return setError('Please enter the 6-digit verification code');
    }

    setLoading(true);

    try {
      const res = await api.post('/users/verify-check', {
        verificationCode: code.trim(),
      });

      if (setUser) {
        setUser((prev) => ({ ...prev, isVerified: true }));
      }

      if (onVerifiedSuccess) {
        onVerifiedSuccess();
      }

      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white/10 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-[#000000] border border-[#2f3336] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in relative p-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2f3336] pb-4">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-6 h-6 text-[#1d9bf0]" />
            <h3 className="font-bold text-xl text-white">Get Verified</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#181818] text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 bg-red-950/60 border border-red-800/80 rounded-xl flex items-center space-x-3 text-red-200 text-sm animate-fade-in">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Info Message */}
        {infoMessage && (
          <div className="p-3.5 bg-emerald-950/60 border border-emerald-800/80 rounded-xl flex items-center space-x-3 text-emerald-200 text-sm animate-fade-in">
            <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{infoMessage}</span>
          </div>
        )}

        {/* Step 1: Send Code */}
        {step === 1 ? (
          <div className="space-y-5 text-center py-2">
            <div className="w-16 h-16 bg-[#1d9bf0]/10 border border-[#1d9bf0]/30 text-[#1d9bf0] rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-lg text-white">Verify your Cwitter Account</h4>
              <p className="text-xs text-gray-400 leading-relaxed px-4">
                Verified accounts display a blue checkmark badge, confirming authenticity and unlocking official recognition on Cwitter.
              </p>
            </div>

            <div className="p-3 bg-[#16181c] border border-[#2f3336] rounded-2xl flex items-center justify-center space-x-2 text-xs text-gray-300">
              <Mail className="w-4 h-4 text-[#1d9bf0]" />
              <span>Send code to: <strong className="text-white">{user?.email}</strong></span>
            </div>

            <button
              onClick={handleStartVerification}
              disabled={loading}
              className="cwitter-btn-primary"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Sending code...</span>
                </>
              ) : (
                <span>Send Verification Code</span>
              )}
            </button>
          </div>
        ) : (
          /* Step 2: Enter Verification Code */
          <form onSubmit={handleCheckCode} className="space-y-5 py-2">
            <div className="space-y-2 text-center">
              <h4 className="font-bold text-lg text-white">Enter Verification Code</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Enter the 6-digit verification code sent to <span className="text-white font-medium">{user?.email}</span>.
              </p>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  if (error) setError('');
                }}
                placeholder="6-digit code"
                maxLength={6}
                required
                className="cwitter-input text-center text-xl font-mono tracking-widest"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="cwitter-btn-outline flex-1 justify-center"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading || !code.trim()}
                className="cwitter-btn-primary flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <span>Verify Account</span>
                )}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

export default VerificationModal;
