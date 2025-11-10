const express = require('express');
const { requireJwtAuth } = require('~/server/middleware');
const {
  createWorkspaceHandler,
  listWorkspacesHandler,
  getWorkspaceHandler,
  getWorkspaceConversationsHandler,
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
 * Gets conversations for a workspace.
 * @route GET /workspaces/:id/conversations
 * @param {string} req.params.id - Workspace ID
 * @returns {Object} 200 - Conversations list
 */
router.get('/:id/conversations', getWorkspaceConversationsHandler);

module.exports = router;
