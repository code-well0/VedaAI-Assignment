import { Request, Response } from 'express';
import { teacherStore } from '../services/teacherStore';

export const teacherController = {
  /** Create or update teacher profile in MongoDB */
  async upsertProfile(req: Request, res: Response) {
    try {
      const { externalId, name, subject, classes, schoolName, schoolAddress, avatar } =
        req.body;

      if (!externalId || !name || !subject || !schoolName) {
        return res.status(400).json({
          error: 'externalId, name, subject, and schoolName are required',
        });
      }

      let classList: string[] = [];
      if (Array.isArray(classes)) {
        classList = classes;
      } else if (typeof classes === 'string') {
        try {
          classList = JSON.parse(classes);
        } catch {
          classList = [];
        }
      }

      const teacher = await teacherStore.upsertByExternalId({
        externalId: String(externalId).trim(),
        name: String(name),
        subject: String(subject),
        classes: classList,
        schoolName: String(schoolName),
        schoolAddress: schoolAddress || '',
        avatar: avatar || '',
      });

      return res.status(200).json(teacher);
    } catch (error: any) {
      console.error('❌ upsertProfile error:', error);
      return res.status(500).json({ error: error.message || 'Failed to save profile' });
    }
  },

  /** Get teacher profile and all their assignments from MongoDB */
  async getProfile(req: Request, res: Response) {
    try {
      const { externalId } = req.params;
      const teacher = await teacherStore.getByExternalId(externalId, true);

      if (!teacher) {
        return res.status(404).json({ error: 'Teacher profile not found' });
      }

      return res.status(200).json(teacher);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Failed to load profile' });
    }
  },
};
