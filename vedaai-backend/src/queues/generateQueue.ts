import { Queue } from 'bullmq';
import { getRedisClient } from '../config/redis';
import { processGeneration } from './generateWorker';

let bullQueue: Queue | null = null;

export function initQueue(): void {
  const connection = getRedisClient();

  bullQueue = new Queue('assignment-generation', {
    connection,
  });

  console.log('✅ BullMQ: Queue initialized.');
}

export async function addAssignmentJob(assignmentId: string): Promise<void> {
  if (!bullQueue) {
    throw new Error('BullMQ queue is not initialized');
  }

  console.log(`🤖 Queue: Queueing generation job for assignment: ${assignmentId}`);

  await bullQueue.add(
    'generate-paper',
    { assignmentId },
    {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
    }
  );

  console.log('✅ BullMQ: Job added successfully.');
}
