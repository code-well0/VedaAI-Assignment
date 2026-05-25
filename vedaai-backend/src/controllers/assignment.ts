import { Request, Response } from 'express';
import { dbStore } from '../services/dbStore';
import { teacherStore } from '../services/teacherStore';
import { addAssignmentJob } from '../queues/generateQueue';
import { generateAssignmentPDF } from '../services/pdfService';
import { QuestionType } from '../types';

export const assignmentController = {
  /**
   * Create a new assignment and queue AI question paper generation
   */
  async createAssignment(req: Request, res: Response) {
    try {
      const {
        title,
        quizTopic,
        teacherName,
        subject,
        className,
        schoolName,
        dueDate,
        questionTypes: questionTypesRaw,
        additionalInfo,
        teacherExternalId,
      } = req.body;

      // File upload info if present
      const file = req.file;
      const fileUrl = file ? `/uploads/${file.filename}` : '';

      // Parse question types if they are sent as JSON string (from multipart form) or as array
      let questionTypes: QuestionType[] = [];
      if (typeof questionTypesRaw === 'string') {
        try {
          questionTypes = JSON.parse(questionTypesRaw);
        } catch {
          return res.status(400).json({ error: 'Invalid questionTypes format' });
        }
      } else if (Array.isArray(questionTypesRaw)) {
        questionTypes = questionTypesRaw;
      }

      if (
        !title ||
        !quizTopic ||
        !subject ||
        !className ||
        !schoolName ||
        !dueDate ||
        !teacherExternalId ||
        questionTypes.length === 0
      ) {
        return res.status(400).json({
          error:
            'Missing required fields. Save your teacher profile first, then create the assignment.',
        });
      }

      const teacherMongoId = await teacherStore.getMongoIdByExternalId(
        String(teacherExternalId).trim()
      );
      if (!teacherMongoId) {
        return res.status(400).json({
          error: 'Teacher profile not found in database. Please save your profile in Settings first.',
        });
      }

      // Calculate totals
      const totalQuestions = questionTypes.reduce((sum, qt) => sum + Number(qt.count), 0);
      const totalMarks = questionTypes.reduce((sum, qt) => sum + Number(qt.count) * Number(qt.marks), 0);

      const assignedOn = new Date().toLocaleDateString('en-GB').split('/').join('-');

      // Create draft in database
      const assignment = await dbStore.create({
        teacherId: teacherMongoId,
        title,
        quizTopic: String(quizTopic).trim(),
        teacherName: String(teacherName || '').trim(),
        subject,
        className,
        schoolName,
        dueDate,
        assignedOn,
        questionTypes,
        totalQuestions,
        totalMarks,
        additionalInfo: additionalInfo || '',
        fileUrl,
        status: 'pending',
      });

      console.log(`🤖 Controller: Created draft assignment ${assignment.id}`);

      // Add to BullMQ generation queue
      await addAssignmentJob(assignment.id);

      return res.status(201).json(assignment);
    } catch (error: any) {
      console.error('❌ Error creating assignment:', error);
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  },

  /**
   * Get all assignments
   */
  async getAllAssignments(req: Request, res: Response) {
    try {
      const teacherExternalId = String(req.query.teacherExternalId || '').trim();
      if (!teacherExternalId) {
        return res.status(400).json({
          error: 'teacherExternalId query parameter is required',
        });
      }

      const teacherMongoId = await teacherStore.getMongoIdByExternalId(teacherExternalId);
      if (!teacherMongoId) {
        return res.status(200).json([]);
      }

      const assignments = await dbStore.getAllForTeacher(teacherMongoId);
      return res.status(200).json(assignments);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  },

  /**
   * Get a single assignment by ID
   */
  async getAssignmentById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const assignment = await dbStore.getById(id);
      
      if (!assignment) {
        return res.status(404).json({ error: 'Assignment not found' });
      }

      return res.status(200).json(assignment);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  },

  /**
   * Delete an assignment
   */
  async deleteAssignment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deleted = await dbStore.delete(id);

      if (!deleted) {
        return res.status(404).json({ error: 'Assignment not found' });
      }

      return res.status(200).json({ success: true, message: 'Assignment deleted successfully' });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  },

  /**
   * Re-queue AI paper generation for an existing assignment
   */
  async regenerateAssignment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const assignment = await dbStore.getById(id);

      if (!assignment) {
        return res.status(404).json({ error: 'Assignment not found' });
      }

      // Reset state and set status back to pending
      await dbStore.update(id, {
        status: 'pending',
        aiResponseText: '',
        sections: [],
        answerKey: '',
      });

      console.log(`🤖 Controller: Reset assignment ${id} for regeneration`);

      // Trigger generation job
      await addAssignmentJob(id);

      return res.status(200).json({ success: true, message: 'Regeneration job started' });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  },

  /**
   * Stream a beautifully styled PDF of the assignment
   */
  async downloadPDF(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const assignment = await dbStore.getById(id);

      if (!assignment) {
        res.status(404).json({ error: 'Assignment not found' });
        return;
      }

      await generateAssignmentPDF(assignment, res);
      return;
    } catch (error: any) {
      console.error('❌ PDF generation failed:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: error.message || 'Internal server error' });
        return;
      }
    }
  },
};
