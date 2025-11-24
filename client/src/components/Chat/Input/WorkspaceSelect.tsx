import React, { memo, useState, useCallback, useMemo } from 'react';
import * as Ariakit from '@ariakit/react';
import { FolderKanban, ChevronDown } from 'lucide-react';
import { useBadgeRowContext } from '~/Providers';
import { useWorkspacesQuery } from '~/data-provider';
import { useLocalize } from '~/hooks';
import { cn } from '~/utils';

function WorkspaceSelect() {
  const localize = useLocalize();
  const { workspace } = useBadgeRowContext();
  const { selectedWorkspaceId, handleWorkspaceSelect, isLocked } = workspace;

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // Fetch all workspaces
  const { data: workspacesData } = useWorkspacesQuery(1, 100);
  const workspaces = useMemo(() => workspacesData?.workspaces || [], [workspacesData]);

  // Find the currently selected workspace
  const selectedWorkspace = useMemo(
    () => workspaces.find((w) => w._id === selectedWorkspaceId),
    [workspaces, selectedWorkspaceId],
  );

  const isWorkspaceSelected = !!selectedWorkspaceId;

  const handleToggle = useCallback(() => {
    if (isLocked) {
      return;
    }
    // If workspace is selected, deselect it
    if (isWorkspaceSelected) {
      handleWorkspaceSelect(null);
    } else {
      setIsPopoverOpen(true);
    }
  }, [isLocked, isWorkspaceSelected, handleWorkspaceSelect]);

  const handleWorkspaceClick = useCallback(
    (workspaceId: string) => {
      if (isLocked) {
        return;
      }
      handleWorkspaceSelect(workspaceId);
      setIsPopoverOpen(false);
    },
    [isLocked, handleWorkspaceSelect],
  );

  // Don't show if no workspace selected and conversation is locked
  if (!isWorkspaceSelected && isLocked) {
    return null;
  }

  return (
    <div className="flex">
      <button
        type="button"
        onClick={handleToggle}
        disabled={isLocked}
        aria-label={selectedWorkspace?.name || localize('com_ui_select_workspace')}
        className={cn(
          'group relative inline-flex items-center justify-center gap-1.5',
          'rounded-full border text-sm font-medium',
          'size-9 p-2 transition-all md:w-full md:p-3',
          'shadow-sm',
          // Default state
          !isWorkspaceSelected && 'border-border-medium bg-transparent hover:bg-surface-secondary',
          // Selected state (purple)
          isWorkspaceSelected && 'border-purple-600/40 bg-purple-500/10 hover:bg-purple-700/10',
          // Locked state
          isLocked && 'cursor-default opacity-75',
          // Adjust border radius when menu button is shown
          !isLocked && 'rounded-r-none border-r-0 hover:shadow-md',
        )}
      >
        {/* Icon */}
        <FolderKanban className="icon-md text-text-primary" />

        {/* Label on larger screens */}
        <span className="hidden truncate md:block">
          {selectedWorkspace?.name || localize('com_ui_select_workspace')}
        </span>
      </button>

      {!isLocked && (
        <Ariakit.MenuProvider open={isPopoverOpen} setOpen={setIsPopoverOpen}>
          <Ariakit.MenuButton
            className={cn(
              'w-7 rounded-l-none rounded-r-full border-b border-l-0 border-r border-t md:w-6',
              'transition-colors',
              // Match the main button's state
              !isWorkspaceSelected &&
                'border-border-medium bg-transparent hover:bg-surface-secondary',
              isWorkspaceSelected && 'border-purple-600/40 bg-purple-500/10 hover:bg-purple-700/10',
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <ChevronDown className="ml-1 h-4 w-4 text-text-secondary md:ml-0" />
          </Ariakit.MenuButton>

          <Ariakit.Menu
            gutter={8}
            className={cn(
              'animate-popover z-50 flex max-h-[300px]',
              'flex-col overflow-auto overscroll-contain rounded-xl',
              'bg-surface-secondary px-1.5 py-1 text-text-primary shadow-lg',
              'border border-border-light',
              'min-w-[250px] outline-none',
            )}
            portal
          >
            <div className="px-2 py-1.5">
              <div className="mb-2 text-xs font-medium text-text-secondary">
                {localize('com_ui_select_workspace')}
              </div>

              {workspaces.length === 0 ? (
                <div className="px-2 py-2 text-sm text-text-secondary">
                  {localize('com_ui_no_workspaces')}
                </div>
              ) : (
                workspaces.map((workspace) => (
                  <Ariakit.MenuItem
                    key={workspace._id}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      handleWorkspaceClick(workspace._id);
                    }}
                    className={cn(
                      'mb-1 flex items-center justify-between rounded-lg px-2 py-2',
                      'cursor-pointer outline-none transition-colors',
                      'hover:bg-black/[0.075] dark:hover:bg-white/10',
                      'data-[active-item]:bg-black/[0.075] dark:data-[active-item]:bg-white/10',
                      workspace._id === selectedWorkspaceId &&
                        'bg-black/[0.1] dark:bg-white/[0.15]',
                    )}
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium">{workspace.name}</span>
                      {workspace.description && (
                        <span className="text-xs text-text-secondary">{workspace.description}</span>
                      )}
                    </div>
                  </Ariakit.MenuItem>
                ))
              )}
            </div>
          </Ariakit.Menu>
        </Ariakit.MenuProvider>
      )}
    </div>
  );
}

export default memo(WorkspaceSelect);
