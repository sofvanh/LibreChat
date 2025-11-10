export interface TWorkspace {
  _id: string;
  name: string;
  description?: string;
  instructions?: string;
  user: string;
  files?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TWorkspacesResponse {
  workspaces: TWorkspace[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface TCreateWorkspaceRequest {
  name: string;
  description?: string;
  instructions?: string;
}

export interface TWorkspaceConversation {
  conversationId: string;
  endpoint: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  user: string;
  model?: string;
  workspace_id?: string;
}

export interface TWorkspaceConversationsResponse {
  conversations: TWorkspaceConversation[];
  nextCursor: string | null;
}
