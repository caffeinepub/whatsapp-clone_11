import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

export function useSearchUsers(prefix: string) {
  const { actor, isFetching } = useActor();

  return useQuery<string[]>({
    queryKey: ['searchUsers', prefix],
    queryFn: async () => {
      if (!actor) return [];
      if (prefix.trim() === '') return [];
      return actor.searchUsersByPrefix(prefix.trim());
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
      await actor.registerUser(username, password);
    },
  });
}

export function useAuthenticateUser() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      if (!actor) throw new Error('Not connected to backend');
      const result = await actor.authenticateUser(username, password);
      return result;
    },
  });
}
