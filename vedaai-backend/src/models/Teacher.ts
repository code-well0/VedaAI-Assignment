import mongoose, { Schema, Document } from 'mongoose';
import { Teacher as ITeacher } from '../types';

const TeacherSchema = new Schema(
  {
    externalId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    classes: { type: [String], default: [] },
    schoolName: { type: String, required: true, trim: true },
    schoolAddress: { type: String, default: '' },
    avatar: { type: String, default: '' },
  },
  { timestamps: true }
);

TeacherSchema.virtual('id').get(function (this: { _id: mongoose.Types.ObjectId }) {
  return this._id.toHexString();
});

TeacherSchema.virtual('assignments', {
  ref: 'Assignment',
  localField: '_id',
  foreignField: 'teacherId',
});

TeacherSchema.set('toJSON', {
  virtuals: true,
  transform(_doc, ret) {
    const r = ret as Record<string, unknown>;
    if (r._id) {
      r.id = String(r._id);
      delete r._id;
    }
    delete r.__v;
    return r;
  },
});

export interface TeacherDocument extends Omit<ITeacher, 'id'>, Document {}

export const TeacherModel = mongoose.model<TeacherDocument>('Teacher', TeacherSchema);
