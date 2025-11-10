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
