import { QueryKeys, dataService } from 'librechat-data-provider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  UseQueryOptions,
  UseMutationResult,
  QueryObserverResult,
} from '@tanstack/react-query';
import type {
  TWorkspace,
  TWorkspacesResponse,
  TCreateWorkspaceRequest,
  TUpdateWorkspaceRequest,
  TWorkspaceConversationsResponse,
} from 'librechat-data-provider';

export const useWorkspacesQuery = (
  page = 1,
  limit = 20,
  config?: UseQueryOptions<TWorkspacesResponse>,
): QueryObserverResult<TWorkspacesResponse> => {
  return useQuery<TWorkspacesResponse>(
    [QueryKeys.workspaces, page, limit],
    () => dataService.getWorkspaces(page, limit),
    {
      refetchOnWindowFocus: false,
      staleTime: 60000, // 1 minute
      ...config,
    },
  );
};

export const useCreateWorkspaceMutation = (): UseMutationResult<
  TWorkspace,
  Error,
  TCreateWorkspaceRequest
> => {
  const queryClient = useQueryClient();
  return useMutation((data: TCreateWorkspaceRequest) => dataService.createWorkspace(data), {
    onSuccess: () => {
      queryClient.invalidateQueries([QueryKeys.workspaces]);
    },
  });
};

export const useUpdateWorkspaceMutation = (): UseMutationResult<
  TWorkspace,
  Error,
  { id: string; data: TUpdateWorkspaceRequest }
> => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ id, data }: { id: string; data: TUpdateWorkspaceRequest }) =>
      dataService.updateWorkspace(id, data),
    {
      onSuccess: (updatedWorkspace) => {
        // Update the individual workspace query
        queryClient.setQueryData<TWorkspace>(
          [QueryKeys.workspaces, updatedWorkspace._id],
          updatedWorkspace,
        );
        // Invalidate the workspaces list to refresh
        queryClient.invalidateQueries([QueryKeys.workspaces]);
      },
    },
  );
};

export const useWorkspaceQuery = (
  id: string,
  config?: UseQueryOptions<TWorkspace>,
): QueryObserverResult<TWorkspace> => {
  return useQuery<TWorkspace>([QueryKeys.workspaces, id], () => dataService.getWorkspaceById(id), {
    refetchOnWindowFocus: false,
    staleTime: 60000, // 1 minute
    enabled: !!id,
    ...config,
  });
};

export const useWorkspaceConversationsQuery = (
  id: string,
  cursor?: string,
  limit = 25,
  config?: UseQueryOptions<TWorkspaceConversationsResponse>,
): QueryObserverResult<TWorkspaceConversationsResponse> => {
  return useQuery<TWorkspaceConversationsResponse>(
    [QueryKeys.workspaces, id, 'conversations', cursor, limit],
    () => dataService.getWorkspaceConversations(id, cursor, limit),
    {
      refetchOnWindowFocus: false,
      staleTime: 30000, // 30 seconds
      enabled: !!id,
      ...config,
    },
  );
};
