import mongoose from 'mongoose';
import { AssignmentModel } from '../models/Assignment';
import { Assignment } from '../types';

function toAssignment(doc: { toJSON: () => unknown } | null): Assignment | null {
  if (!doc) return null;
  return doc.toJSON() as Assignment;
}

export const dbStore = {
  async getAllForTeacher(teacherId: string): Promise<Assignment[]> {
    const docs = await AssignmentModel.find({ teacherId })
      .sort({ createdAt: -1 });
    return docs.map((doc) => doc.toJSON() as Assignment);
  },

  async getById(id: string): Promise<Assignment | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    const doc = await AssignmentModel.findById(id);
    return toAssignment(doc);
  },

  async create(data: Partial<Assignment> & { teacherId: string }): Promise<Assignment> {
    const doc = new AssignmentModel(data);
    await doc.save();
    return doc.toJSON() as Assignment;
  },

  async update(id: string, data: Partial<Assignment>): Promise<Assignment | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    const doc = await AssignmentModel.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    return toAssignment(doc);
  },

  async delete(id: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return false;
    }
    const res = await AssignmentModel.findByIdAndDelete(id);
    return res !== null;
  },
};
