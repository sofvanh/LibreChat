import { useState, useId, useRef, memo, useCallback, useMemo } from 'react';
import * as Menu from '@ariakit/react/menu';
import { useNavigate } from 'react-router-dom';
import { DropdownPopup, useToastContext } from '@librechat/client';
import { Ellipsis, Pen, Trash } from 'lucide-react';
import type { MouseEvent } from 'react';
import { useDeleteWorkspaceMutation } from '~/data-provider';
import { useLocalize } from '~/hooks';
import { NotificationSeverity } from '~/common';
import DeleteWorkspaceDialog from './DeleteWorkspaceDialog';
import { cn } from '~/utils';

interface WorkspaceOptionsProps {
  workspaceId: string;
  name: string;
  onRename: () => void;
  isPopoverActive: boolean;
  setIsPopoverActive: React.Dispatch<React.SetStateAction<boolean>>;
}

function WorkspaceOptions({
  workspaceId,
  name,
  onRename,
  isPopoverActive,
  setIsPopoverActive,
}: WorkspaceOptionsProps) {
  const localize = useLocalize();
  const navigate = useNavigate();
  const { showToast } = useToastContext();

  const deleteButtonRef = useRef<HTMLButtonElement>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const deleteMutation = useDeleteWorkspaceMutation();

  const handleRenameClick = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();
      setIsPopoverActive(false);
      onRename();
    },
    [onRename, setIsPopoverActive],
  );

  const handleDeleteClick = useCallback(() => {
    setShowDeleteDialog(true);
  }, []);

  const confirmDelete = useCallback(() => {
    deleteMutation.mutate(workspaceId, {
      onSuccess: () => {
        setShowDeleteDialog(false);
        setIsPopoverActive(false);
        navigate('/workspaces');
        showToast({
          message: localize('com_ui_workspace_deleted'),
          severity: NotificationSeverity.SUCCESS,
          showIcon: true,
        });
      },
      onError: () => {
        showToast({
          message: localize('com_ui_error_workspace_delete'),
          severity: NotificationSeverity.ERROR,
          showIcon: true,
        });
      },
    });
  }, [workspaceId, deleteMutation, navigate, showToast, localize, setIsPopoverActive]);

  const dropdownItems = useMemo(
    () => [
      {
        label: localize('com_ui_rename'),
        onClick: handleRenameClick,
        icon: <Pen className="icon-sm mr-2 text-text-primary" />,
      },
      {
        label: localize('com_ui_delete'),
        onClick: handleDeleteClick,
        icon: <Trash className="icon-sm mr-2 text-text-primary" />,
        hideOnClick: false,
        ref: deleteButtonRef,
        render: (props: React.HTMLAttributes<HTMLButtonElement>) => <button {...props} />,
      },
    ],
    [localize, handleRenameClick, handleDeleteClick],
  );

  const menuId = useId();

  return (
    <>
      <DropdownPopup
        portal={true}
        mountByState={true}
        unmountOnHide={true}
        preserveTabOrder={true}
        isOpen={isPopoverActive}
        setIsOpen={setIsPopoverActive}
        trigger={
          <Menu.MenuButton
            id={`workspace-menu-${workspaceId}`}
            aria-label={localize('com_ui_workspace_menu_options')}
            aria-readonly={undefined}
            className={cn(
              'inline-flex h-7 w-7 items-center justify-center gap-2 rounded-md border-none p-0 text-sm font-medium ring-ring-primary transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50',
              isPopoverActive
                ? 'opacity-100'
                : 'opacity-0 focus:opacity-100 group-focus-within:opacity-100 group-hover:opacity-100 data-[open]:opacity-100',
            )}
            onClick={(e: MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation();
            }}
            onKeyDown={(e: React.KeyboardEvent<HTMLButtonElement>) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.stopPropagation();
              }
            }}
          >
            <Ellipsis className="icon-md text-text-secondary" aria-hidden={true} />
          </Menu.MenuButton>
        }
        items={dropdownItems}
        menuId={menuId}
        className="z-30"
      />
      {showDeleteDialog && (
        <DeleteWorkspaceDialog
          name={name}
          isLoading={deleteMutation.isLoading}
          onConfirm={confirmDelete}
          onCancel={() => setShowDeleteDialog(false)}
          triggerRef={deleteButtonRef}
        />
      )}
    </>
  );
}

export default memo(WorkspaceOptions, (prevProps, nextProps) => {
  return (
    prevProps.workspaceId === nextProps.workspaceId &&
    prevProps.name === nextProps.name &&
    prevProps.isPopoverActive === nextProps.isPopoverActive
  );
});
