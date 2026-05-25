'use client';

import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Eye, Trash2 } from 'lucide-react';
import { useAssignmentStore, type Assignment } from '@/lib/store';
import Link from 'next/link';

interface AssignmentCardProps {
  assignment: Assignment;
}

export default function AssignmentCard({ assignment }: AssignmentCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { deleteAssignment } = useAssignmentStore();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative bg-[#F7F7F7] border border-[#E5E7EB] rounded-[24px] p-5 min-h-[140px] flex flex-col justify-between hover:shadow-md hover:border-[#D1D5DB] transition-all duration-300">
      {/* Title row */}
      <div className="flex items-start justify-between">
        <h3 className="text-[20px] font-bold text-[#1A1A1A] leading-tight pr-2">
          {assignment.title}
        </h3>
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1 rounded-md hover:bg-[#F5F5F5] transition-colors text-[#9CA3AF] hover:text-[#6B7280]"
            aria-label="More options"
          >
            <MoreVertical size={16} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-[#E5E7EB] rounded-lg shadow-lg py-1 z-10">
              <Link
                href={`/assignments/${assignment.id}`}
                className="flex items-center gap-2 px-3 py-2 text-sm text-[#1F2937] hover:bg-[#F9FAFB] transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                View Assignment
              </Link>
              <button
                onClick={() => {
                  deleteAssignment(assignment.id);
                  setMenuOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm text-[#EF4444] hover:bg-red-50 transition-colors w-full"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-[12px] font-medium text-[#9CA3AF]">
        <span>
          <span className="font-bold text-[#1A1A1A]">Assigned on : </span>{assignment.assignedOn}
        </span>
        <span>
          <span className="font-bold text-[#1A1A1A]">Due : </span>{assignment.dueDate}
        </span>
      </div>
    </div>
  );
}
