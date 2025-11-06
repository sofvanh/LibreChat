import { useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button, useMediaQuery } from '@librechat/client';
import { useLocalize } from '~/hooks';
import type { ContextType } from '~/common';
import { OpenSidebar } from '~/components/Chat/Menus';
import WorkspaceCard from './WorkspaceCard';

// Placeholder workspace data
const PLACEHOLDER_WORKSPACES = [
  {
    id: '1',
    title: 'Personal Assistant',
    description:
      'A workspace for managing daily tasks, scheduling, and personal productivity. Includes custom instructions and file attachments.',
    updatedAt: 'Updated 2 days ago',
  },
  {
    id: '2',
    title: 'Code Review Helper',
    description:
      'Technical workspace focused on code reviews, best practices, and architecture discussions.',
    updatedAt: 'Updated 1 week ago',
  },
  {
    id: '3',
    title: 'Creative Writing',
    description:
      'A creative space for brainstorming ideas, writing stories, and developing characters.',
    updatedAt: 'Updated 2 weeks ago',
  },
];

export default function Workspaces() {
  const localize = useLocalize();
  const isSmallScreen = useMediaQuery('(max-width: 768px)');
  const { navVisible, setNavVisible } = useOutletContext<ContextType>();

  const handleWorkspaceClick = useCallback((workspaceId: string) => {
    // TODO: Navigate to workspace detail or start conversation with workspace context
    console.log('Workspace clicked:', workspaceId);
  }, []);

  const handleNewWorkspace = useCallback(() => {
    // TODO: Open new workspace dialog
    console.log('New workspace clicked');
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {PLACEHOLDER_WORKSPACES.map((workspace) => (
              <WorkspaceCard
                key={workspace.id}
                title={workspace.title}
                description={workspace.description}
                updatedAt={workspace.updatedAt}
                onClick={() => handleWorkspaceClick(workspace.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
