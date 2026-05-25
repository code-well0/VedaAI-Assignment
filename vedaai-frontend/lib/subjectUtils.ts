/** Split "english, science" or "English and Science" into discrete subjects */
export function parseProfileSubjects(profileSubject: string): string[] {
  const raw = profileSubject.trim();
  if (!raw) return [];

  const seen = new Set<string>();
  const result: string[] = [];

  for (const part of raw.split(/\s*[,/&]\s*|\s+and\s+/gi)) {
    const label = formatSubjectLabel(part);
    if (!label) continue;
    const key = label.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(label);
    }
  }

  return result;
}

export function formatSubjectLabel(subject: string): string {
  const t = subject.trim();
  if (!t) return '';
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
}
