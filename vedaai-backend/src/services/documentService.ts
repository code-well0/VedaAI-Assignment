import fs from 'fs';
import path from 'path';
import { Assignment } from '../types';

const UPLOADS_DIR = path.join(__dirname, '../../uploads');

export type OpenAIImageContent = {
  type: 'image_url';
  image_url: { url: string; detail?: 'low' | 'high' | 'auto' };
};

/**
 * Optional image attachment for GPT-4o vision (syllabus scans, etc.).
 * PDFs are handled via extracted text in syllabusService, not inline upload.
 */
export async function getImageContentForAssignment(
  assignment: Assignment
): Promise<OpenAIImageContent | null> {
  if (!assignment.fileUrl) return null;

  const filename = path.basename(assignment.fileUrl);
  const filePath = path.join(UPLOADS_DIR, filename);

  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️ Uploaded file not found on disk: ${filePath}`);
    return null;
  }

  const ext = path.extname(filename).toLowerCase();
  if (!['.jpg', '.jpeg', '.png'].includes(ext)) return null;

  const buffer = fs.readFileSync(filePath);
  const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';
  console.log(`🖼️ Attaching image to ChatGPT request: ${filename}`);

  return {
    type: 'image_url',
    image_url: {
      url: `data:${mimeType};base64,${buffer.toString('base64')}`,
      detail: 'high',
    },
  };
}

export function hasReferenceDocument(assignment: Assignment): boolean {
  return Boolean(assignment.fileUrl);
}

export function isImageDocument(assignment: Assignment): boolean {
  if (!assignment.fileUrl) return false;
  const ext = path.extname(assignment.fileUrl).toLowerCase();
  return ['.jpg', '.jpeg', '.png'].includes(ext);
}
