import { useCallback, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button, useMediaQuery, Spinner } from '@librechat/client';
import { useWorkspacesQuery } from '~/data-provider';
import { useLocalize } from '~/hooks';
import type { ContextType } from '~/common';
import { OpenSidebar } from '~/components/Chat/Menus';
import { formatRelativeDate } from '~/utils/dates';
import WorkspaceCard from './WorkspaceCard';
import WorkspaceCreateDialog from './WorkspaceCreateDialog';

export default function Workspaces() {
  const localize = useLocalize();
  const navigate = useNavigate();
  const isSmallScreen = useMediaQuery('(max-width: 768px)');
  const { navVisible, setNavVisible } = useOutletContext<ContextType>();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data, isLoading, isError } = useWorkspacesQuery(1, 20);

  const handleWorkspaceClick = useCallback(
    (workspaceId: string) => {
      navigate(`/workspaces/${workspaceId}`);
    },
    [navigate],
  );

  const handleNewWorkspace = useCallback(() => {
    setIsCreateDialogOpen(true);
  }, []);

  return (
    <div className="relative flex h-full w-full grow overflow-hidden bg-presentation">
      <div className="flex h-full w-full flex-col overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-border-light bg-surface-primary px-6 py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {/* Sidebar toggle - shows when sidebar is hidden */}
              <div
                className={`flex items-center ${
                  !isSmallScreen ? 'transition-all duration-200 ease-in-out' : ''
                } ${
                  !navVisible
                    ? 'translate-x-0 opacity-100'
                    : 'pointer-events-none translate-x-[-50px] opacity-0'
                }`}
              >
                <OpenSidebar setNavVisible={setNavVisible} className="max-md:hidden" />
              </div>
              <h1
                className={`text-2xl font-semibold text-text-primary ${
                  !isSmallScreen ? 'transition-all duration-200 ease-in-out' : ''
                } ${!navVisible ? 'translate-x-0' : 'translate-x-[-50px]'}`}
              >
                {localize('com_ui_workspaces')}
              </h1>
            </div>
            <Button
              onClick={handleNewWorkspace}
              className="flex items-center gap-2"
              data-testid="new-workspace-button"
            >
              <Plus className="size-4" />
              {!isSmallScreen && <span>{localize('com_ui_new_workspace')}</span>}
            </Button>
          </div>
        </div>

        {/* Workspaces Grid */}
        <div className="flex-1 px-6 py-8">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Spinner />
            </div>
          ) : isError ? (
            <div className="flex h-64 items-center justify-center text-text-secondary">
              {localize('com_ui_error_loading_workspaces')}
            </div>
          ) : data?.workspaces && data.workspaces.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data.workspaces.map((workspace) => (
                <WorkspaceCard
                  key={workspace._id}
                  title={workspace.name}
                  description={workspace.description || ''}
                  updatedAt={formatRelativeDate(workspace.updatedAt, localize)}
                  onClick={() => handleWorkspaceClick(workspace._id)}
                />
              ))}
            </div>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center gap-4 text-text-secondary">
              <p>{localize('com_ui_no_workspaces')}</p>
              <Button onClick={handleNewWorkspace} className="flex items-center gap-2">
                <Plus className="size-4" />
                <span>{localize('com_ui_create_first_workspace')}</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      <WorkspaceCreateDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />
    </div>
  );
}
