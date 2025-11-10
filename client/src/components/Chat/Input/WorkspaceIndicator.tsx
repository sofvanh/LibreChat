import React, { memo } from 'react';
import { FolderKanban } from 'lucide-react';
import { CheckboxButton } from '@librechat/client';
import { useChatContext } from '~/Providers';
import { useWorkspaceQuery } from '~/data-provider';

function WorkspaceIndicator() {
  const { conversation } = useChatContext();
  const workspaceId = conversation?.workspace_id;

  const { data: workspace } = useWorkspaceQuery(workspaceId ?? '', {
    enabled: !!workspaceId,
  });

  if (!workspaceId || !workspace) {
    return null;
  }

  return (
    <CheckboxButton
      className="pointer-events-none max-w-fit"
      checked={true}
      setValue={() => {}}
      label={workspace.name}
      isCheckedClassName="border-purple-600/40 bg-purple-500/10 hover:bg-purple-700/10"
      icon={<FolderKanban className="icon-md" />}
    />
  );
}

export default memo(WorkspaceIndicator);
