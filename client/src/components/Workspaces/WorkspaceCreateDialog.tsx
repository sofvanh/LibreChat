import { useState } from 'react';
import { useCreateWorkspaceMutation } from '~/data-provider';
import { OGDialog, OGDialogTemplate, Label, Input, useToastContext } from '@librechat/client';
import { useLocalize } from '~/hooks';

interface WorkspaceCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function WorkspaceCreateDialog({ open, onOpenChange }: WorkspaceCreateDialogProps) {
  const localize = useLocalize();
  const { showToast } = useToastContext();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const createWorkspace = useCreateWorkspaceMutation();

  const handleSave = () => {
    if (!name.trim()) {
      showToast({
        message: localize('com_ui_field_required'),
        status: 'error',
      });
      return;
    }

    createWorkspace.mutate(
      {
        name: name.trim(),
        description: description.trim() || undefined,
      },
      {
        onSuccess: () => {
          showToast({
            message: localize('com_ui_workspace_created'),
            status: 'success',
          });
          setName('');
          setDescription('');
          onOpenChange(false);
        },
        onError: (error) => {
          showToast({
            message: error.message || localize('com_ui_error_workspace_create'),
            status: 'error',
          });
        },
      },
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
      handleSave();
    }
  };

  return (
    <OGDialog open={open} onOpenChange={onOpenChange}>
      <OGDialogTemplate
        title={localize('com_ui_new_workspace')}
        showCloseButton={false}
        className="w-11/12 md:max-w-lg"
        main={
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="workspace-name" className="text-sm font-medium">
                {localize('com_ui_name')} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="workspace-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={localize('com_ui_workspace_name_placeholder')}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workspace-description" className="text-sm font-medium">
                {localize('com_ui_description')}
              </Label>
              <Input
                id="workspace-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={localize('com_ui_workspace_description_placeholder')}
                className="w-full"
              />
            </div>
          </div>
        }
        selection={{
          selectHandler: handleSave,
          selectClasses: 'bg-green-500 hover:bg-green-600 text-white',
          selectText: createWorkspace.isLoading
            ? localize('com_ui_creating')
            : localize('com_ui_create'),
        }}
      />
    </OGDialog>
  );
}
