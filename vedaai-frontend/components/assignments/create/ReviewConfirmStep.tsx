'use client';

import { useEffect } from 'react';
import {
  BookOpen,
  Calendar,
  FileText,
  HelpCircle,
  Sparkles,
  User,
  ClipboardList,
  GraduationCap,
} from 'lucide-react';
import { useAssignmentStore } from '@/lib/store';
import type { TeacherProfile } from '@/lib/profileStore';
import { parseProfileSubjects } from '@/lib/subjectUtils';

interface ReviewConfirmStepProps {
  profile: TeacherProfile;
  totalQuestions: number;
  totalMarks: number;
}

const inputClass =
  'w-full px-4 py-2.5 text-sm border border-[#E5E7EB] rounded-lg placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#E8762A]/20 focus:border-[#E8762A] transition-all';

export default function ReviewConfirmStep({
  profile,
  totalQuestions,
  totalMarks,
}: ReviewConfirmStepProps) {
  const { createForm, setCreateForm } = useAssignmentStore();
  const subjectOptions = parseProfileSubjects(profile.subject);

  useEffect(() => {
    if (!createForm.subject.trim() && subjectOptions.length === 1) {
      setCreateForm({ subject: subjectOptions[0] });
    }
  }, [createForm.subject, subjectOptions, setCreateForm]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-[#1F2937]">Review & Generate Quiz</h2>
        <p className="text-sm text-[#9CA3AF] mt-0.5">
          Name your assignment and quiz topic. AI will generate questions using your uploaded PDF
          and selected class.
        </p>
      </div>

      {/* Title & Quiz topic — required before generation */}
      <div className="space-y-4 p-4 bg-[#FFFBEB] border border-[#FDE68A] rounded-xl">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#92400E]">
          <Sparkles size={16} />
          AI generation details
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-[#1F2937] mb-2">
            <ClipboardList size={16} className="text-[#E8762A]" />
            Assignment Title <span className="text-[#EF4444]">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Unit Test — Chemical Effects of Electric Current"
            value={createForm.title}
            onChange={(e) => setCreateForm({ title: e.target.value })}
            className={inputClass}
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-[#1F2937] mb-2">
            <GraduationCap size={16} className="text-[#E8762A]" />
            Quiz Topic / Chapter <span className="text-[#EF4444]">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Electrolysis, Electricity — Chapter 14"
            value={createForm.quizTopic}
            onChange={(e) => setCreateForm({ quizTopic: e.target.value })}
            className={inputClass}
          />
          <p className="text-xs text-[#6B7280] mt-1.5">
            Questions will focus on this chapter for{' '}
            <strong>{createForm.className || profile.classes[0] || 'your class'}</strong>
            {createForm.subject ? (
              <>
                {' '}
                (<strong>{createForm.subject}</strong>)
              </>
            ) : null}
            .
          </p>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-[#1F2937] mb-2">
            <BookOpen size={16} className="text-[#E8762A]" />
            Subject for this test paper <span className="text-[#EF4444]">*</span>
          </label>
          {subjectOptions.length > 1 ? (
            <select
              value={createForm.subject}
              onChange={(e) => setCreateForm({ subject: e.target.value })}
              className={inputClass}
            >
              <option value="">Select subject</option>
              {subjectOptions.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              placeholder={
                subjectOptions[0]
                  ? `e.g. ${subjectOptions[0]}`
                  : 'e.g. Science, Mathematics, English'
              }
              value={createForm.subject}
              onChange={(e) => setCreateForm({ subject: e.target.value })}
              className={inputClass}
            />
          )}
          <p className="text-xs text-[#6B7280] mt-1.5">
            This subject appears on the question paper header and in the intro message (not all
            subjects from your profile).
          </p>
        </div>

        {createForm.file ? (
          <p className="text-xs text-[#166534] bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg px-3 py-2 flex items-center gap-2">
            <FileText size={14} />
            ChatGPT will use your file: <strong>{createForm.file.name}</strong>
          </p>
        ) : (
          <p className="text-xs text-[#92400E] bg-white/60 border border-[#FDE68A] rounded-lg px-3 py-2">
            No PDF uploaded — questions will be generated from the quiz topic and NCERT syllabus for
            this class.
          </p>
        )}
      </div>

      <div className="border border-[#E5E7EB] rounded-xl overflow-hidden bg-[#FAFAFA]">
        <div className="bg-[#1F2937] px-6 py-4 text-white">
          <h3 className="font-bold text-base">
            {createForm.title || 'Your assignment title'}
          </h3>
          <p className="text-xs text-[#F5A623] mt-0.5 font-medium">
            Quiz: {createForm.quizTopic || 'Enter quiz topic above'}
          </p>
          <p className="text-xs text-gray-300 mt-1">{createForm.schoolName}</p>
          <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
            <User size={12} />
            {profile.name}
          </p>
        </div>

        <div className="p-6 space-y-4">
          {profile.classes.length > 1 && (
            <div>
              <label className="block text-xs font-bold text-[#9CA3AF] uppercase tracking-wider mb-2">
                Class for this quiz
              </label>
              <select
                value={createForm.className}
                onChange={(e) => setCreateForm({ className: e.target.value })}
                className={inputClass}
              >
                {profile.classes.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-[#374151]">
              <BookOpen size={16} className="text-[#E8762A]" />
              <span>
                Class: <strong className="text-[#1F2937]">{createForm.className}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 text-[#374151]">
              <BookOpen size={16} className="text-[#E8762A]" />
              <span>
                Subject:{' '}
                <strong className="text-[#1F2937]">
                  {createForm.subject || 'Select subject above'}
                </strong>
              </span>
            </div>
            <div className="flex items-center gap-2 text-[#374151]">
              <Calendar size={16} className="text-[#E8762A]" />
              <span>
                Due Date: <strong className="text-[#1F2937]">{createForm.dueDate}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 text-[#374151]">
              <HelpCircle size={16} className="text-[#E8762A]" />
              <span>
                Questions / Marks:{' '}
                <strong className="text-[#1F2937]">
                  {totalQuestions} Questions • {totalMarks} Marks
                </strong>
              </span>
            </div>
          </div>

          <hr className="border-[#E5E7EB]" />

          <div>
            <h4 className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider mb-2">
              Question Specifications
            </h4>
            <div className="space-y-1.5">
              {createForm.questionTypes.filter((qt) => qt.count > 0).map((qt) => (
                <div
                  key={qt.id}
                  className="flex justify-between items-center text-sm py-1 border-b border-[#F3F4F6] last:border-0"
                >
                  <span className="text-[#4B5563]">{qt.type}</span>
                  <span className="text-[#1F2937] font-semibold">
                    {qt.count} Qs × {qt.marks} Mark{qt.marks > 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {createForm.additionalInfo && (
            <>
              <hr className="border-[#E5E7EB]" />
              <div>
                <h4 className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider mb-1.5">
                  Additional Instructions
                </h4>
                <p className="text-sm text-[#4B5563] leading-relaxed italic bg-white p-3 border border-[#E5E7EB] rounded-lg">
                  &ldquo;{createForm.additionalInfo}&rdquo;
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
