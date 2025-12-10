import { useRef, useState } from 'react';
import * as Ariakit from '@ariakit/react';
import { Plus, FileText, Trash2, Loader2, FileImageIcon, FileType2Icon } from 'lucide-react';
import { EToolResources } from 'librechat-data-provider';
import { Button, Spinner, DropdownPopup } from '@librechat/client';
import FilePreview from '~/components/Chat/Input/Files/FilePreview';
import { getFileType, formatBytes } from '~/utils/files';
import { useLocalize } from '~/hooks';
import type { TFile } from 'librechat-data-provider';
import type { MenuItemProps } from '~/common';

interface WorkspaceFilesProps {
  files?: TFile[];
  onFileUpload?: (file: File, toolResource?: EToolResources) => Promise<void>;
  onRemoveFile?: (fileId: string) => void;
  isLoading?: boolean;
  fileTokens?: Record<string, number>;
}

function WorkspaceFiles({
  files = [],
  onFileUpload,
  onRemoveFile,
  isLoading,
  fileTokens = {},
}: WorkspaceFilesProps) {
  const localize = useLocalize();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedToolResource, setSelectedToolResource] = useState<EToolResources | undefined>();

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) {
      return '0 B';
    }
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${formatBytes(bytes)} ${sizes[i]}`;
  };

  const handleUploadClick = (toolResource?: EToolResources) => {
    setSelectedToolResource(toolResource);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      // For "Upload to Provider", only accept images and PDFs
      // For "Upload as Text", accept all files
      if (toolResource === undefined) {
        fileInputRef.current.accept = 'image/*,.pdf,application/pdf';
      } else {
        fileInputRef.current.accept = '';
      }
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onFileUpload) {
      await onFileUpload(file, selectedToolResource);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const dropdownItems: MenuItemProps[] = [
    {
      label: localize('com_ui_upload_provider'),
      onClick: () => handleUploadClick(undefined),
      icon: <FileImageIcon className="icon-md" />,
    },
    {
      label: localize('com_ui_upload_ocr_text'),
      onClick: () => handleUploadClick(EToolResources.context),
      icon: <FileType2Icon className="icon-md" />,
    },
  ];

  const menuTrigger = (
    <Ariakit.MenuButton
      disabled={isLoading}
      className="flex items-center gap-2 rounded-md border border-border-medium bg-surface-primary px-3 py-1.5 text-sm font-medium text-text-primary transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
      <span>{localize('com_ui_add_files')}</span>
    </Ariakit.MenuButton>
  );

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
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <DropdownPopup
            menuId="workspace-file-upload-menu"
            isOpen={isMenuOpen}
            setIsOpen={setIsMenuOpen}
            trigger={menuTrigger}
            items={dropdownItems}
          />
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
                  {file.type?.startsWith('image/') && file.filepath ? (
                    <div className="size-10 flex-shrink-0 overflow-hidden rounded-lg">
                      <img
                        src={file.filepath}
                        alt={file.filename}
                        className="size-full object-cover"
                      />
                    </div>
                  ) : (
                    <FilePreview file={file} fileType={getFileType(file.type)} />
                  )}
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate text-sm font-medium text-text-primary">
                      {file.filename}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {formatFileSize(file.bytes)}
                      {fileTokens[file.file_id] != null && (
                        <span className="ml-4">
                          {localize('com_ui_context_tokens', {
                            0: fileTokens[file.file_id].toLocaleString(),
                          })}
                        </span>
                      )}
                    </p>
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
