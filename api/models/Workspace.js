const { logger } = require('@librechat/data-schemas');
const { Workspace } = require('~/db/models');

/**
 * Create a new workspace for a user.
 * @param {Object} workspaceData - The workspace data
 * @param {string} workspaceData.name - Workspace name (required)
 * @param {string} [workspaceData.description] - Workspace description
 * @param {string} [workspaceData.instructions] - Custom system prompt
 * @param {string} workspaceData.user - User ID (required)
 * @returns {Promise<Object>} The created workspace as a plain object
 */
const createWorkspace = async (workspaceData) => {
  try {
    const workspace = await Workspace.create(workspaceData);
    return workspace.toObject();
  } catch (error) {
    logger.error('[createWorkspace] Error creating workspace:', error);
    throw error;
  }
};

/**
 * Get workspaces for a user with pagination.
 * @param {string} userId - The user ID
 * @param {Object} options - Query options
 * @param {number} [options.limit=20] - Number of workspaces to return
 * @param {number} [options.skip=0] - Number of workspaces to skip
 * @param {Object} [options.sort={ updatedAt: -1 }] - Sort order
 * @returns {Promise<Object>} Object containing workspaces array and total count
 */
const getWorkspacesByUser = async (userId, options = {}) => {
  try {
    const { limit = 20, skip = 0, sort = { updatedAt: -1 } } = options;

    const [workspaces, total] = await Promise.all([
      Workspace.find({ user: userId }).sort(sort).skip(skip).limit(limit).lean(),
      Workspace.countDocuments({ user: userId }),
    ]);

    return { workspaces, total };
  } catch (error) {
    logger.error('[getWorkspacesByUser] Error fetching workspaces:', error);
    throw error;
  }
};

/**
 * Get a workspace by ID.
 * @param {string} workspaceId - The workspace ID
 * @param {string} userId - The user ID (for ownership verification)
 * @returns {Promise<Object|null>} The workspace as a plain object, or null if not found
 */
const getWorkspaceById = async (workspaceId, userId) => {
  try {
    return await Workspace.findOne({ _id: workspaceId, user: userId }).lean();
  } catch (error) {
    logger.error('[getWorkspaceById] Error fetching workspace:', error);
    throw error;
  }
};

/**
 * Update a workspace.
 * @param {string} workspaceId - The workspace ID
 * @param {string} userId - The user ID (for ownership verification)
 * @param {Object} updateData - The data to update
 * @returns {Promise<Object|null>} The updated workspace as a plain object, or null if not found
 */
const updateWorkspace = async (workspaceId, userId, updateData) => {
  try {
    return await Workspace.findOneAndUpdate({ _id: workspaceId, user: userId }, updateData, {
      new: true,
      lean: true,
    });
  } catch (error) {
    logger.error('[updateWorkspace] Error updating workspace:', error);
    throw error;
  }
};

/**
 * Delete a workspace.
 * @param {string} workspaceId - The workspace ID
 * @param {string} userId - The user ID (for ownership verification)
 * @returns {Promise<Object|null>} The deleted workspace, or null if not found
 */
const deleteWorkspace = async (workspaceId, userId) => {
  try {
    return await Workspace.findOneAndDelete({ _id: workspaceId, user: userId }).lean();
  } catch (error) {
    logger.error('[deleteWorkspace] Error deleting workspace:', error);
    throw error;
  }
};

module.exports = {
  createWorkspace,
  getWorkspacesByUser,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
};
