'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAssignmentStore } from '@/lib/store';
import type { QuestionType } from '@/lib/store';
import { QUESTION_TYPE_OPTIONS } from '@/lib/questionTypes';
import { CloudUpload, Calendar, X, Minus, Plus, Sparkles, ChevronDown } from 'lucide-react';

function Stepper({
  value,
  onDecrement,
  onIncrement,
  label,
  compact,
}: {
  value: number;
  onDecrement: () => void;
  onIncrement: () => void;
  label?: string;
  compact?: boolean;
}) {
  return (
    <div className={compact ? 'w-full' : ''}>
      {label && (
        <p className="text-xs font-medium text-[#6B7280] text-center mb-2">{label}</p>
      )}
      <div className="flex items-center justify-center gap-0 bg-white border border-[#E5E7EB] rounded-full overflow-hidden">
        <button
          type="button"
          onClick={onDecrement}
          className="px-3 py-2 text-[#6B7280] hover:bg-[#F5F5F5] transition-colors"
          aria-label={`Decrease ${label ?? 'value'}`}
        >
          <Minus size={14} />
        </button>
        <span className="px-3 py-2 text-sm font-semibold text-[#1F2937] min-w-[36px] text-center border-x border-[#E5E7EB]">
          {value}
        </span>
        <button
          type="button"
          onClick={onIncrement}
          className="px-3 py-2 text-[#6B7280] hover:bg-[#F5F5F5] transition-colors"
          aria-label={`Increase ${label ?? 'value'}`}
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

function QuestionTypeSelect({
  qt,
  onChange,
}: {
  qt: QuestionType;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative flex-1 min-w-0">
      <select
        value={qt.type}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none bg-transparent text-sm font-medium text-[#1F2937] pr-8 py-1 border-0 border-b border-dashed border-[#D1D5DB] focus:outline-none focus:border-[#9CA3AF] md:border md:border-[#E5E7EB] md:rounded-lg md:bg-white md:px-3 md:py-2 md:border-solid md:focus:ring-2 md:focus:ring-[#E8762A]/20 md:focus:border-[#E8762A]"
      >
        {QUESTION_TYPE_OPTIONS.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        className="absolute right-0 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none md:right-3"
      />
    </div>
  );
}

export default function AssignmentDetailsStep() {
  const {
    createForm,
    setCreateForm,
    addQuestionType,
    removeQuestionType,
    updateQuestionType,
  } = useAssignmentStore();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        setCreateForm({ file: acceptedFiles[0] });
      }
    },
    [setCreateForm]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  });

  const totalQuestions = createForm.questionTypes.reduce((sum, qt) => sum + qt.count, 0);
  const totalMarks = createForm.questionTypes.reduce((sum, qt) => sum + qt.count * qt.marks, 0);
  const canRemove = createForm.questionTypes.length > 1;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-[#1F2937]">Assignment Details</h2>
        <p className="text-sm text-[#9CA3AF] mt-0.5">Basic information about your assignment</p>
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-colors duration-200 ${
          isDragActive
            ? 'border-[#E8762A] bg-orange-50'
            : 'border-[#D1D5DB] hover:border-[#9CA3AF] bg-white'
        }`}
      >
        <input {...getInputProps()} />
        <CloudUpload size={32} className="mx-auto text-[#9CA3AF] mb-3" />
        <p className="text-sm font-medium text-[#1F2937]">
          Choose a file or drag & drop it here
        </p>
        <p className="text-xs text-[#9CA3AF] mt-1">JPEG, PNG, upto 10MB</p>
        {createForm.file ? (
          <div className="mt-3 flex items-center justify-center gap-2">
            <span className="text-sm text-[#22C55E] font-medium">{createForm.file.name}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCreateForm({ file: null });
              }}
              className="text-[#EF4444] hover:text-red-700"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="mt-3 px-5 py-2 text-sm font-medium border border-[#E5E7EB] rounded-full text-[#1F2937] hover:bg-[#F5F5F5] transition-colors"
          >
            Browse Files
          </button>
        )}
        <p className="text-xs text-[#9CA3AF] mt-2">
          Upload images of your preferred document/image
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#1F2937] mb-2">Due Date</label>
        <div className="relative">
          <input
            type="text"
            placeholder="DD-MM-YYYY"
            value={createForm.dueDate}
            onChange={(e) => setCreateForm({ dueDate: e.target.value })}
            className="w-full px-4 py-2.5 text-sm border border-[#E5E7EB] rounded-lg bg-white placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#E8762A]/20 focus:border-[#E8762A] transition-all"
          />
          <Calendar
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none"
          />
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-[#1F2937] mb-3 md:hidden">Question Type</p>

        {/* Desktop table */}
        <div className="hidden md:block">
          <div className="grid grid-cols-[minmax(0,1fr)_auto_140px_140px] gap-3 mb-2 px-1 items-center">
            <span className="text-sm font-semibold text-[#1F2937]">Question Type</span>
            <span className="w-8" />
            <span className="text-sm font-semibold text-[#1F2937] text-center">No. of Questions</span>
            <span className="text-sm font-semibold text-[#1F2937] text-center">Marks</span>
          </div>

          <div className="space-y-2">
            {createForm.questionTypes.map((qt) => (
              <div
                key={qt.id}
                className="grid grid-cols-[minmax(0,1fr)_auto_140px_140px] gap-3 items-center p-3 bg-[#FAFAFA] rounded-xl border border-[#F0F0F0]"
              >
                <QuestionTypeSelect
                  qt={qt}
                  onChange={(value) => updateQuestionType(qt.id, 'type', value)}
                />
                <button
                  type="button"
                  onClick={() => removeQuestionType(qt.id)}
                  disabled={!canRemove}
                  className="p-1 text-[#9CA3AF] hover:text-[#EF4444] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Remove question type"
                >
                  <X size={16} />
                </button>
                <Stepper
                  value={qt.count}
                  onDecrement={() => updateQuestionType(qt.id, 'count', Math.max(0, qt.count - 1))}
                  onIncrement={() => updateQuestionType(qt.id, 'count', qt.count + 1)}
                />
                <Stepper
                  value={qt.marks}
                  onDecrement={() => updateQuestionType(qt.id, 'marks', Math.max(0, qt.marks - 1))}
                  onIncrement={() => updateQuestionType(qt.id, 'marks', qt.marks + 1)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {createForm.questionTypes.map((qt) => (
            <div
              key={qt.id}
              className="rounded-2xl bg-[#F4F4F4] p-4 space-y-4"
            >
              <div className="flex items-start gap-2">
                <QuestionTypeSelect
                  qt={qt}
                  onChange={(value) => updateQuestionType(qt.id, 'type', value)}
                />
                <button
                  type="button"
                  onClick={() => removeQuestionType(qt.id)}
                  disabled={!canRemove}
                  className="shrink-0 p-1 text-[#9CA3AF] hover:text-[#EF4444] transition-colors disabled:opacity-30"
                  aria-label="Remove question type"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-[#EBEBEB] px-3 py-3">
                  <Stepper
                    label="No. of Questions"
                    compact
                    value={qt.count}
                    onDecrement={() => updateQuestionType(qt.id, 'count', Math.max(0, qt.count - 1))}
                    onIncrement={() => updateQuestionType(qt.id, 'count', qt.count + 1)}
                  />
                </div>
                <div className="rounded-2xl bg-[#EBEBEB] px-3 py-3">
                  <Stepper
                    label="Marks"
                    compact
                    value={qt.marks}
                    onDecrement={() => updateQuestionType(qt.id, 'marks', Math.max(0, qt.marks - 1))}
                    onIncrement={() => updateQuestionType(qt.id, 'marks', qt.marks + 1)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addQuestionType}
          className="flex items-center gap-2 mt-4 text-sm font-medium text-[#1F2937] hover:text-[#E8762A] transition-colors"
        >
          <div className="w-5 h-5 rounded-full bg-[#1F2937] text-white flex items-center justify-center">
            <Plus size={12} />
          </div>
          Add Question Type
        </button>

        <div className="flex flex-col sm:flex-row sm:justify-end gap-1 sm:gap-6 mt-4 text-sm text-right">
          <span className="text-[#6B7280]">
            Total Questions : <span className="font-semibold text-[#1F2937]">{totalQuestions}</span>
          </span>
          <span className="text-[#6B7280]">
            Total Marks : <span className="font-semibold text-[#1F2937]">{totalMarks}</span>
          </span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#1F2937] mb-2">
          Additional Information (For better output)
        </label>
        <div className="relative">
          <textarea
            rows={3}
            placeholder="e.g Generate a question paper for 3 hour exam duration.."
            value={createForm.additionalInfo}
            onChange={(e) => setCreateForm({ additionalInfo: e.target.value })}
            className="w-full px-4 py-3 text-sm border border-[#E5E7EB] rounded-lg bg-white placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#E8762A]/20 focus:border-[#E8762A] resize-none transition-all"
          />
          <Sparkles size={16} className="absolute right-3 bottom-3 text-[#9CA3AF]" />
        </div>
      </div>
    </div>
  );
}
