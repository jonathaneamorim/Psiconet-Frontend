import type { MeetingType } from '@/types/appointment';

interface Props {
  type: MeetingType;
  size?: 'sm' | 'md';
}

export function MeetingTypeBadge({ type, size = 'md' }: Props) {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px] gap-1' : 'px-2.5 py-1 text-xs gap-1.5';

  if (type === 'VIDEO_CALL') {
    return (
      <span
        className={`inline-flex items-center font-medium rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/70 ${sizeClasses}`}
      >
        <svg className="w-3.5 h-3.5 flex-shrink-0 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        Online (Vídeo)
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full bg-teal-50 text-teal-700 border border-teal-200/70 ${sizeClasses}`}
    >
      <svg className="w-3.5 h-3.5 flex-shrink-0 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      Presencial
    </span>
  );
}
