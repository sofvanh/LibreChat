import { useCallback, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOutletContext } from 'react-router-dom';
import { ArrowLeft, Loader2, FileText, Save, X, Database } from 'lucide-react';
import { EToolResources } from 'librechat-data-provider';
import { Button, Spinner, useMediaQuery, useToastContext, Textarea } from '@librechat/client';
import {
  useWorkspaceQuery,
  useWorkspaceConversationsQuery,
  useUpdateWorkspaceMutation,
  useWorkspaceFilesQuery,
  useWorkspaceContextQuery,
  useManageWorkspaceFilesMutation,
  useUploadFileMutation,
} from '~/data-provider';
import { useLocalize } from '~/hooks';
import type { ContextType } from '~/common';
import { OpenSidebar } from '~/components/Chat/Menus';
import { formatRelativeDate } from '~/utils/dates';
import WorkspaceFiles from './WorkspaceFiles';

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
};

function WorkspaceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const localize = useLocalize();
  const { showToast } = useToastContext();
  const isSmallScreen = useMediaQuery('(max-width: 768px)');
  const { navVisible, setNavVisible } = useOutletContext<ContextType>();

  const { data: workspace, isLoading: workspaceLoading } = useWorkspaceQuery(id ?? '');
  const { data: conversationsData, isLoading: conversationsLoading } =
    useWorkspaceConversationsQuery(id ?? '');
  const { data: workspaceFiles = [], isLoading: filesLoading } = useWorkspaceFilesQuery(id ?? '');
  const { data: workspaceContext } = useWorkspaceContextQuery(id ?? '');

  // State for editing instructions
  const [isEditingInstructions, setIsEditingInstructions] = useState(false);
  const [instructionsValue, setInstructionsValue] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);

  // Mutations
  const updateWorkspaceMutation = useUpdateWorkspaceMutation();
  const manageFilesMutation = useManageWorkspaceFilesMutation();
  const uploadFileMutation = useUploadFileMutation();

  const handleBack = useCallback(() => {
    navigate('/workspaces');
  }, [navigate]);

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
    } catch (_error) {
      showToast({
        message: localize('com_ui_error_workspace_update'),
        status: 'error',
      });
    }
  }, [workspace, id, instructionsValue, updateWorkspaceMutation, showToast, localize]);

  const handleConversationClick = useCallback(
    (conversationId: string) => {
      navigate(`/c/${conversationId}`);
    },
    [navigate],
  );

  const handleFileUpload = useCallback(
    async (file: File, toolResource?: EToolResources) => {
      if (!id) {
        return;
      }

      try {
        setUploadingFile(true);

        // Upload file to server
        const formData = new FormData();
        formData.append('file', file);
        formData.append('file_id', crypto.randomUUID());
        formData.append('endpoint', 'agents');

        // Always mark as message_file (not tied to a specific agent)
        formData.append('message_file', 'true');

        // If toolResource is set (e.g., 'context' for text files), include it
        // This triggers text extraction for markdown and other text files
        if (toolResource) {
          formData.append('tool_resource', toolResource);
        }

        const uploadedFile = await uploadFileMutation.mutateAsync(formData);

        // Add file to workspace
        await manageFilesMutation.mutateAsync({
          id,
          action: 'add',
          file_ids: [uploadedFile.file_id],
        });

        showToast({
          message: localize('com_ui_saved'),
          status: 'success',
        });
      } catch (error) {
        console.error('Error uploading file:', error);
        showToast({
          message: localize('com_error_files_upload'),
          status: 'error',
        });
      } finally {
        setUploadingFile(false);
      }
    },
    [id, uploadFileMutation, manageFilesMutation, showToast, localize],
  );

  const handleRemoveFile = useCallback(
    async (fileId: string) => {
      if (!id) {
        return;
      }

      try {
        await manageFilesMutation.mutateAsync({
          id,
          action: 'remove',
          file_ids: [fileId],
        });

        showToast({
          message: localize('com_ui_saved'),
          status: 'success',
        });
      } catch (error) {
        console.error('Error removing file:', error);
        showToast({
          message: localize('com_error_files_process'),
          status: 'error',
        });
      }
    },
    [id, manageFilesMutation, showToast, localize],
  );

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
          {workspaceContext && (
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Database className="size-4" />
              <span>
                {localize('com_ui_context_tokens', {
                  0: workspaceContext.tokenCount.toLocaleString(),
                })}
                {workspaceContext.unknownBytes > 0 && ' '}
                {workspaceContext.unknownBytes > 0 && (
                  <span className="text-text-tertiary">
                    +{formatFileSize(workspaceContext.unknownBytes)}
                  </span>
                )}
              </span>
            </div>
          )}
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

          {/* Workspace Files Section */}
          <div className="mb-8">
            <WorkspaceFiles
              files={workspaceFiles}
              onFileUpload={handleFileUpload}
              onRemoveFile={handleRemoveFile}
              isLoading={filesLoading || uploadingFile}
              fileTokens={workspaceContext?.fileTokens}
            />
          </div>

          {/* Conversations List */}
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-4 text-lg font-semibold text-text-primary">
              {localize('com_ui_workspace_conversations')}
            </h2>
            {conversationsLoading && (
              <div className="flex h-32 items-center justify-center">
                <Loader2 className="size-6 animate-spin text-text-secondary" />
              </div>
            )}

            {!conversationsLoading &&
              conversationsData?.conversations &&
              conversationsData.conversations.length > 0 && (
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
                            {formatRelativeDate(conversation.updatedAt, localize)}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

            {!conversationsLoading &&
              (!conversationsData?.conversations ||
                conversationsData.conversations.length === 0) && (
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
