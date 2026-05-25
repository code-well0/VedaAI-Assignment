import Image from 'next/image';

export default function NoAssignmentsIllustration() {
  return (
    <div className="flex items-center justify-center">
      <Image 
        src="/no-assignments.png"
        alt="No assignments illustration"
        width={280}
        height={220}
        priority
        className="w-[280px] h-auto object-contain opacity-95"
      />
    </div>
  );
}
