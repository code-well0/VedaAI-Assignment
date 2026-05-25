import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { assignmentController } from '../controllers/assignment';

const router = Router();

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(__dirname, '../../uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer storage engine configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// REST API Endpoints mapping
router.post('/', upload.single('file'), assignmentController.createAssignment);
router.get('/', assignmentController.getAllAssignments);
router.get('/:id', assignmentController.getAssignmentById);
router.delete('/:id', assignmentController.deleteAssignment);
router.post('/:id/regenerate', assignmentController.regenerateAssignment);
router.get('/:id/pdf', assignmentController.downloadPDF);

export default router;
