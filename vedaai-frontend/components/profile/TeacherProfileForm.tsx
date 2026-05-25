'use client';

import { useState, useRef } from 'react';
import { Plus, X, User, School, BookOpen, GraduationCap, MapPin, Camera } from 'lucide-react';
import type { TeacherProfile } from '@/lib/profileStore';
import { validateTeacherProfile } from '@/lib/profileValidation';

interface TeacherProfileFormProps {
  initial: TeacherProfile;
  onSave: (profile: TeacherProfile) => void;
  submitLabel?: string;
}

export default function TeacherProfileForm({
  initial,
  onSave,
  submitLabel = 'Save Profile',
}: TeacherProfileFormProps) {
  const [form, setForm] = useState<TeacherProfile>(initial);
  const [classInput, setClassInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((p) => ({ ...p, avatar: reader.result as string }));
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const addClass = () => {
    const trimmed = classInput.trim();
    if (!trimmed) return;
    if (form.classes.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      setError('This class is already added.');
      return;
    }
    setForm((prev) => ({ ...prev, classes: [...prev.classes, trimmed] }));
    setClassInput('');
    setError(null);
  };

  const removeClass = (name: string) => {
    setForm((prev) => ({
      ...prev,
      classes: prev.classes.filter((c) => c !== name),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateTeacherProfile(form);
    if (validationError) {
      setError(validationError);
      return;
    }
    onSave(form);
  };

  const inputClass =
    'w-full px-4 py-2.5 text-sm border border-[#E5E7EB] rounded-lg placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#E8762A]/20 focus:border-[#E8762A] transition-all';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex flex-col items-center gap-3 mb-6">
        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          {form.avatar ? (
            <img src={form.avatar} alt="Avatar" className="w-20 h-20 rounded-full object-cover shadow-sm border border-[#E5E7EB]" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-[#F5F5F5] border border-dashed border-[#D1D5DB] flex flex-col items-center justify-center text-[#9CA3AF] group-hover:bg-[#F3F4F6] transition-colors">
              <Camera size={24} />
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-xs text-white font-medium">Upload</span>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleAvatarChange}
          />
        </div>
        <div className="flex items-center gap-3">
          <p className="text-xs text-[#6B7280]">Click to upload profile photo</p>
          {form.avatar && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setForm(p => ({ ...p, avatar: '' })); }}
              className="text-xs text-[#EF4444] hover:underline"
            >
              Remove
            </button>
          )}
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-[#1F2937] mb-2">
          <User size={16} className="text-[#E8762A]" />
          Teacher&apos;s Name
        </label>
        <input
          type="text"
          placeholder="e.g. Priya Sharma"
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          className={inputClass}
        />
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-[#1F2937] mb-2">
          <School size={16} className="text-[#E8762A]" />
          School Name
        </label>
        <input
          type="text"
          placeholder="e.g. Delhi Public School"
          value={form.schoolName}
          onChange={(e) => setForm((p) => ({ ...p, schoolName: e.target.value }))}
          className={inputClass}
        />
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-[#1F2937] mb-2">
          <MapPin size={16} className="text-[#E8762A]" />
          School Address
        </label>
        <input
          type="text"
          placeholder="e.g. Sector 4, Bokaro Steel City"
          value={form.schoolAddress}
          onChange={(e) => setForm((p) => ({ ...p, schoolAddress: e.target.value }))}
          className={inputClass}
        />
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-[#1F2937] mb-2">
          <BookOpen size={16} className="text-[#E8762A]" />
          Subject You Teach
        </label>
        <input
          type="text"
          placeholder="e.g. Science, English, Mathematics"
          value={form.subject}
          onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
          className={inputClass}
        />
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-[#1F2937] mb-2">
          <GraduationCap size={16} className="text-[#E8762A]" />
          Classes You Teach
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. Class : 8th"
            value={classInput}
            onChange={(e) => setClassInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addClass();
              }
            }}
            className={inputClass}
          />
          <button
            type="button"
            onClick={addClass}
            className="flex-shrink-0 px-4 py-2.5 bg-[#1F2937] text-white text-sm font-semibold rounded-lg hover:bg-[#374151] transition-colors"
          >
            <Plus size={18} />
          </button>
        </div>
        <p className="text-xs text-[#9CA3AF] mt-1.5">Press Enter or + to add each class</p>

        {form.classes.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {form.classes.map((cls) => (
              <span
                key={cls}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#FFF7ED] text-[#C2410C] border border-[#FDBA74] rounded-full"
              >
                {cls}
                <button
                  type="button"
                  onClick={() => removeClass(cls)}
                  className="hover:text-[#EF4444] transition-colors"
                  aria-label={`Remove ${cls}`}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-[#EF4444] bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        className="w-full py-3 text-sm font-bold text-white bg-[#1F2937] rounded-lg hover:bg-[#374151] transition-colors shadow-sm"
      >
        {submitLabel}
      </button>
    </form>
  );
}
