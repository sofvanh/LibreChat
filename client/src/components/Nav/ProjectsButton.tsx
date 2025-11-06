import { useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderKanban } from 'lucide-react';
import { Button, TooltipAnchor } from '@librechat/client';
import { useLocalize, AuthContext } from '~/hooks';

interface ProjectsButtonProps {
  isSmallScreen: boolean;
  toggleNav: () => void;
}

export default function ProjectsButton({ isSmallScreen, toggleNav }: ProjectsButtonProps) {
  const navigate = useNavigate();
  const localize = useLocalize();
  const authContext = useContext(AuthContext);

  const handleProjects = useCallback(() => {
    navigate('/projects');
    if (isSmallScreen) {
      toggleNav();
    }
  }, [navigate, isSmallScreen, toggleNav]);

  // Check if auth is ready (avoid race conditions)
  const authReady =
    authContext?.isAuthenticated !== undefined &&
    (authContext?.isAuthenticated === false || authContext?.user !== undefined);

  if (!authReady) {
    return null;
  }

  return (
    <TooltipAnchor
      description={localize('com_ui_projects')}
      render={
        <Button
          variant="outline"
          data-testid="nav-projects-button"
          aria-label={localize('com_ui_projects')}
          className="rounded-full border-none bg-transparent p-2 hover:bg-surface-hover md:rounded-xl"
          onClick={handleProjects}
        >
          <FolderKanban className="icon-lg text-text-primary" />
        </Button>
      }
    />
  );
}
