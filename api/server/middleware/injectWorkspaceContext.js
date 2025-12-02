const { logger } = require('@librechat/data-schemas');
const { Constants } = require('librechat-data-provider');
const { getWorkspaceById } = require('~/models/Workspace');
const { getFiles } = require('~/models/File');

/**
 * Middleware to inject workspace context (instructions and files) into the request.
 * If a workspace_id is present in the request body, fetches the workspace's instructions
 * and files, adding them to the request for processing by downstream handlers.
 * Only runs on the first message of a chat (when parentMessageId is NO_PARENT).
 *
 * @param {ServerRequest} req - The Express request object
 * @param {Express.Response} res - The Express response object
 * @param {Function} next - The next middleware function
 */
async function injectWorkspaceContext(req, res, next) {
  try {
    const { workspace_id, parentMessageId } = req.body;

    if (!workspace_id) {
      return next();
    }

    // Only inject workspace context on the first message in a chat
    if (parentMessageId !== Constants.NO_PARENT) {
      return next();
    }

    // Get workspace to verify it exists and user has access
    const workspace = await getWorkspaceById(workspace_id, req.user.id);

    if (!workspace) {
      return next();
    }

    // Inject workspace instructions into promptPrefix
    if (workspace.instructions) {
      const existingPrefix = req.body.promptPrefix || '';
      req.body.promptPrefix = existingPrefix
        ? `${workspace.instructions}\n\n${existingPrefix}`
        : workspace.instructions;
      logger.debug(
        `[injectWorkspaceContext] Added workspace instructions for workspace ${workspace_id}`,
      );
    }

    // Inject workspace files if any exist
    if (workspace.files?.length) {
      const workspaceFiles = await getFiles({ file_id: { $in: workspace.files } });

      if (workspaceFiles && workspaceFiles.length > 0) {
        req.body.files = [...(req.body.files || []), ...workspaceFiles];
        logger.debug(
          `[injectWorkspaceContext] Added ${workspaceFiles.length} workspace files for workspace ${workspace_id}`,
        );
      } else {
        logger.debug(
          `[injectWorkspaceContext] Couldn't find workspace files for workspace ${workspace_id}`,
        );
      }
    }

    next();
  } catch (error) {
    logger.error('[injectWorkspaceContext] Error injecting workspace context:', error);
    next();
  }
}

module.exports = injectWorkspaceContext;
