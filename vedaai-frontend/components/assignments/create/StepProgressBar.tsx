'use client';

interface StepProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export default function StepProgressBar({ currentStep, totalSteps }: StepProgressBarProps) {
  return (
    <div className="flex gap-1.5 w-full max-w-md mx-auto mb-6">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index}
          className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
            index <= currentStep ? 'bg-[#1F2937]' : 'bg-[#E5E7EB]'
          }`}
        />
      ))}
    </div>
  );
}
