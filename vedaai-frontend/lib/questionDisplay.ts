/** Remove marks labels if the model embedded them in question text */
export function stripEmbeddedMarksFromText(text: string): string {
  return String(text)
    .replace(/\s*\[\s*\d+\s*Marks?\s*\]\s*\.?\s*$/gi, '')
    .replace(/\s*\(\s*\d+\s*marks?\s*\)\s*\.?\s*$/gi, '')
    .trim();
}

export function formatMarksLabel(marks: number): string {
  return `[${marks} Mark${marks > 1 ? 's' : ''}]`;
}
