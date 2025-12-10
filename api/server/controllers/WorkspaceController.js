const { logger } = require('@librechat/data-schemas');
const {
  createWorkspace,
  getWorkspacesByUser,
  getWorkspaceById,
  updateWorkspace,
} = require('~/models/Workspace');
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
 * Updates a workspace.
 * @route PATCH /api/workspaces/:id
 * @param {string} req.params.id - Workspace ID
 * @param {Object} req.body - The update data
 * @param {string} [req.body.name] - Workspace name
 * @param {string} [req.body.description] - Workspace description
 * @param {string} [req.body.instructions] - Custom system prompt
 * @returns {Object} 200 - Updated workspace
 */
const updateWorkspaceHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, instructions } = req.body;

    // Build update data object with only provided fields
    const updateData = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ error: 'Workspace name cannot be empty' });
      }
      updateData.name = name.trim();
    }

    if (description !== undefined) {
      updateData.description = description ? description.trim() : '';
    }

    if (instructions !== undefined) {
      updateData.instructions = instructions ? instructions.trim() : '';
    }

    // If no fields to update, return error
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const workspace = await updateWorkspace(id, req.user.id, updateData);

    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    return res.status(200).json(workspace);
  } catch (error) {
    logger.error('[updateWorkspaceHandler] Error:', error);
    return res.status(500).json({ error: 'Failed to update workspace' });
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

/**
 * Gets files associated with a workspace.
 * @route GET /api/workspaces/:id/files
 * @param {string} req.params.id - Workspace ID
 * @returns {Object} 200 - Array of files
 */
const getWorkspaceFilesHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { getFiles } = require('~/models/File');

    // Verify workspace ownership
    const workspace = await getWorkspaceById(id, req.user.id);
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    if (!workspace.files || workspace.files.length === 0) {
      return res.status(200).json([]);
    }

    // Fetch workspace files
    const files = await getFiles({ file_id: { $in: workspace.files } }, null, { text: 0 });

    return res.status(200).json(files);
  } catch (error) {
    logger.error('[getWorkspaceFilesHandler] Error:', error);
    return res.status(500).json({ error: 'Failed to fetch workspace files' });
  }
};

/**
 * Manages files for a workspace (add or remove).
 * @route PATCH /api/workspaces/:id/files
 * @param {string} req.params.id - Workspace ID
 * @param {Object} req.body - Request body
 * @param {string} req.body.action - Action to perform ('add' or 'remove')
 * @param {string[]} req.body.file_ids - Array of file IDs
 * @returns {Object} 200 - Updated workspace
 */
/**
 * Gets the token count for workspace context (instructions + files).
 * @route GET /api/workspaces/:id/context
 * @param {string} req.params.id - Workspace ID
 * @returns {Object} 200 - Token count with per-file breakdown
 */
const getWorkspaceContextHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { getFiles } = require('~/models/File');
    const countTokens = require('~/server/utils/countTokens');

    // Verify workspace ownership
    const workspace = await getWorkspaceById(id, req.user.id);
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    let instructionsTokens = 0;
    let filesTokens = 0;
    let unknownBytes = 0;
    const fileTokens = {};

    // Count tokens for instructions
    if (workspace.instructions) {
      instructionsTokens = await countTokens(workspace.instructions);
    }

    // Count tokens for files
    if (workspace.files && workspace.files.length > 0) {
      // Fetch files WITH text field (pass null to include text, which is excluded by default)
      const files = await getFiles({ file_id: { $in: workspace.files } }, null, null);

      for (const file of files) {
        let tokens = 0;

        if (file.text) {
          // Text files: count actual tokens
          tokens = await countTokens(file.text);
        } else if (file.type && file.type.startsWith('image/') && file.width && file.height) {
          // Images: estimate using min((width * height) / 750, 1600)
          tokens = Math.min(Math.ceil((file.width * file.height) / 750), 1600);
        } else {
          // Unknown: track bytes
          unknownBytes += file.bytes || 0;
        }

        if (tokens > 0) {
          fileTokens[file.file_id] = tokens;
          filesTokens += tokens;
        }
      }
    }

    const totalTokens = instructionsTokens + filesTokens;

    return res.status(200).json({
      tokenCount: totalTokens,
      breakdown: {
        instructions: instructionsTokens,
        files: filesTokens,
      },
      fileTokens,
      unknownBytes,
    });
  } catch (error) {
    logger.error('[getWorkspaceContextHandler] Error:', error);
    return res.status(500).json({ error: 'Failed to get workspace context' });
  }
};

const manageWorkspaceFilesHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, file_ids } = req.body;
    const { getFiles } = require('~/models/File');

    // Validate input
    if (!action || !['add', 'remove'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action. Must be "add" or "remove"' });
    }

    if (!file_ids || !Array.isArray(file_ids) || file_ids.length === 0) {
      return res.status(400).json({ error: 'file_ids must be a non-empty array' });
    }

    // Verify workspace ownership
    const workspace = await getWorkspaceById(id, req.user.id);
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    if (action === 'add') {
      // Verify user has access to all files
      const files = await getFiles({ file_id: { $in: file_ids } });

      if (files.length !== file_ids.length) {
        return res.status(404).json({ error: 'One or more files not found' });
      }

      // Check that user owns all files
      const nonOwnedFiles = files.filter((file) => file.user.toString() !== req.user.id.toString());
      if (nonOwnedFiles.length > 0) {
        return res.status(403).json({ error: 'You can only add files you own to the workspace' });
      }

      // Add files to workspace (avoid duplicates)
      const currentFiles = workspace.files || [];
      const newFiles = file_ids.filter((fileId) => !currentFiles.includes(fileId));
      const updatedFiles = [...currentFiles, ...newFiles];

      const updatedWorkspace = await updateWorkspace(id, req.user.id, { files: updatedFiles });

      return res.status(200).json(updatedWorkspace);
    } else if (action === 'remove') {
      // Remove files from workspace
      const currentFiles = workspace.files || [];
      const updatedFiles = currentFiles.filter((fileId) => !file_ids.includes(fileId));

      const updatedWorkspace = await updateWorkspace(id, req.user.id, { files: updatedFiles });

      return res.status(200).json(updatedWorkspace);
    }
  } catch (error) {
    logger.error('[manageWorkspaceFilesHandler] Error:', error);
    return res.status(500).json({ error: 'Failed to manage workspace files' });
  }
};

module.exports = {
  createWorkspaceHandler,
  listWorkspacesHandler,
  getWorkspaceHandler,
  updateWorkspaceHandler,
  getWorkspaceConversationsHandler,
  getWorkspaceFilesHandler,
  getWorkspaceContextHandler,
  manageWorkspaceFilesHandler,
};
