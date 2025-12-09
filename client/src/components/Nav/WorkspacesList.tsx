import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, FolderKanban } from 'lucide-react';
import { useWorkspacesQuery } from '~/data-provider';
import { useLocalize } from '~/hooks';
import { cn } from '~/utils';

interface WorkspacesListProps {
  isSmallScreen: boolean;
  toggleNav: () => void;
}

export default function WorkspacesList({ isSmallScreen, toggleNav }: WorkspacesListProps) {
  const localize = useLocalize();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  const { data, isLoading } = useWorkspacesQuery(1, 20, {
    enabled: isExpanded,
  });

  const handleWorkspaceClick = useCallback(
    (workspaceId: string) => {
      navigate(`/workspaces/${workspaceId}`);
      if (isSmallScreen) {
        toggleNav();
      }
    },
    [navigate, isSmallScreen, toggleNav],
  );

  const workspaces = data?.workspaces ?? [];

  const renderWorkspacesList = () => {
    if (isLoading) {
      return (
        <div className="px-4 py-2 text-xs text-text-secondary">{localize('com_ui_loading')}...</div>
      );
    }

    if (workspaces.length === 0) {
      return (
        <div className="px-4 py-2 text-xs italic text-text-secondary">
          {localize('com_ui_no_workspaces')}
        </div>
      );
    }

    return workspaces.map((workspace) => (
      <button
        key={workspace._id}
        onClick={() => handleWorkspaceClick(workspace._id)}
        className={cn(
          'flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-text-secondary',
          'transition-colors hover:bg-surface-hover hover:text-text-primary',
          'truncate text-left',
        )}
      >
        <span className="truncate">{workspace.name}</span>
      </button>
    ));
  };

  return (
    <div className="py-1">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-text-secondary',
          'transition-colors hover:bg-surface-hover hover:text-text-primary',
        )}
        aria-expanded={isExpanded}
        aria-controls="workspaces-list"
      >
        <ChevronRight
          className={cn('size-4 transition-transform duration-200', isExpanded && 'rotate-90')}
        />
        <FolderKanban className="size-4" />
        <span className="font-medium">{localize('com_ui_workspaces')}</span>
      </button>

      {isExpanded && (
        <div id="workspaces-list" className="ml-4 mt-1 space-y-0.5">
          {renderWorkspacesList()}
        </div>
      )}
    </div>
  );
}
