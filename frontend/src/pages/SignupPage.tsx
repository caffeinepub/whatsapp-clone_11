import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '../hooks/useAuth';
import { useRegisterUser, useAuthenticateUser } from '../hooks/useQueries';

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: 'At least 6 characters', pass: password.length >= 6 },
    { label: 'Contains a number', pass: /\d/.test(password) },
    { label: 'Contains a letter', pass: /[a-zA-Z]/.test(password) },
  ];

  if (!password) return null;

  return (
    <div className="space-y-1 mt-1.5">
      {checks.map((check) => (
        <div key={check.label} className="flex items-center gap-1.5 text-xs">
          <CheckCircle2
            size={12}
            className={check.pass ? 'text-primary' : 'text-muted-foreground'}
          />
          <span className={check.pass ? 'text-foreground' : 'text-muted-foreground'}>
            {check.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function SignupPage() {
  const navigate = useNavigate();
  const { saveSession } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');

  const registerMutation = useRegisterUser();
  const authenticateMutation = useAuthenticateUser();

  const validateUsername = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed) return 'Username is required';
    if (trimmed.length < 3) return 'Username must be at least 3 characters';
    if (trimmed.length > 30) return 'Username must be at most 30 characters';
    if (!/^[a-zA-Z0-9_.-]+$/.test(trimmed)) return 'Username can only contain letters, numbers, _, ., -';
    return '';
  };

  const validatePassword = (val: string) => {
    if (!val) return 'Password is required';
    if (val.length < 6) return 'Password must be at least 6 characters';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const usernameError = validateUsername(username);
    if (usernameError) { setError(usernameError); return; }

    const passwordError = validatePassword(password);
    if (passwordError) { setError(passwordError); return; }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Normalize username: trim and lowercase before submission
    const normalizedUsername = username.trim().toLowerCase();

    try {
      await registerMutation.mutateAsync({ username: normalizedUsername, password });
      // Auto-login after registration using the same normalized username
      const success = await authenticateMutation.mutateAsync({ username: normalizedUsername, password });
      if (success) {
        saveSession(normalizedUsername);
        navigate({ to: '/home' });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (
        message.toLowerCase().includes('already taken') ||
        message.toLowerCase().includes('already registered')
      ) {
        setError('This username is already taken. Please choose another.');
      } else {
        setError('Registration failed. Please try again.');
      }
    }
  };

  const isLoading = registerMutation.isPending || authenticateMutation.isPending;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative z-10 animate-fade-in">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-4 shadow-glow">
            <img
              src="/assets/generated/chatconnect-logo.dim_256x256.png"
              alt="ChatConnect"
              className="w-10 h-10 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Create Account</h1>
          <p className="text-muted-foreground text-sm mt-1">Join ChatConnect today</p>
        </div>

        {/* Form Card */}
        <div className="bg-card rounded-2xl border border-border p-6 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-sm font-medium text-foreground">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                autoComplete="username"
                autoFocus
                className="bg-input border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary h-11"
              />
              <p className="text-xs text-muted-foreground">Letters, numbers, _, ., - only (case-insensitive)</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  autoComplete="new-password"
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <PasswordStrength password={password} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  autoComplete="new-password"
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2.5 text-sm text-destructive animate-fade-in">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-xl shadow-glow-sm transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>
        </div>

        {/* Login link */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{' '}
          <button
            onClick={() => navigate({ to: '/login' })}
            className="text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Sign in
          </button>
        </p>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-4 text-center text-xs text-muted-foreground">
        <span>© {new Date().getFullYear()} ChatConnect · Built with </span>
        <span className="text-primary">♥</span>
        <span> using </span>
        <a
          href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'chatconnect')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
