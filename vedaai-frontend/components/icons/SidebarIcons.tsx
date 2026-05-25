/**
 * Sidebar icons — Figma spec: #5E5E5E @ 80%, stroke line icons, fixed viewBox sizes.
 */

export const FIGMA_ICON_COLOR = 'text-[#5E5E5E]/80';
export const FIGMA_ICON_COLOR_ACTIVE = 'text-[#1A1A1A]';

const s = {
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  fill: 'none',
};

export function IconHome({ className }: { className?: string }) {
  return (
    <svg className={className} width={20} height={20} viewBox="0 0 20 20" aria-hidden>
      <rect x="3.5" y="3.5" width="5.5" height="5.5" rx="0.75" {...s} />
      <rect x="11" y="3.5" width="5.5" height="5.5" rx="0.75" {...s} />
      <rect x="3.5" y="11" width="5.5" height="5.5" rx="0.75" {...s} />
      <rect x="11" y="11" width="5.5" height="5.5" rx="0.75" {...s} />
    </svg>
  );
}

/** Groups / Classroom */
export function IconGroups({ className }: { className?: string }) {
  return (
    <svg className={className} width={20} height={20} viewBox="0 0 20 20" aria-hidden>
      <defs>
        <mask id="groups-mask">
          <rect width="20" height="20" fill="white" />
          <circle cx="11.5" cy="8" r="2.2" fill="black" />
          <path d="M11.5 11.5c-2.2 0-4 1.5-4 3.5V17h8v-2c0-2-1.8-3.5-4-3.5z" fill="black" />
          <path d="M8.5 12.5L4.5 8" stroke="black" strokeWidth="2.5" strokeLinecap="round" />
        </mask>
      </defs>
      <rect width="18" height="14" x="1" y="3" rx="2.5" fill="currentColor" mask="url(#groups-mask)" />
    </svg>
  );
}

export function IconAssignments({ className }: { className?: string }) {
  return (
    <svg className={className} width={20} height={20} viewBox="0 0 20 20" aria-hidden>
      <path
        d="M6 3.5h7.5L16.5 6.5V15.5A1 1 0 0 1 15.5 16.5H6A1 1 0 0 1 5 15.5V4.5A1 1 0 0 1 6 3.5Z"
        {...s}
      />
      <path d="M13.5 3.5V6.5H16.5" {...s} />
      <path d="M8 10.5h3.5M8 13h5" {...s} />
    </svg>
  );
}

/** Figma Book — 20×20 */
export function IconToolkit({ className }: { className?: string }) {
  return (
    <svg className={className} width={20} height={20} viewBox="0 0 20 20" aria-hidden>
      <path
        d="M4.5 5.5A2 2 0 0 1 6.5 3.5H15.5V16.5H6.5A2 2 0 0 1 4.5 14.5V5.5Z"
        {...s}
      />
      <path d="M8.5 3.5V16.5" {...s} />
    </svg>
  );
}

/** Pie / library clock segment — 20×20 */
export function IconLibrary({ className }: { className?: string }) {
  return (
    <svg className={className} width={20} height={20} viewBox="0 0 20 20" aria-hidden>
      <circle cx="10" cy="10" r="6.75" {...s} />
      <path d="M10 3.25V10H16.75" {...s} />
    </svg>
  );
}

/** icon_line/Setting — 20×20 */
export function IconSettings({ className }: { className?: string }) {
  return (
    <svg className={className} width={20} height={20} viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="3.25" {...s} strokeWidth={1.8} />
      <path
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
        {...s} strokeWidth={1.8}
      />
    </svg>
  );
}

/** Two sparkles (Create Assignment) */
export function IconSparkles({ className }: { className?: string }) {
  return (
    <svg className={className} width={20} height={20} viewBox="0 0 20 20" aria-hidden>
      <path
        d="M6 3 Q6 10 13 10 Q6 10 6 17 Q6 10 0 10 Q6 10 6 3 Z"
        fill="currentColor"
      />
      <path
        d="M14 0 Q14 4.5 18.5 4.5 Q14 4.5 14 9 Q14 4.5 9.5 4.5 Q14 4.5 14 0 Z"
        fill="currentColor"
      />
    </svg>
  );
}
