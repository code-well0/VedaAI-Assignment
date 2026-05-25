import { TeacherModel } from '../models/Teacher';
import { Teacher } from '../types';

export interface TeacherProfileInput {
  externalId: string;
  name: string;
  subject: string;
  classes: string[];
  schoolName: string;
  schoolAddress?: string;
  avatar?: string;
}

export const teacherStore = {
  async upsertByExternalId(input: TeacherProfileInput): Promise<Teacher> {
    const doc = await TeacherModel.findOneAndUpdate(
      { externalId: input.externalId },
      {
        $set: {
          name: input.name.trim(),
          subject: input.subject.trim(),
          classes: input.classes.map((c) => c.trim()).filter(Boolean),
          schoolName: input.schoolName.trim(),
          schoolAddress: (input.schoolAddress || '').trim(),
          avatar: input.avatar || '',
        },
      },
      { upsert: true, new: true, runValidators: true }
    );
    return doc.toJSON() as Teacher;
  },

  async getByExternalId(externalId: string, withAssignments = false): Promise<Teacher | null> {
    let query = TeacherModel.findOne({ externalId });
    if (withAssignments) {
      query = query.populate({
        path: 'assignments',
        options: { sort: { createdAt: -1 } },
      });
    }
    const doc = await query;
    return doc ? (doc.toJSON() as Teacher) : null;
  },

  async getMongoIdByExternalId(externalId: string): Promise<string | null> {
    const doc = await TeacherModel.findOne({ externalId }).select('_id');
    return doc ? doc._id.toString() : null;
  },
};
