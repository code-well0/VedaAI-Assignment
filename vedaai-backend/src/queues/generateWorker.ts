import { Worker, Job } from 'bullmq';
import { getRedisClient } from '../config/redis';
import { dbStore } from '../services/dbStore';
import { generateQuestionPaper } from '../services/aiService';
import { socketService } from '../services/socketService';

let bullWorker: Worker | null = null;

export async function processGeneration(assignmentId: string): Promise<void> {
  console.log(`👷 Worker: Starting generation for assignment ID: ${assignmentId}`);

  const assignment = await dbStore.getById(assignmentId);
  if (!assignment) {
    console.error(`👷 Worker Error: Assignment ${assignmentId} not found in database!`);
    socketService.notifyFailure(assignmentId, 'Assignment not found in database');
    return;
  }

  try {
    const { aiResponseText, sections, answerKey } = await generateQuestionPaper(assignment);

    const updated = await dbStore.update(assignmentId, {
      status: 'completed',
      aiResponseText,
      sections,
      answerKey,
    });

    if (!updated) {
      throw new Error('Failed to update assignment in database');
    }

    console.log(`👷 Worker: Successfully generated paper for "${assignment.title}".`);
    socketService.notifyCompletion(assignmentId, updated);
  } catch (error: any) {
    console.error('❌ Worker Error in processing:', error.message);

    await dbStore.update(assignmentId, { status: 'failed' });
    socketService.notifyFailure(assignmentId, error.message || 'AI generation failed');
  }
}

export function initWorker(): void {
  const connection = getRedisClient();

  bullWorker = new Worker(
    'assignment-generation',
    async (job: Job) => {
      const { assignmentId } = job.data;
      console.log(`👷 BullMQ Worker: Picked up job ${job.id} for assignment ${assignmentId}`);
      await processGeneration(assignmentId);
    },
    {
      connection,
      concurrency: 1,
    }
  );

  bullWorker.on('completed', (job) => {
    console.log(`✅ BullMQ Worker: Job ${job.id} completed successfully.`);
  });

  bullWorker.on('failed', (job, err) => {
    console.error(`❌ BullMQ Worker: Job ${job?.id} failed:`, err.message);
  });

  console.log('✅ BullMQ Worker initialized and listening.');
}
