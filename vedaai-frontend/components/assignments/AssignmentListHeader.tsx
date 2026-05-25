'use client';

import { useState } from 'react';
import { Filter, Search, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AssignmentListHeaderProps {
  onSearch: (query: string) => void;
}

export default function AssignmentListHeader({ onSearch }: AssignmentListHeaderProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilter, setShowFilter] = useState(false);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  return (
    <div className="mb-4 md:mb-6">
      {/* Desktop Title */}
      <div className="hidden md:block">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-[18px] h-[18px] rounded-full bg-[#22C55E]/20 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
          </div>
          <h1 className="text-[20px] font-semibold text-[#1A1A1A] leading-tight">Assignments</h1>
        </div>
        <p className="text-[14px] text-[#9CA3AF] ml-[28px]">Manage and create assignments for your classes.</p>
      </div>

      {/* Mobile Title */}
      <div className="md:hidden flex items-center relative mb-5 h-10">
        <button 
          onClick={() => router.back()} 
          className="w-10 h-10 bg-[#E3E3E3] rounded-full flex items-center justify-center absolute left-0 z-10"
        >
          <ArrowLeft size={20} className="text-[#1A1A1A]" strokeWidth={2.2} />
        </button>
        <h1 className="text-[16px] font-bold text-[#1A1A1A] w-full text-center">Assignments</h1>
      </div>

      {/* Filter and Search row */}
      <div className="flex items-center justify-between w-full h-[64px] px-4 md:mt-6 bg-white rounded-[20px]">
        <div className="relative shrink-0 pr-3">
          <button 
            onClick={() => setShowFilter(!showFilter)}
            className="flex items-center gap-2 text-[15px] font-medium text-[#9CA3AF] hover:text-[#4B5563] transition-colors"
          >
            <Filter size={18} strokeWidth={2} />
            <span>Filter</span>
          </button>

          {showFilter && (
            <div className="absolute top-full left-0 mt-3 w-40 bg-white border border-[#E5E7EB] rounded-xl shadow-lg z-20 py-2">
              <button 
                onClick={() => setShowFilter(false)}
                className="w-full px-4 py-2.5 text-left text-sm text-[#4B5563] hover:bg-[#F9FAFB] transition-colors"
              >
                By Dates
              </button>
              <button 
                onClick={() => setShowFilter(false)}
                className="w-full px-4 py-2.5 text-left text-sm text-[#4B5563] hover:bg-[#F9FAFB] transition-colors"
              >
                By Classes
              </button>
            </div>
          )}
        </div>

        <div className="relative w-full max-w-[320px] ml-2">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" strokeWidth={2} />
          <input
            type="text"
            placeholder="Search Name"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-[14px] bg-white border border-[#E5E7EB] rounded-full placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#E8762A]/20 focus:border-[#E8762A] transition-all"
          />
        </div>
      </div>
    </div>
  );
}
