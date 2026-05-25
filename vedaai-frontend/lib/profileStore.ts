import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TEACHERS_API } from './config';

export interface TeacherProfile {
  name: string;
  subject: string;
  classes: string[];
  schoolName: string;
  schoolAddress: string;
  avatar?: string;
}

export function isProfileComplete(profile: TeacherProfile): boolean {
  return (
    profile.name.trim().length > 0 &&
    profile.subject.trim().length > 0 &&
    profile.schoolName.trim().length > 0 &&
    profile.schoolAddress.trim().length > 0 &&
    profile.classes.length > 0 &&
    profile.classes.every((c) => c.trim().length > 0)
  );
}

const emptyProfile: TeacherProfile = {
  name: '',
  subject: '',
  classes: [],
  schoolName: '',
  schoolAddress: '',
  avatar: '',
};

const PROFILE_ID_KEY = 'vedaai-profile-id';

export function getOrCreateProfileId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(PROFILE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(PROFILE_ID_KEY, id);
  }
  return id;
}

function profileFromApiBody(body: Record<string, unknown>): TeacherProfile {
  return {
    name: String(body.name || ''),
    subject: String(body.subject || ''),
    classes: Array.isArray(body.classes) ? (body.classes as string[]) : [],
    schoolName: String(body.schoolName || ''),
    schoolAddress: String(body.schoolAddress || ''),
    avatar: String(body.avatar || ''),
  };
}

interface ProfileStore {
  profileId: string;
  profile: TeacherProfile;
  isComplete: boolean;
  hasHydrated: boolean;
  syncing: boolean;
  setHasHydrated: (value: boolean) => void;
  updateProfile: (partial: Partial<TeacherProfile>) => void;
  addClass: (className: string) => boolean;
  removeClass: (className: string) => void;
  saveProfile: (profile: TeacherProfile) => Promise<void>;
  syncProfileToMongo: (profile: TeacherProfile) => Promise<void>;
  loadProfileFromMongo: () => Promise<void>;
  getPrimaryClass: () => string;
  getInitials: () => string;
  getSubtitle: () => string;
}

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set, get) => ({
      profileId: '',
      profile: { ...emptyProfile },
      isComplete: false,
      hasHydrated: false,
      syncing: false,

      setHasHydrated: (value) => set({ hasHydrated: value }),

      updateProfile: (partial) => {
        const profile = { ...get().profile, ...partial };
        set({ profile, isComplete: isProfileComplete(profile) });
      },

      addClass: (className) => {
        const trimmed = className.trim();
        if (!trimmed) return false;
        const existing = get().profile.classes;
        if (existing.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
          return false;
        }
        const profile = { ...get().profile, classes: [...existing, trimmed] };
        set({ profile, isComplete: isProfileComplete(profile) });
        return true;
      },

      removeClass: (className) => {
        const profile = {
          ...get().profile,
          classes: get().profile.classes.filter((c) => c !== className),
        };
        set({ profile, isComplete: isProfileComplete(profile) });
      },

      syncProfileToMongo: async (profile) => {
        const profileId = getOrCreateProfileId();
        set({ syncing: true, profileId });

        const res = await fetch(TEACHERS_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            externalId: profileId,
            ...profile,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          set({ syncing: false });
          throw new Error(err.error || 'Failed to save profile to database');
        }

        set({ syncing: false });
      },

      saveProfile: async (profile) => {
        const normalized: TeacherProfile = {
          name: profile.name.trim(),
          subject: profile.subject.trim(),
          schoolName: profile.schoolName.trim(),
          schoolAddress: profile.schoolAddress.trim(),
          classes: profile.classes.map((c) => c.trim()).filter(Boolean),
          avatar: profile.avatar || '',
        };

        await get().syncProfileToMongo(normalized);

        set({
          profileId: getOrCreateProfileId(),
          profile: normalized,
          isComplete: isProfileComplete(normalized),
        });
      },

      loadProfileFromMongo: async () => {
        const profileId = getOrCreateProfileId();
        set({ profileId });

        try {
          const res = await fetch(`${TEACHERS_API}/${profileId}`);
          if (res.status === 404) return;

          if (!res.ok) return;

          const data = await res.json();
          const profile = profileFromApiBody(data);
          set({
            profile,
            isComplete: isProfileComplete(profile),
          });
        } catch {
          /* use local cached profile */
        }
      },

      getPrimaryClass: () => get().profile.classes[0] || '',

      getInitials: () => {
        const name = get().profile.name.trim();
        if (!name) return 'T';
        return name
          .split(/\s+/)
          .map((part) => part[0])
          .join('')
          .slice(0, 2)
          .toUpperCase();
      },

      getSubtitle: () => {
        const { subject, classes } = get().profile;
        if (subject && classes.length > 0) {
          return `${subject} · ${classes.join(', ')}`;
        }
        if (subject) return subject;
        if (classes.length > 0) return classes.join(', ');
        return 'Complete your teacher profile';
      },
    }),
    {
      name: 'vedaai-teacher-profile',
      partialize: (state) => ({
        profileId: state.profileId,
        profile: state.profile,
        isComplete: state.isComplete,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const id = getOrCreateProfileId();
          state.setHasHydrated(true);
          state.profileId = id;
          state.isComplete = isProfileComplete(state.profile);
          state.loadProfileFromMongo();
        }
      },
    }
  )
);

export function getAssignmentFieldsFromProfile(profile: TeacherProfile) {
  return {
    schoolName: profile.schoolName,
    className: profile.classes[0] || '',
    /** Paper subject is chosen per assignment, not copied from profile */
    subject: '',
  };
}
