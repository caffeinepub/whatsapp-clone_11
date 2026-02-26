import { useParams, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, UserCircle2, Calendar, Clock, User, AtSign, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '../hooks/useAuth';
import { useGetCallerUserProfile } from '../hooks/useQueries';

function ProfileInfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-0.5">
          {label}
        </p>
        <p className="text-sm text-foreground font-medium truncate">{value}</p>
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="bg-card rounded-2xl border border-border p-8 flex flex-col items-center">
        <Skeleton className="w-24 h-24 rounded-full mb-4" />
        <Skeleton className="h-7 w-40 mb-2" />
        <Skeleton className="h-4 w-28 mb-6" />
        <Skeleton className="h-9 w-36" />
      </div>
      <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 py-2">
            <Skeleton className="w-9 h-9 rounded-xl" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function UserDetailPage() {
  const { username } = useParams({ from: '/user/$username' });
  const navigate = useNavigate();
  const { username: currentUser, session } = useAuth();

  const isOwnProfile = currentUser === username;

  // Fetch profile data for the current user's own profile
  const {
    data: callerProfile,
    isLoading: profileLoading,
    isError: profileError,
  } = useGetCallerUserProfile();

  const initials = username ? username.slice(0, 2).toUpperCase() : 'U';

  // Format the session login time as a proxy for "member since" for own profile
  const memberSinceDate = session?.loggedInAt
    ? new Date(session.loggedInAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  const displayName = isOwnProfile && callerProfile?.name ? callerProfile.name : null;

  const showSkeleton = isOwnProfile && profileLoading;

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
        {showSkeleton ? (
          <ProfileSkeleton />
        ) : (
          <>
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

              {/* Display name */}
              {displayName && (
                <h2 className="text-2xl font-bold text-foreground mb-1">{displayName}</h2>
              )}

              {/* Username */}
              <p
                className={`font-semibold text-primary ${displayName ? 'text-base mb-1' : 'text-2xl font-bold text-foreground mb-1'}`}
              >
                @{username}
              </p>

              {/* Badges */}
              <div className="flex items-center gap-2 mt-2 mb-4 flex-wrap justify-center">
                {isOwnProfile && (
                  <Badge
                    variant="secondary"
                    className="bg-primary/20 text-primary border-primary/30 text-xs font-medium"
                  >
                    This is you
                  </Badge>
                )}
                <Badge
                  variant="outline"
                  className="border-border text-muted-foreground text-xs font-medium"
                >
                  <Shield size={10} className="mr-1" />
                  Member
                </Badge>
              </div>

              {isOwnProfile && profileError && (
                <p className="text-xs text-destructive mb-3">
                  Could not load full profile details.
                </p>
              )}
            </div>

            {/* Info rows */}
            <div className="mt-4 bg-card rounded-2xl border border-border px-4 divide-y divide-border/60">
              <ProfileInfoRow
                icon={<AtSign size={16} className="text-primary" />}
                label="Username"
                value={`@${username}`}
              />

              {isOwnProfile && displayName && (
                <ProfileInfoRow
                  icon={<User size={16} className="text-primary" />}
                  label="Display Name"
                  value={displayName}
                />
              )}

              {isOwnProfile && memberSinceDate && (
                <ProfileInfoRow
                  icon={<Calendar size={16} className="text-primary" />}
                  label="Last Login"
                  value={memberSinceDate}
                />
              )}

              <ProfileInfoRow
                icon={<Clock size={16} className="text-primary" />}
                label="Account Status"
                value="Active"
              />
            </div>

            {/* About section */}
            <div className="mt-4 bg-card rounded-2xl border border-border p-4">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <UserCircle2 size={16} className="text-muted-foreground" />
                </div>
                <p>
                  <span className="text-foreground font-medium">@{username}</span>
                  {isOwnProfile
                    ? ' — this is your ChatConnect profile.'
                    : ' is a member of ChatConnect.'}
                </p>
              </div>
            </div>
          </>
        )}
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
