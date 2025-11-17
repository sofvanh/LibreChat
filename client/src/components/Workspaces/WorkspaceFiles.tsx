import { Plus, FileText, Trash2 } from 'lucide-react';
import { Button } from '@librechat/client';
import { useLocalize } from '~/hooks';

interface WorkspaceFilesProps {
  fileIds?: string[];
  onAddFiles?: () => void;
  onRemoveFile?: (fileId: string) => void;
}

function WorkspaceFiles({ fileIds = [], onAddFiles, onRemoveFile }: WorkspaceFilesProps) {
  const localize = useLocalize();

  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-xl border border-border-light bg-surface-secondary p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="size-6 text-text-secondary" />
            <h2 className="text-lg font-semibold text-text-primary">
              {localize('com_ui_workspace_files')}
            </h2>
          </div>
          <Button
            onClick={onAddFiles}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="size-4" />
            <span>{localize('com_ui_add_files')}</span>
          </Button>
        </div>

        <p className="mb-4 text-sm text-text-secondary">
          {localize('com_ui_workspace_files_description')}
        </p>

        {fileIds.length > 0 ? (
          <div className="space-y-2">
            {fileIds.map((fileId) => (
              <div
                key={fileId}
                className="flex items-center justify-between rounded-lg border border-border-light bg-surface-primary p-3"
              >
                <div className="flex items-center gap-3">
                  <FileText className="size-4 text-text-secondary" />
                  <span className="font-mono text-sm text-text-primary">{fileId}</span>
                </div>
                {onRemoveFile && (
                  <Button
                    onClick={() => onRemoveFile(fileId)}
                    variant="ghost"
                    size="sm"
                    className="hover:bg-red-500/10 hover:text-red-500"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-24 items-center justify-center rounded-lg border border-border-light bg-surface-primary">
            <p className="text-sm italic text-text-secondary">
              {localize('com_ui_no_files_workspace')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default WorkspaceFiles;
