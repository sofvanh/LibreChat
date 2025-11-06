import { useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderKanban } from 'lucide-react';
import { Button, TooltipAnchor } from '@librechat/client';
import { useLocalize, AuthContext } from '~/hooks';

interface WorkspacesButtonProps {
  isSmallScreen: boolean;
  toggleNav: () => void;
}

export default function WorkspacesButton({ isSmallScreen, toggleNav }: WorkspacesButtonProps) {
  const navigate = useNavigate();
  const localize = useLocalize();
  const authContext = useContext(AuthContext);

  const handleWorkspaces = useCallback(() => {
    navigate('/workspaces');
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
      description={localize('com_ui_workspaces')}
      render={
        <Button
          variant="outline"
          data-testid="nav-workspaces-button"
          aria-label={localize('com_ui_workspaces')}
          className="rounded-full border-none bg-transparent p-2 hover:bg-surface-hover md:rounded-xl"
          onClick={handleWorkspaces}
        >
          <FolderKanban className="icon-lg text-text-primary" />
        </Button>
      }
    />
  );
}

