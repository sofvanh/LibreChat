import { useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button, useMediaQuery } from '@librechat/client';
import { useLocalize } from '~/hooks';
import type { ContextType } from '~/common';
import { OpenSidebar } from '~/components/Chat/Menus';
import ProjectCard from './ProjectCard';

// Placeholder project data
const PLACEHOLDER_PROJECTS = [
  {
    id: '1',
    title: 'Personal Assistant',
    description:
      'A project for managing daily tasks, scheduling, and personal productivity. Includes custom instructions and file attachments.',
    updatedAt: 'Updated 2 days ago',
  },
  {
    id: '2',
    title: 'Code Review Helper',
    description:
      'Technical project focused on code reviews, best practices, and architecture discussions.',
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

export default function Projects() {
  const localize = useLocalize();
  const isSmallScreen = useMediaQuery('(max-width: 768px)');
  const { navVisible, setNavVisible } = useOutletContext<ContextType>();

  const handleProjectClick = useCallback((projectId: string) => {
    // TODO: Navigate to project detail or start conversation with project context
    console.log('Project clicked:', projectId);
  }, []);

  const handleNewProject = useCallback(() => {
    // TODO: Open new project dialog
    console.log('New project clicked');
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
                {localize('com_ui_projects')}
              </h1>
            </div>
            <Button
              onClick={handleNewProject}
              className="flex items-center gap-2"
              data-testid="new-project-button"
            >
              <Plus className="size-4" />
              {!isSmallScreen && <span>{localize('com_ui_new_project')}</span>}
            </Button>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="flex-1 px-6 py-8">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {PLACEHOLDER_PROJECTS.map((project) => (
              <ProjectCard
                key={project.id}
                title={project.title}
                description={project.description}
                updatedAt={project.updatedAt}
                onClick={() => handleProjectClick(project.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
