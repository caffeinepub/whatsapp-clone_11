import { useParams, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, MessageCircle, UserCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '../hooks/useAuth';

export default function UserDetailPage() {
  const { username } = useParams({ from: '/user/$username' });
  const navigate = useNavigate();
  const { username: currentUser } = useAuth();

  const initials = username ? username.slice(0, 2).toUpperCase() : 'U';
  const isOwnProfile = currentUser === username;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: '/home' })}
            className="text-muted-foreground hover:text-foreground rounded-full w-9 h-9"
          >
            <ArrowLeft size={18} />
          </Button>
          <h1 className="text-base font-semibold text-foreground">User Profile</h1>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-8 animate-fade-in">
        {/* Profile card */}
        <div className="bg-card rounded-2xl border border-border p-8 flex flex-col items-center text-center shadow-xs">
          {/* Avatar */}
          <div className="relative mb-4">
            <Avatar className="w-24 h-24">
              <AvatarFallback className="bg-primary/20 text-primary font-bold text-3xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-glow-sm">
              <UserCircle2 size={14} className="text-primary-foreground" />
            </div>
          </div>

          {/* Username */}
          <h2 className="text-2xl font-bold text-foreground mb-1">@{username}</h2>
          {isOwnProfile && (
            <span className="inline-flex items-center gap-1 text-xs bg-primary/20 text-primary px-2.5 py-1 rounded-full font-medium mb-3">
              This is you
            </span>
          )}

          <p className="text-muted-foreground text-sm mb-6">
            {isOwnProfile
              ? 'This is your profile'
              : `Send a message to @${username}`}
          </p>

          {/* Action button */}
          {!isOwnProfile && (
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-xl px-6 shadow-glow-sm"
              disabled
            >
              <MessageCircle size={16} className="mr-2" />
              Message (Coming Soon)
            </Button>
          )}
        </div>

        {/* Info card */}
        <div className="mt-4 bg-card rounded-2xl border border-border p-4">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <UserCircle2 size={16} className="text-muted-foreground" />
            </div>
            <p>
              <span className="text-foreground font-medium">@{username}</span> is a member of ChatConnect
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-muted-foreground border-t border-border/50">
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
