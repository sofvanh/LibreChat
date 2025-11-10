import { Schema } from 'mongoose';
import type { IWorkspace } from '~/types';

const workspaceSchema = new Schema<IWorkspace>(
  {
    name: {
      type: String,
      required: true,
      index: true,
    },
    description: {
      type: String,
    },
    instructions: {
      type: String,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    files: {
      type: [String],
      default: undefined,
    },
  },
  {
    timestamps: true,
  },
);

workspaceSchema.index({ user: 1, updatedAt: -1 });

export default workspaceSchema;
