import { FolderKanban } from 'lucide-react';

interface WorkspaceCardProps {
  title: string;
  description: string;
  updatedAt: string;
  onClick?: () => void;
}

export default function WorkspaceCard({
  title,
  description,
  updatedAt,
  onClick,
}: WorkspaceCardProps) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col gap-3 rounded-lg border border-border-light bg-surface-primary p-6 text-left transition-all hover:border-border-medium hover:bg-surface-secondary"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-surface-secondary transition-all group-hover:bg-surface-tertiary">
            <FolderKanban className="size-5 text-text-secondary" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
        </div>
      </div>
      <p className="line-clamp-2 text-sm text-text-secondary">{description}</p>
      <div className="text-xs text-text-tertiary">{updatedAt}</div>
    </button>
  );
}
