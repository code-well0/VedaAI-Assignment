'use client';

import { BookOpen, GraduationCap, Pencil, School, User, MapPin } from 'lucide-react';
import type { TeacherProfile } from '@/lib/profileStore';
import { useProfileStore } from '@/lib/profileStore';
import ProfileAvatar from './ProfileAvatar';

interface TeacherProfileCardProps {
  profile: TeacherProfile;
  onEdit: () => void;
}

export default function TeacherProfileCard({ profile, onEdit }: TeacherProfileCardProps) {
  const getInitials = useProfileStore((s) => s.getInitials);

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm">
      <div className="bg-gradient-to-br from-[#2D2D2D] to-[#1a1a1a] px-6 py-8 text-white text-center flex flex-col items-center">
        <ProfileAvatar size="lg" />
        <h2 className="mt-4 text-xl font-bold">{profile.name}</h2>
        <p className="text-sm text-gray-300 mt-1">{profile.subject} Teacher</p>
      </div>

      <div className="p-6 space-y-4">
        <div className="flex items-start gap-3">
          <School size={18} className="text-[#E8762A] mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wide">School</p>
            <p className="text-sm font-semibold text-[#1F2937] mt-0.5">{profile.schoolName}</p>
            {profile.schoolAddress && (
              <p className="text-sm text-[#6B7280] mt-0.5 flex items-center gap-1">
                <MapPin size={12} />
                {profile.schoolAddress}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-start gap-3">
          <BookOpen size={18} className="text-[#E8762A] mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wide">Subject</p>
            <p className="text-sm font-semibold text-[#1F2937] mt-0.5">{profile.subject}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <GraduationCap size={18} className="text-[#E8762A] mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wide">Classes</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {profile.classes.map((cls) => (
                <span
                  key={cls}
                  className="px-2.5 py-1 text-xs font-semibold bg-[#F5F5F5] text-[#374151] rounded-md border border-[#E5E7EB]"
                >
                  {cls}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 pt-2 border-t border-[#F3F4F6]">
          <User size={18} className="text-[#9CA3AF] mt-0.5 flex-shrink-0" />
          <p className="text-xs text-[#6B7280] leading-relaxed">
            This profile is used for question papers, assignment defaults, and your dashboard display.
          </p>
        </div>

        <button
          type="button"
          onClick={onEdit}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-[#1F2937] border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] transition-colors"
        >
          <Pencil size={14} />
          Edit Profile
        </button>
      </div>
    </div>
  );
}
