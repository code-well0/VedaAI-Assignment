'use client';

import { useState, useEffect } from 'react';
import { useAssignmentStore } from '@/lib/store';
import AssignmentListHeader from './AssignmentListHeader';
import AssignmentCard from './AssignmentCard';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { IconSparkles } from '@/components/icons/SidebarIcons';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';

export default function AssignmentGrid() {
  const { assignments } = useAssignmentStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  useEffect(() => {
    const handleResize = () => {
      setItemsPerPage(window.innerWidth < 768 ? 5 : 6);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filteredAssignments = assignments.filter((a) =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, itemsPerPage]);

  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentAssignments = filteredAssignments.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="p-4 md:p-6 max-w-[1150px] mx-auto w-full">
      <AssignmentListHeader onSearch={setSearchQuery} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
        {currentAssignments.map((assignment) => (
          <AssignmentCard key={assignment.id} assignment={assignment} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-2 mb-[120px] relative z-20">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
            disabled={currentPage === 1}
            className="p-2 rounded-full border border-[#E5E7EB] bg-white text-[#1F2937] hover:bg-[#F5F5F5] disabled:opacity-50 transition-colors shadow-sm"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm font-semibold text-[#4B5563]">
            Page {currentPage} of {totalPages}
          </span>
          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
            disabled={currentPage === totalPages}
            className="p-2 rounded-full border border-[#E5E7EB] bg-white text-[#1F2937] hover:bg-[#F5F5F5] disabled:opacity-50 transition-colors shadow-sm"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* Floating Create Assignment button */}
      <div className="hidden md:flex fixed bottom-0 left-0 md:left-[260px] right-0 h-[80px] pointer-events-none items-end justify-center pb-6 z-10">
        <div className="absolute inset-0 bg-gradient-to-t from-[#F5F5F5] via-[#F5F5F5]/90 to-transparent pointer-events-none" />        <div className="pointer-events-auto relative z-10">
          <PrimaryButton
            href="/assignments/create"
            variant="floating"
            icon={<Plus className="shrink-0" />}
          >
            Create Assignment
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
