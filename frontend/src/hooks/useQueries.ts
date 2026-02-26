import { useQuery, useMutation } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile } from '../backend';

export function useSearchUsers(prefix: string) {
  const { actor, isFetching } = useActor();

  return useQuery<string[]>({
    queryKey: ['searchUsers', prefix],
    queryFn: async () => {
      if (!actor) return [];
      if (prefix.trim() === '') return [];
      return actor.searchUsersByPrefix(prefix.trim().toLowerCase());
    },
    enabled: !!actor && !isFetching && prefix.trim().length > 0,
    staleTime: 10_000,
  });
}

export function useRegisterUser() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      if (!actor) throw new Error('Not connected to backend');
      // Normalize username: trim whitespace and lowercase before sending to backend
      const normalizedUsername = username.trim().toLowerCase();
      await actor.registerUser(normalizedUsername, password);
      return normalizedUsername;
    },
  });
}

export function useAuthenticateUser() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      if (!actor) throw new Error('Not connected to backend');
      // Normalize username: trim whitespace and lowercase before sending to backend
      const normalizedUsername = username.trim().toLowerCase();
      const result = await actor.authenticateUser(normalizedUsername, password);
      return result;
    },
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['callerUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}
