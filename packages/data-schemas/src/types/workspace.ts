import { Document, Types } from 'mongoose';

export interface IWorkspace extends Document {
  name: string;
  description?: string;
  instructions?: string;
  user: Types.ObjectId;
  files?: string[];
  createdAt: Date;
  updatedAt: Date;
}
