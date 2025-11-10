const express = require('express');
const { requireJwtAuth } = require('~/server/middleware');
const {
  createWorkspaceHandler,
  listWorkspacesHandler,
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

module.exports = router;
