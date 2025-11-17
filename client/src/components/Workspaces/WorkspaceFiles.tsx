import { Plus, FileText, Trash2, Loader2 } from 'lucide-react';
import { Button, Spinner } from '@librechat/client';
import { useLocalize } from '~/hooks';
import type { TFile } from 'librechat-data-provider';

interface WorkspaceFilesProps {
  files?: TFile[];
  onAddFiles?: () => void;
  onRemoveFile?: (fileId: string) => void;
  isLoading?: boolean;
}

function WorkspaceFiles({ files = [], onAddFiles, onRemoveFile, isLoading }: WorkspaceFilesProps) {
  const localize = useLocalize();

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) {
      return `${bytes} B`;
    } else if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    } else {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
  };

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
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            <span>{localize('com_ui_add_files')}</span>
          </Button>
        </div>

        <p className="mb-4 text-sm text-text-secondary">
          {localize('com_ui_workspace_files_description')}
        </p>

        {isLoading && files.length === 0 && (
          <div className="flex h-24 items-center justify-center rounded-lg border border-border-light bg-surface-primary">
            <Spinner />
          </div>
        )}

        {files.length > 0 && (
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.file_id}
                className="flex items-center justify-between rounded-lg border border-border-light bg-surface-primary p-3"
              >
                <div className="flex flex-1 items-center gap-3 overflow-hidden">
                  <FileText className="size-4 flex-shrink-0 text-text-secondary" />
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate text-sm font-medium text-text-primary">
                      {file.filename}
                    </p>
                    <p className="text-xs text-text-secondary">{formatFileSize(file.bytes)}</p>
                  </div>
                </div>
                {onRemoveFile && (
                  <Button
                    onClick={() => onRemoveFile(file.file_id)}
                    variant="ghost"
                    size="sm"
                    className="ml-2 flex-shrink-0 hover:bg-red-500/10 hover:text-red-500"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {!isLoading && files.length === 0 && (
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
