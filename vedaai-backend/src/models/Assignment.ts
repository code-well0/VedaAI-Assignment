import mongoose, { Schema, Document } from 'mongoose';
import { Assignment as IAssignment } from '../types';

const QuestionTypeSchema = new Schema({
  id: { type: String, required: true },
  type: { type: String, required: true },
  count: { type: Number, required: true },
  marks: { type: Number, required: true },
});

const QuestionSchema = new Schema({
  text: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Moderate', 'Hard'], required: true },
  marks: { type: Number, required: true },
});

const SectionSchema = new Schema({
  title: { type: String, required: true },
  instruction: { type: String, required: true },
  questions: [QuestionSchema],
});

const AssignmentSchema = new Schema(
  {
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    quizTopic: { type: String, default: '' },
    teacherName: { type: String, default: '' },
    subject: { type: String, required: true },
    className: { type: String, required: true },
    schoolName: { type: String, required: true },
    dueDate: { type: String, required: true },
    assignedOn: { type: String, required: true },
    additionalInfo: { type: String },
    fileUrl: { type: String },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    questionTypes: [QuestionTypeSchema],
    totalQuestions: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
    aiResponseText: { type: String },
    sections: [SectionSchema],
    answerKey: { type: String },
  },
  {
    timestamps: true,
  }
);

// Virtual field for string ID matching our frontend expectations
AssignmentSchema.virtual('id').get(function (this: any) {
  return this._id.toHexString();
});

AssignmentSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    const r = ret as any;
    if (r._id) {
      r.id = r._id.toString();
      delete r._id;
    }
    delete r.__v;
    return r;
  },
});

export interface AssignmentDocument extends Omit<IAssignment, 'id'>, Document {}

export const AssignmentModel = mongoose.model<AssignmentDocument>('Assignment', AssignmentSchema);
