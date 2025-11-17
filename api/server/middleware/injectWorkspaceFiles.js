const { logger } = require('@librechat/data-schemas');
const { getWorkspaceById } = require('~/models/Workspace');
const { getFiles } = require('~/models/File');

/**
 * Middleware to inject workspace files into the request.
 * If a workspace_id is present in the request body, fetches the workspace's files
 * and adds them to req.body.files for processing by downstream handlers.
 *
 * @param {ServerRequest} req - The Express request object
 * @param {Express.Response} res - The Express response object
 * @param {Function} next - The next middleware function
 */
async function injectWorkspaceFiles(req, res, next) {
  try {
    const { workspace_id } = req.body;

    if (!workspace_id) {
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
      return next();
    }

    // Merge with existing files (deduplication handled by processFiles)
    req.body.files = [...(req.body.files || []), ...workspaceFiles];

    logger.debug(
      `[injectWorkspaceFiles] Added ${workspaceFiles.length} workspace files for workspace ${workspace_id}`,
    );

    next();
  } catch (error) {
    // Log but don't fail - workspace files are optional
    logger.error('[injectWorkspaceFiles] Error injecting workspace files:', error);
    next();
  }
}

module.exports = injectWorkspaceFiles;
