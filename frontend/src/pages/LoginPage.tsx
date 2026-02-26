import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { MessageCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '../hooks/useAuth';
import { useAuthenticateUser } from '../hooks/useQueries';

export default function LoginPage() {
  const navigate = useNavigate();
  const { saveSession } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const authenticateMutation = useAuthenticateUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Username is required');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }

    try {
      const success = await authenticateMutation.mutateAsync({ username: username.trim(), password });
      if (success) {
        saveSession(username.trim());
        navigate({ to: '/home' });
      } else {
        setError('Invalid username or password');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes('does not exist')) {
        setError('No account found with this username');
      } else {
        setError('Login failed. Please try again.');
      }
    }
  };

  const isLoading = authenticateMutation.isPending;

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
                e.currentTarget.parentElement!.innerHTML = '<span class="text-primary"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg></span>';
              }}
            />
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">ChatConnect</h1>
          <p className="text-muted-foreground text-sm mt-1">Sign in to your account</p>
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
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                autoComplete="username"
                autoFocus
                className="bg-input border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary h-11"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  autoComplete="current-password"
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
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </div>

        {/* Sign up link */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Don't have an account?{' '}
          <button
            onClick={() => navigate({ to: '/signup' })}
            className="text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Sign up
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
