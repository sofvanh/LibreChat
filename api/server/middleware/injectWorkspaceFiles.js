const { logger } = require('@librechat/data-schemas');
const { Constants } = require('librechat-data-provider');
const { getWorkspaceById } = require('~/models/Workspace');
const { getFiles } = require('~/models/File');

/**
 * Middleware to inject workspace files into the request.
 * If a workspace_id is present in the request body, fetches the workspace's files
 * and adds them to req.body.files for processing by downstream handlers.
 * Only runs on the first message of a chat (when parentMessageId is NO_PARENT).
 *
 * @param {ServerRequest} req - The Express request object
 * @param {Express.Response} res - The Express response object
 * @param {Function} next - The next middleware function
 */
async function injectWorkspaceFiles(req, res, next) {
  try {
    const { workspace_id, parentMessageId } = req.body;

    if (!workspace_id) {
      return next();
    }

    // Only inject workspace files on the first message in a chat
    if (parentMessageId !== Constants.NO_PARENT) {
      return next();
    }

    // Get workspace to verify it exists and user has access
    const workspace = await getWorkspaceById(workspace_id, req.user.id);

    if (!workspace || !workspace.files?.length) {
      return next();
    }

    // Fetch workspace files
    const workspaceFiles = await getFiles({ file_id: { $in: workspace.files } });

    if (!workspaceFiles || workspaceFiles.length === 0) {
      logger.debug(
        `[injectWorkspaceFiles] Couldn't find workspace files for workspace ${workspace_id}`,
      );
      return next();
    }

    // Merge with existing files
    req.body.files = [...(req.body.files || []), ...workspaceFiles];

    logger.debug(
      `[injectWorkspaceFiles] Added ${workspaceFiles.length} workspace files for workspace ${workspace_id}`,
    );

    next();
  } catch (error) {
    logger.error('[injectWorkspaceFiles] Error injecting workspace files:', error);
    next();
  }
}

module.exports = injectWorkspaceFiles;
