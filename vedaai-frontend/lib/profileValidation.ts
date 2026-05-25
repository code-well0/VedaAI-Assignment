import type { TeacherProfile } from './profileStore';

export function validateTeacherProfile(profile: TeacherProfile): string | null {
  if (!profile.name.trim()) {
    return "Please enter the teacher's name.";
  }
  if (!profile.schoolName.trim()) {
    return 'Please enter your school name.';
  }
  if (!profile.schoolAddress.trim()) {
    return 'Please enter your school address.';
  }
  if (!profile.subject.trim()) {
    return 'Please enter the subject you teach.';
  }
  if (profile.classes.length === 0) {
    return 'Add at least one class you teach.';
  }
  return null;
}
