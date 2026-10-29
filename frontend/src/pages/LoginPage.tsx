import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import apiClient, { getApiErrorMessage } from '@/lib/api';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/store/authStore';
import { useUiStore } from '@/store/uiStore';
import { LoginResponse } from '@/types';
import { ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuthStore();
  const { showToast } = useUiStore();

  const isVerifiedFromRedirect = searchParams.get('verified') === 'true';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isUnverified, setIsUnverified] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsUnverified(false);

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', {
        email: email.trim(),
        password,
      });

      login(response.data);
      showToast(response.data.message || `Welcome back, ${response.data.user.name}`, 'success');
      navigate('/tasks');
    } catch (err: unknown) {
      const msg = getApiErrorMessage(err);
      setErrorMessage(msg);

      if (msg.toLowerCase().includes('not verified') || msg.toLowerCase().includes('verify')) {
        setIsUnverified(true);
      }
    } finally {
      setIsLoading(false);
    }
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
            backgroundColor: 'var(--color-terracotta-tint)',
            color: 'var(--color-terracotta)',
            marginBottom: '16px',
          }}
        >
          <span style={{ fontSize: '20px', fontWeight: 600 }}>✦</span>
        </div>
        <h1
          className="font-serif"
          style={{
            fontSize: '32px',
            letterSpacing: '-0.02em',
            marginBottom: '8px',
          }}
        >
          Welcome back
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '15px' }}>
          Welcome back to your quiet space.
        </p>
      </div>

      <Card elevated>
        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
        >
          {/* Verified alert banner if coming from OTP success */}
          {isVerifiedFromRedirect && (
            <div
              style={{
                backgroundColor: 'var(--color-sage-tint)',
                border: '1px solid rgba(125, 143, 107, 0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                fontSize: '13.5px',
                color: 'var(--color-sage)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <CheckCircle2 size={16} />
              <span>Email verified successfully. You can now log in.</span>
            </div>
          )}

          {/* Unverified Email Warning Banner */}
          {isUnverified && (
            <div
              style={{
                backgroundColor: 'var(--color-terracotta-tint)',
                border: '1px solid rgba(184, 100, 60, 0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                fontSize: '13.5px',
                color: 'var(--color-terracotta)',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertCircle size={16} />
                <strong>Email address has not been verified yet.</strong>
              </div>
              <Link
                to={`/verify-otp?email=${encodeURIComponent(email)}`}
                style={{
                  color: 'var(--color-terracotta)',
                  fontWeight: 600,
                  textDecoration: 'underline',
                  fontSize: '13px',
                }}
              >
                Verify your email →
              </Link>
            </div>
          )}

          {/* Generic Error Message */}
          {errorMessage && !isUnverified && (
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

          <Input
            label="Email address"
            type="email"
            placeholder="eleanor@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
            autoFocus
          />

          <Input
            label="Password"
            type="password"
            placeholder="Your account password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
          />

          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            style={{ width: '100%', marginTop: '6px' }}
          >
            <span>Log in</span>
            <ArrowRight size={16} />
          </Button>
        </form>
      </Card>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '24px',
          fontSize: '13.5px',
        }}
      >
        <p style={{ color: 'var(--color-text-muted)' }}>
          Don't have an account?{' '}
          <Link
            to="/register"
            style={{
              color: 'var(--color-terracotta)',
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            Create one
          </Link>
        </p>
        <span
          style={{
            color: 'var(--color-text-faint)',
            fontSize: '13px',
            cursor: 'not-allowed',
          }}
          title="Password reset via email"
        >
          Forgot password?
        </span>
      </div>
    </div>
  );
};
