import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import apiClient, { getApiErrorMessage } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useUiStore } from '@/store/uiStore';
import { ArrowRight, CheckCircle2, RefreshCw } from 'lucide-react';

export const VerifyOtpPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useUiStore();

  const emailParam = searchParams.get('email') || '';
  const [email, setEmail] = useState(emailParam);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(45);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Handle single digit input and auto-advance
  const handleDigitChange = (index: number, value: string) => {
    // Only accept numeric digit
    const cleaned = value.replace(/\D/g, '');
    const newDigits = [...otpDigits];

    if (!cleaned) {
      newDigits[index] = '';
      setOtpDigits(newDigits);
      return;
    }

    newDigits[index] = cleaned[cleaned.length - 1];
    setOtpDigits(newDigits);

    // Auto-advance to next input
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace retreat
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste full string
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasteData) return;

    const newDigits = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasteData[i] || '';
    }
    setOtpDigits(newDigits);

    const nextFocusIndex = Math.min(pasteData.length, 5);
    inputRefs.current[nextFocusIndex]?.focus();
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit code.');
      return;
    }
    if (!email) {
      setErrorMessage('Email address is missing.');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post('/verify/verify', {
        email: email.trim(),
        otp: fullOtp,
      });

      setIsSuccess(true);
      showToast('Email verified successfully.', 'success');

      setTimeout(() => {
        navigate('/login?verified=true');
      }, 1500);
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || isResending || !email) return;

    setIsResending(true);
    setErrorMessage('');
    try {
      await apiClient.post('/verify/resend', { email: email.trim() });
      showToast('A new 6-digit code has been sent to your inbox.', 'info');
      setCountdown(45);
      setOtpDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err));
    } finally {
      setIsResending(false);
    }
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="auth-container">
      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            backgroundColor: isSuccess ? 'var(--color-sage-tint)' : 'var(--color-terracotta-tint)',
            color: isSuccess ? 'var(--color-sage)' : 'var(--color-terracotta)',
            marginBottom: '16px',
            transition: 'all var(--transition-fast)',
          }}
        >
          {isSuccess ? <CheckCircle2 size={24} /> : <span style={{ fontSize: '20px' }}>✉</span>}
        </div>
        <h1
          className="font-serif"
          style={{
            fontSize: '32px',
            letterSpacing: '-0.02em',
            marginBottom: '8px',
          }}
        >
          {isSuccess ? 'Verification complete' : 'Check your inbox'}
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '15px' }}>
          {isSuccess ? (
            'Your account is ready. Redirecting to login...'
          ) : (
            <>
              We sent a 6-digit code to <strong>{email || 'your email'}</strong>
            </>
          )}
        </p>
      </div>

      <Card elevated>
        <form
          onSubmit={handleVerify}
          style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
        >
          {errorMessage && (
            <div
              style={{
                backgroundColor: 'var(--color-error-bg)',
                border: '1px solid var(--color-error-border)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                fontSize: '13.5px',
                color: 'var(--color-error)',
              }}
            >
              {errorMessage}
            </div>
          )}

          {!emailParam && (
            <div>
              <label
                style={{
                  fontSize: '13.5px',
                  fontWeight: 500,
                  color: 'var(--color-text-main)',
                  display: 'block',
                  marginBottom: '6px',
                }}
              >
                Confirm your email address
              </label>
              <input
                type="email"
                className="input-tranquil"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                required
              />
            </div>
          )}

          {/* 6-Digit OTP Input Grid */}
          <div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(6, 1fr)',
                gap: '8px',
                margin: '8px 0',
              }}
              onPaste={handlePaste}
            >
              {otpDigits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  disabled={isSubmitting || isSuccess}
                  aria-label={`Digit ${index + 1}`}
                  autoFocus={index === 0}
                  style={{
                    width: '100%',
                    height: '52px',
                    textAlign: 'center',
                    fontSize: '22px',
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 600,
                    color: 'var(--color-text-main)',
                    backgroundColor: '#FFFFFF',
                    border: `1.5px solid ${
                      digit
                        ? 'var(--color-terracotta)'
                        : isSuccess
                          ? 'var(--color-sage)'
                          : 'var(--color-border)'
                    }`,
                    borderRadius: 'var(--radius-md)',
                    transition: 'all var(--transition-fast)',
                    outline: 'none',
                  }}
                />
              ))}
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '12px',
                fontSize: '12.5px',
                color: 'var(--color-text-muted)',
              }}
            >
              <span>This code expires in 10 minutes.</span>
              <button
                type="button"
                onClick={handleResend}
                disabled={countdown > 0 || isResending || isSuccess}
                style={{
                  background: 'none',
                  border: 'none',
                  color: countdown > 0 ? 'var(--color-text-faint)' : 'var(--color-terracotta)',
                  cursor: countdown > 0 ? 'not-allowed' : 'pointer',
                  fontWeight: 500,
                  fontSize: '12.5px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {isResending && <RefreshCw size={12} className="spin" />}
                {countdown > 0 ? `Resend code in ${formatCountdown(countdown)}` : 'Resend code'}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="terracotta"
            isLoading={isSubmitting}
            disabled={isSuccess || otpDigits.join('').length !== 6}
            style={{ width: '100%' }}
          >
            <span>Verify code</span>
            <ArrowRight size={16} />
          </Button>
        </form>
      </Card>

      <div style={{ textAlign: 'center', marginTop: '24px' }}>
        <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
          Wrong email address?{' '}
          <Link
            to="/register"
            style={{
              color: 'var(--color-terracotta)',
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            Register again
          </Link>
        </p>
      </div>
    </div>
  );
};
