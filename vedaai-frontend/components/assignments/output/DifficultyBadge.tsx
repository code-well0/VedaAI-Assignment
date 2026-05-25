'use client';

type Difficulty = 'Easy' | 'Moderate' | 'Hard';

const styles: Record<Difficulty, string> = {
  Easy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Moderate: 'bg-amber-50 text-amber-800 border-amber-200',
  Hard: 'bg-rose-50 text-rose-700 border-rose-200',
};

// Display label: "Moderate" is shown as "Medium" on the paper
const labels: Record<Difficulty, string> = {
  Easy: 'Easy',
  Moderate: 'Medium',
  Hard: 'Hard',
};

export default function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide rounded border shrink-0 ${styles[difficulty]}`}
    >
      {labels[difficulty]}
    </span>
  );
}
