import { useState, useEffect, useRef, useCallback } from 'react';
import { FolderKanban, Check, X } from 'lucide-react';
import { useToastContext } from '@librechat/client';
import { useUpdateWorkspaceMutation } from '~/data-provider';
import { useLocalize } from '~/hooks';
import { NotificationSeverity } from '~/common';
import WorkspaceOptions from './WorkspaceOptions';

interface WorkspaceCardProps {
  id: string;
  title: string;
  description: string;
  updatedAt: string;
  onClick?: () => void;
}

export default function WorkspaceCard({
  id,
  title,
  description,
  updatedAt,
  onClick,
}: WorkspaceCardProps) {
  const localize = useLocalize();
  const { showToast } = useToastContext();
  const inputRef = useRef<HTMLInputElement>(null);

  const [isPopoverActive, setIsPopoverActive] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [titleInput, setTitleInput] = useState(title);

  const updateMutation = useUpdateWorkspaceMutation();

  useEffect(() => {
    setTitleInput(title);
  }, [title]);

  useEffect(() => {
    if (renaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [renaming]);

  const handleRename = useCallback(() => {
    setTitleInput(title);
    setRenaming(true);
  }, [title]);

  const handleRenameSubmit = useCallback(async () => {
    const newName = titleInput.trim();
    if (!newName || newName === title) {
      setRenaming(false);
      return;
    }

    updateMutation.mutate(
      { id, data: { name: newName } },
      {
        onSuccess: () => {
          setRenaming(false);
        },
        onError: () => {
          setTitleInput(title);
          showToast({
            message: localize('com_ui_error_workspace_update'),
            severity: NotificationSeverity.ERROR,
            showIcon: true,
          });
          setRenaming(false);
        },
      },
    );
  }, [id, titleInput, title, updateMutation, showToast, localize]);

  const handleCancelRename = useCallback(() => {
    setTitleInput(title);
    setRenaming(false);
  }, [title]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      handleCancelRename();
    } else if (e.key === 'Enter') {
      handleRenameSubmit();
    }
  };

  return (
    <div
      role="button"
      tabIndex={renaming ? -1 : 0}
      onClick={(e) => {
        if (renaming || isPopoverActive) {
          return;
        }
        onClick?.();
      }}
      onKeyDown={(e) => {
        if (renaming || isPopoverActive) {
          return;
        }
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      className="group relative flex cursor-pointer flex-col gap-3 rounded-lg border border-border-light bg-surface-primary p-6 text-left transition-all hover:border-border-medium hover:bg-surface-secondary"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-surface-secondary transition-all group-hover:bg-surface-tertiary">
            <FolderKanban className="size-5 text-text-secondary" />
          </div>
          {renaming ? (
            <div className="flex min-w-0 flex-1 items-center gap-1">
              <input
                ref={inputRef}
                type="text"
                className="min-w-0 flex-1 rounded bg-surface-secondary px-2 py-1 text-lg font-semibold text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-primary"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onClick={(e) => e.stopPropagation()}
                maxLength={100}
                aria-label={localize('com_ui_rename')}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancelRename();
                }}
                className="rounded-md p-1 hover:bg-surface-tertiary"
                aria-label={localize('com_ui_cancel')}
                type="button"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRenameSubmit();
                }}
                className="rounded-md p-1 hover:bg-surface-tertiary"
                aria-label={localize('com_ui_save')}
                type="button"
              >
                <Check className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <h3 className="truncate text-lg font-semibold text-text-primary">{title}</h3>
          )}
        </div>
        {!renaming && (
          <div
            className="shrink-0"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <WorkspaceOptions
              workspaceId={id}
              name={title}
              onRename={handleRename}
              isPopoverActive={isPopoverActive}
              setIsPopoverActive={setIsPopoverActive}
            />
          </div>
        )}
      </div>
      <p className="line-clamp-2 text-sm text-text-secondary">{description}</p>
      <div className="text-xs text-text-tertiary">{updatedAt}</div>
    </div>
  );
}
