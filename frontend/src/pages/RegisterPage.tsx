import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient, { getApiErrorMessage } from '@/lib/api';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useUiStore } from '@/store/uiStore';
import { ArrowRight } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useUiStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Please enter your name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters.');
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post('/auth/register', {
        name: name.trim(),
        email: email.trim(),
        password,
      });

      showToast('Account created. Please verify your email.', 'success');
      navigate(`/verify-otp?email=${encodeURIComponent(email.trim())}`);
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err));
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
          Create your space
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '15px' }}>
          A quiet place for your tasks.
        </p>
      </div>

      <Card elevated>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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

          <Input
            label="Your name"
            placeholder="e.g. Eleanor Vance"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
            required
            autoFocus
          />

          <Input
            label="Email address"
            type="email"
            placeholder="eleanor@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="Minimum 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
          />

          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            style={{ width: '100%', marginTop: '4px' }}
          >
            <span>Create account</span>
            <ArrowRight size={16} />
          </Button>

          <p
            style={{
              fontSize: '12.5px',
              color: 'var(--color-text-muted)',
              textAlign: 'center',
              lineHeight: 1.5,
              marginTop: '4px',
            }}
          >
            By joining, you embrace an intentional routine free from intrusive alerts and artificial urgency.
          </p>
        </form>
      </Card>

      <div style={{ textAlign: 'center', marginTop: '24px' }}>
        <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
          Already have an account?{' '}
          <Link
            to="/login"
            style={{
              color: 'var(--color-terracotta)',
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};
