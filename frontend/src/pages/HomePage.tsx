import { useState, useEffect, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Search, LogOut, MessageCircle, User, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '../hooks/useAuth';
import { useSearchUsers } from '../hooks/useQueries';

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function UserListItem({ username, onClick }: { username: string; onClick: () => void }) {
  const initials = username.slice(0, 2).toUpperCase();
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors rounded-xl group"
    >
      <Avatar className="w-11 h-11 shrink-0">
        <AvatarFallback className="bg-primary/20 text-primary font-semibold text-sm">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 text-left min-w-0">
        <p className="font-medium text-foreground truncate">@{username}</p>
        <p className="text-xs text-muted-foreground">Tap to view profile</p>
      </div>
      <MessageCircle size={16} className="text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
    </button>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const { username, clearSession } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 300);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: searchResults, isLoading: isSearching } = useSearchUsers(debouncedQuery);

  const handleLogout = () => {
    clearSession();
    navigate({ to: '/login' });
  };

  const handleUserClick = (targetUsername: string) => {
    navigate({ to: '/user/$username', params: { username: targetUsername } });
  };

  const clearSearch = () => {
    setSearchQuery('');
    inputRef.current?.focus();
  };

  const initials = username ? username.slice(0, 2).toUpperCase() : 'U';
  const hasQuery = debouncedQuery.trim().length > 0;
  const hasResults = searchResults && searchResults.length > 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <img
                src="/assets/generated/chatconnect-logo.dim_256x256.png"
                alt="ChatConnect"
                className="w-5 h-5 object-contain"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">ChatConnect</h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-secondary/50 rounded-full px-3 py-1.5">
              <Avatar className="w-6 h-6">
                <AvatarFallback className="bg-primary/30 text-primary text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-foreground hidden sm:block">
                {username}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full w-8 h-8"
              title="Sign out"
            >
              <LogOut size={16} />
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6">
        {/* Welcome section */}
        <div className="mb-6 animate-fade-in">
          <h2 className="text-xl font-semibold text-foreground">
            Welcome back, <span className="text-primary">@{username}</span>
          </h2>
          <p className="text-muted-foreground text-sm mt-0.5">Search for people to connect with</p>
        </div>

        {/* Search bar */}
        <div className="relative mb-4 animate-fade-in">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search by username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10 h-12 bg-card border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary rounded-xl text-sm"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Search results */}
        {hasQuery && (
          <div className="bg-card rounded-2xl border border-border overflow-hidden animate-fade-in">
            {isSearching ? (
              <div className="flex items-center justify-center py-10 gap-2 text-muted-foreground">
                <Loader2 size={18} className="animate-spin" />
                <span className="text-sm">Searching...</span>
              </div>
            ) : hasResults ? (
              <div className="divide-y divide-border/50 p-2">
                {searchResults.map((user) => (
                  <UserListItem
                    key={user}
                    username={user}
                    onClick={() => handleUserClick(user)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                  <User size={20} className="text-muted-foreground" />
                </div>
                <p className="font-medium text-foreground text-sm">No users found</p>
                <p className="text-muted-foreground text-xs mt-1">
                  No results for "<span className="text-foreground">{debouncedQuery}</span>"
                </p>
              </div>
            )}
          </div>
        )}

        {/* Empty state when no search */}
        {!hasQuery && (
          <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4 shadow-glow">
              <Search size={32} className="text-primary" />
            </div>
            <h3 className="font-semibold text-foreground text-lg mb-1">Find People</h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              Type a username in the search bar above to find and connect with other users
            </p>
          </div>
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
