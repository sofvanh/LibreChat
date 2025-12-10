const express = require('express');
const { requireJwtAuth } = require('~/server/middleware');
const {
  createWorkspaceHandler,
  listWorkspacesHandler,
  getWorkspaceHandler,
  updateWorkspaceHandler,
  getWorkspaceConversationsHandler,
  getWorkspaceFilesHandler,
  getWorkspaceContextHandler,
  manageWorkspaceFilesHandler,
} = require('~/server/controllers/WorkspaceController');

const router = express.Router();

router.use(requireJwtAuth);

/**
 * Creates a new workspace.
 * @route POST /workspaces
 * @param {Object} req.body - The workspace data
 * @returns {Object} 201 - Created workspace
 */
router.post('/', createWorkspaceHandler);

/**
 * Lists user's workspaces with pagination.
 * @route GET /workspaces
 * @param {Object} req.query - Query parameters for pagination
 * @returns {Object} 200 - Workspaces list with pagination
 */
router.get('/', listWorkspacesHandler);

/**
 * Gets a workspace by ID.
 * @route GET /workspaces/:id
 * @param {string} req.params.id - Workspace ID
 * @returns {Object} 200 - Workspace details
 */
router.get('/:id', getWorkspaceHandler);

/**
 * Updates a workspace by ID.
 * @route PATCH /workspaces/:id
 * @param {string} req.params.id - Workspace ID
 * @param {Object} req.body - The update data
 * @returns {Object} 200 - Updated workspace
 */
router.patch('/:id', updateWorkspaceHandler);

/**
 * Gets conversations for a workspace.
 * @route GET /workspaces/:id/conversations
 * @param {string} req.params.id - Workspace ID
 * @returns {Object} 200 - Conversations list
 */
router.get('/:id/conversations', getWorkspaceConversationsHandler);

/**
 * Gets files for a workspace.
 * @route GET /workspaces/:id/files
 * @param {string} req.params.id - Workspace ID
 * @returns {Object} 200 - Files list
 */
router.get('/:id/files', getWorkspaceFilesHandler);

/**
 * Gets token count for workspace context (instructions + files).
 * @route GET /workspaces/:id/context
 * @param {string} req.params.id - Workspace ID
 * @returns {Object} 200 - Token count and breakdown
 */
router.get('/:id/context', getWorkspaceContextHandler);

/**
 * Manages files for a workspace (add or remove).
 * @route PATCH /workspaces/:id/files
 * @param {string} req.params.id - Workspace ID
 * @param {Object} req.body - Action and file IDs
 * @returns {Object} 200 - Updated workspace
 */
router.patch('/:id/files', manageWorkspaceFilesHandler);

module.exports = router;
