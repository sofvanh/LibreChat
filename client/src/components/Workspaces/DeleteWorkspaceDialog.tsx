import {
  Button,
  Spinner,
  OGDialog,
  OGDialogTitle,
  OGDialogHeader,
  OGDialogContent,
} from '@librechat/client';
import { useLocalize } from '~/hooks';

interface DeleteWorkspaceDialogProps {
  name: string;
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  triggerRef?: React.RefObject<HTMLButtonElement>;
}

export default function DeleteWorkspaceDialog({
  name,
  isLoading,
  onConfirm,
  onCancel,
  triggerRef,
}: DeleteWorkspaceDialogProps) {
  const localize = useLocalize();

  return (
    <OGDialog open={true} onOpenChange={(open) => !open && onCancel()} triggerRef={triggerRef}>
      <OGDialogContent
        title={localize('com_ui_delete_workspace')}
        className="w-11/12 max-w-md"
        showCloseButton={false}
      >
        <OGDialogHeader>
          <OGDialogTitle>{localize('com_ui_delete_workspace')}</OGDialogTitle>
        </OGDialogHeader>
        <div className="w-full truncate">
          {localize('com_ui_delete_confirm')} <strong>{name}</strong>?
        </div>
        <div className="flex justify-end gap-4 pt-4">
          <Button aria-label="cancel" variant="outline" onClick={onCancel}>
            {localize('com_ui_cancel')}
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? <Spinner /> : localize('com_ui_delete')}
          </Button>
        </div>
      </OGDialogContent>
    </OGDialog>
  );
}
