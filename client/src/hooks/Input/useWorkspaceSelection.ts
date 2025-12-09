import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Constants, QueryKeys, dataService } from 'librechat-data-provider';
import type { TConversation } from 'librechat-data-provider';
import { useChatContext } from '~/Providers';

interface UseWorkspaceSelectionOptions {
  conversationId?: string | null;
}

export function useWorkspaceSelection({ conversationId }: UseWorkspaceSelectionOptions) {
  const queryClient = useQueryClient();
  const { conversation, setConversation } = useChatContext();

  const selectedWorkspaceId = conversation?.workspace_id ?? null;

  // Mutation to persist workspace change for existing conversations
  const updateWorkspaceMutation = useMutation({
    mutationFn: (payload: { conversationId: string; workspace_id: string | null }) =>
      // Type assertion needed: backend accepts workspace_id but TS types are restrictive
      dataService.updateConversation(
        payload as unknown as Parameters<typeof dataService.updateConversation>[0],
      ),
    onSuccess: (_data, variables) => {
      // Update the conversation in cache
      queryClient.setQueryData<TConversation | undefined>(
        [QueryKeys.conversation, variables.conversationId],
        (old) => (old ? { ...old, workspace_id: variables.workspace_id ?? undefined } : old),
      );
    },
  });

  const handleWorkspaceSelect = useCallback(
    (workspaceId: string | null) => {
      // Update local state immediately
      setConversation((prev) => {
        if (!prev) {
          return prev;
        }
        return {
          ...prev,
          workspace_id: workspaceId ?? undefined,
        };
      });

      // Persist to backend if this is an existing conversation
      const convoId = conversationId ?? conversation?.conversationId;
      if (convoId && convoId !== Constants.NEW_CONVO) {
        updateWorkspaceMutation.mutate({
          conversationId: convoId,
          workspace_id: workspaceId,
        });
      }
    },
    [setConversation, conversationId, conversation?.conversationId, updateWorkspaceMutation],
  );

  return {
    selectedWorkspaceId,
    handleWorkspaceSelect,
  };
}
