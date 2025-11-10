const { logger } = require('@librechat/data-schemas');
const { createWorkspace, getWorkspacesByUser } = require('~/models/Workspace');

/**
 * Creates a new workspace.
 * @route POST /api/workspaces
 * @param {Object} req.body - The workspace data
 * @param {string} req.body.name - Workspace name (required)
 * @param {string} [req.body.description] - Workspace description
 * @param {string} [req.body.instructions] - Custom system prompt
 * @returns {Object} 201 - Created workspace
 */
const createWorkspaceHandler = async (req, res) => {
  try {
    const { name, description, instructions } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Workspace name is required' });
    }

    const workspaceData = {
      name: name.trim(),
      user: req.user.id,
    };

    if (description) {
      workspaceData.description = description.trim();
    }

    if (instructions) {
      workspaceData.instructions = instructions.trim();
    }

    const workspace = await createWorkspace(workspaceData);

    return res.status(201).json(workspace);
  } catch (error) {
    logger.error('[createWorkspaceHandler] Error:', error);
    return res.status(500).json({ error: 'Failed to create workspace' });
  }
};

/**
 * Lists user's workspaces with pagination.
 * @route GET /api/workspaces
 * @param {Object} req.query - Query parameters
 * @param {number} [req.query.limit=20] - Number of workspaces per page
 * @param {number} [req.query.page=1] - Page number
 * @returns {Object} 200 - Workspaces list with pagination info
 */
const listWorkspacesHandler = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const skip = (page - 1) * limit;

    const { workspaces, total } = await getWorkspacesByUser(req.user.id, {
      limit,
      skip,
    });

    return res.status(200).json({
      workspaces,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('[listWorkspacesHandler] Error:', error);
    return res.status(500).json({ error: 'Failed to fetch workspaces' });
  }
};

module.exports = {
  createWorkspaceHandler,
  listWorkspacesHandler,
};
