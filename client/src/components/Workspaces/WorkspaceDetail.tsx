import { useCallback, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOutletContext } from 'react-router-dom';
import { ArrowLeft, MessageSquarePlus, Loader2, FileText, Save, X } from 'lucide-react';
import { Button, Spinner, useMediaQuery, useToastContext, Textarea } from '@librechat/client';
import { Constants } from 'librechat-data-provider';
import {
  useWorkspaceQuery,
  useWorkspaceConversationsQuery,
  useUpdateWorkspaceMutation,
} from '~/data-provider';
import { useLocalize, useNewConvo, useNavigateToConvo } from '~/hooks';
import type { ContextType } from '~/common';
import { OpenSidebar } from '~/components/Chat/Menus';

function WorkspaceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const localize = useLocalize();
  const { showToast } = useToastContext();
  const isSmallScreen = useMediaQuery('(max-width: 768px)');
  const { navVisible, setNavVisible } = useOutletContext<ContextType>();
  const { newConversation } = useNewConvo(0);
  const { navigateToConvo } = useNavigateToConvo(0);

  const { data: workspace, isLoading: workspaceLoading } = useWorkspaceQuery(id ?? '');
  const { data: conversationsData, isLoading: conversationsLoading } =
    useWorkspaceConversationsQuery(id ?? '');

  // State for editing instructions
  const [isEditingInstructions, setIsEditingInstructions] = useState(false);
  const [instructionsValue, setInstructionsValue] = useState('');

  // Update workspace mutation
  const updateWorkspaceMutation = useUpdateWorkspaceMutation();

  const handleBack = useCallback(() => {
    navigate('/workspaces');
  }, [navigate]);

  const handleStartNewChat = useCallback(() => {
    if (!workspace) {
      return;
    }

    // Create a new conversation with workspace context
    const template = {
      conversationId: Constants.NEW_CONVO as string,
      workspace_id: workspace._id,
      title: `New Chat in ${workspace.name}`,
      promptPrefix: workspace.instructions || undefined,
    };

    newConversation({
      template,
    });
  }, [workspace, newConversation]);

  const handleEditInstructions = useCallback(() => {
    setInstructionsValue(workspace?.instructions || '');
    setIsEditingInstructions(true);
  }, [workspace]);

  const handleCancelEdit = useCallback(() => {
    setIsEditingInstructions(false);
    setInstructionsValue('');
  }, []);

  const handleSaveInstructions = useCallback(async () => {
    if (!workspace || !id) {
      return;
    }

    try {
      await updateWorkspaceMutation.mutateAsync({
        id,
        data: { instructions: instructionsValue },
      });

      showToast({
        message: localize('com_ui_workspace_instructions_saved'),
        status: 'success',
      });

      setIsEditingInstructions(false);
    } catch (error) {
      showToast({
        message: localize('com_ui_error_workspace_update'),
        status: 'error',
      });
    }
  }, [workspace, id, instructionsValue, updateWorkspaceMutation, showToast, localize]);

  const handleConversationClick = useCallback(
    (conversationId: string) => {
      const conversation = conversationsData?.conversations.find(
        (c) => c.conversationId === conversationId,
      );
      if (conversation) {
        navigateToConvo(conversation as any);
      }
    },
    [conversationsData, navigateToConvo],
  );

  const formatUpdatedAt = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return localize('com_ui_today');
    } else if (diffDays < 7) {
      return localize('com_ui_days_ago', { 0: diffDays });
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return localize('com_ui_weeks_ago', { 0: weeks });
    } else {
      const months = Math.floor(diffDays / 30);
      return localize('com_ui_months_ago', { 0: months });
    }
  };

  if (workspaceLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-center">
          <p className="text-text-secondary">{localize('com_ui_workspace_not_found')}</p>
          <Button onClick={handleBack} className="mt-4">
            {localize('com_ui_back')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full w-full grow overflow-hidden bg-surface-primary">
      <div className="flex h-full w-full flex-col overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border-light bg-surface-primary px-6 py-4">
          <div className="flex items-center gap-3">
            {!isSmallScreen && !navVisible && <OpenSidebar setNavVisible={setNavVisible} />}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="rounded-lg hover:bg-surface-hover"
            >
              <ArrowLeft className="size-5" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-text-primary">{workspace.name}</h1>
              {workspace.description && (
                <p className="text-sm text-text-secondary">{workspace.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-6 py-8">
          {/* Workspace Instructions Section */}
          <div className="mb-8">
            <div className="mx-auto max-w-3xl">
              <div className="rounded-xl border border-border-light bg-surface-secondary p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="size-6 text-text-secondary" />
                    <h2 className="text-lg font-semibold text-text-primary">
                      {localize('com_ui_workspace_instructions')}
                    </h2>
                  </div>
                  {!isEditingInstructions && (
                    <Button
                      onClick={handleEditInstructions}
                      variant="outline"
                      size="sm"
                      className="text-sm"
                    >
                      {workspace.instructions ? localize('com_ui_edit') : localize('com_ui_add')}
                    </Button>
                  )}
                </div>

                {isEditingInstructions ? (
                  <div className="space-y-4">
                    <p className="text-sm text-text-secondary">
                      {localize('com_ui_workspace_instructions_description')}
                    </p>
                    <Textarea
                      value={instructionsValue}
                      onChange={(e) => setInstructionsValue(e.target.value)}
                      placeholder={localize('com_ui_workspace_instructions_placeholder')}
                      className="min-h-[150px] w-full resize-none rounded-lg border border-border-medium bg-surface-primary p-3 text-sm text-text-primary placeholder:text-text-secondary focus:border-border-heavy focus:outline-none"
                      rows={6}
                    />
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={handleSaveInstructions}
                        disabled={updateWorkspaceMutation.isLoading}
                        className="flex items-center gap-2 bg-green-500 text-white hover:bg-green-600"
                      >
                        {updateWorkspaceMutation.isLoading ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Save className="size-4" />
                        )}
                        <span>{localize('com_ui_save')}</span>
                      </Button>
                      <Button
                        onClick={handleCancelEdit}
                        disabled={updateWorkspaceMutation.isLoading}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <X className="size-4" />
                        <span>{localize('com_ui_cancel')}</span>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {workspace.instructions ? (
                      <p className="whitespace-pre-wrap text-sm text-text-primary">
                        {workspace.instructions}
                      </p>
                    ) : (
                      <p className="text-sm italic text-text-secondary">
                        {localize('com_ui_no_instructions_set')}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Start New Chat Section */}
          <div className="mb-8">
            <div className="mx-auto max-w-3xl">
              <div className="rounded-xl border border-border-light bg-surface-secondary p-6">
                <div className="mb-4 flex items-center gap-3">
                  <MessageSquarePlus className="size-6 text-text-secondary" />
                  <h2 className="text-lg font-semibold text-text-primary">
                    {localize('com_ui_start_new_chat')}
                  </h2>
                </div>
                <p className="mb-4 text-sm text-text-secondary">
                  {localize('com_ui_workspace_new_chat_description')}
                </p>
                <Button
                  onClick={handleStartNewChat}
                  className="flex items-center gap-2 bg-green-500 text-white hover:bg-green-600"
                >
                  <MessageSquarePlus className="size-4" />
                  <span>{localize('com_ui_new_chat')}</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Conversations List */}
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-4 text-lg font-semibold text-text-primary">
              {localize('com_ui_workspace_conversations')}
            </h2>
            {conversationsLoading ? (
              <div className="flex h-32 items-center justify-center">
                <Loader2 className="size-6 animate-spin text-text-secondary" />
              </div>
            ) : conversationsData?.conversations && conversationsData.conversations.length > 0 ? (
              <div className="space-y-2">
                {conversationsData.conversations.map((conversation) => (
                  <button
                    key={conversation.conversationId}
                    onClick={() => handleConversationClick(conversation.conversationId)}
                    className="w-full rounded-lg border border-border-light bg-surface-secondary p-4 text-left transition-colors hover:bg-surface-hover"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-text-primary">{conversation.title}</h3>
                        <p className="mt-1 text-xs text-text-secondary">
                          {conversation.model && `${conversation.model} · `}
                          {formatUpdatedAt(conversation.updatedAt)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex h-32 flex-col items-center justify-center rounded-lg border border-border-light bg-surface-secondary text-text-secondary">
                <p>{localize('com_ui_no_conversations_workspace')}</p>
                <p className="mt-2 text-sm">{localize('com_ui_start_first_chat')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default WorkspaceDetail;
