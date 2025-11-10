import workspaceSchema from '~/schema/workspace';
import type { IWorkspace } from '~/types';

/**
 * Creates or returns the Workspace model using the provided mongoose instance and schema
 */
export function createWorkspaceModel(mongoose: typeof import('mongoose')) {
  return mongoose.models.Workspace || mongoose.model<IWorkspace>('Workspace', workspaceSchema);
}
