import { Router } from 'express';
import { teacherController } from '../controllers/teacher';

const router = Router();

router.post('/', teacherController.upsertProfile);
router.get('/:externalId', teacherController.getProfile);

export default router;
