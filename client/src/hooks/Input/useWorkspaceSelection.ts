import { useCallback, useMemo, useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { Constants, LocalStorageKeys } from 'librechat-data-provider';
import { setTimestamp } from '~/utils/timestamps';
import { ephemeralAgentByConvoId } from '~/store';
import { useChatContext } from '~/Providers';

const WORKSPACE_KEY = '__workspace_id__';

interface UseWorkspaceSelectionOptions {
  conversationId?: string | null;
}

export function useWorkspaceSelection({ conversationId }: UseWorkspaceSelectionOptions) {
  const key = conversationId ?? Constants.NEW_CONVO;
  const [ephemeralAgent, setEphemeralAgent] = useRecoilState(ephemeralAgentByConvoId(key));
  const { getMessages, conversation, setConversation } = useChatContext();

  const storageKey = useMemo(() => `${LocalStorageKeys.LAST_WORKSPACE_SELECTION_}${key}`, [key]);

  // Get current workspace ID from ephemeralAgent or conversation
  const selectedWorkspaceId = useMemo(() => {
    const ephemeralWorkspaceId = ephemeralAgent?.[WORKSPACE_KEY];
    const conversationWorkspaceId = conversation?.workspace_id;
    return ephemeralWorkspaceId || conversationWorkspaceId || null;
  }, [ephemeralAgent, conversation?.workspace_id]);

  // Check if workspace selection is locked (conversation has messages)
  const isLocked = useMemo(() => {
    console.log('useWorkspaceSelection', conversation);
    if (!conversation || conversation.messages?.length > 0) return true;
    return false;
  }, [conversation]);

  // Sync to localStorage when ephemeralAgent changes
  useEffect(() => {
    const value = ephemeralAgent?.[WORKSPACE_KEY];
    if (value !== undefined) {
      localStorage.setItem(storageKey, JSON.stringify(value));
      setTimestamp(storageKey);
    }
  }, [ephemeralAgent, storageKey]);

  const handleWorkspaceSelect = useCallback(
    (workspaceId: string | null) => {
      if (isLocked) {
        console.warn('Cannot change workspace after conversation has started');
        return;
      }

      // Update ephemeralAgent
      setEphemeralAgent((prev) => ({
        ...(prev || {}),
        [WORKSPACE_KEY]: workspaceId,
      }));

      // Update conversation
      setConversation((prev) => ({
        ...prev,
        workspace_id: workspaceId ?? undefined,
      }));
    },
    [isLocked, setEphemeralAgent, setConversation],
  );

  return {
    selectedWorkspaceId,
    handleWorkspaceSelect,
    isLocked,
  };
}
