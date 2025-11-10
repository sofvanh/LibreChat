const { logger } = require('@librechat/data-schemas');
const { createWorkspace, getWorkspacesByUser, getWorkspaceById } = require('~/models/Workspace');
const { Conversation } = require('~/db/models');

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

/**
 * Gets a workspace by ID.
 * @route GET /api/workspaces/:id
 * @param {string} req.params.id - Workspace ID
 * @returns {Object} 200 - Workspace details
 */
const getWorkspaceHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const workspace = await getWorkspaceById(id, req.user.id);

    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    return res.status(200).json(workspace);
  } catch (error) {
    logger.error('[getWorkspaceHandler] Error:', error);
    return res.status(500).json({ error: 'Failed to fetch workspace' });
  }
};

/**
 * Gets conversations associated with a workspace.
 * @route GET /api/workspaces/:id/conversations
 * @param {string} req.params.id - Workspace ID
 * @param {Object} req.query - Query parameters
 * @param {number} [req.query.limit=25] - Number of conversations per page
 * @param {string} [req.query.cursor] - Cursor for pagination
 * @returns {Object} 200 - Conversations list with pagination
 */
const getWorkspaceConversationsHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const limit = Math.min(parseInt(req.query.limit) || 25, 100);
    const cursor = req.query.cursor;

    // Verify workspace ownership
    const workspace = await getWorkspaceById(id, req.user.id);
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    // Build query filters
    const filters = [
      { user: req.user.id },
      { workspace_id: id },
      { $or: [{ expiredAt: null }, { expiredAt: { $exists: false } }] },
    ];

    if (cursor) {
      filters.push({ updatedAt: { $lt: new Date(cursor) } });
    }

    const query = { $and: filters };

    const conversations = await Conversation.find(query)
      .select('conversationId endpoint title createdAt updatedAt user model workspace_id')
      .sort({ updatedAt: -1 })
      .limit(limit + 1)
      .lean();

    let nextCursor = null;
    if (conversations.length > limit) {
      const lastConvo = conversations.pop();
      nextCursor = lastConvo.updatedAt.toISOString();
    }

    return res.status(200).json({
      conversations,
      nextCursor,
    });
  } catch (error) {
    logger.error('[getWorkspaceConversationsHandler] Error:', error);
    return res.status(500).json({ error: 'Failed to fetch workspace conversations' });
  }
};

module.exports = {
  createWorkspaceHandler,
  listWorkspacesHandler,
  getWorkspaceHandler,
  getWorkspaceConversationsHandler,
};
