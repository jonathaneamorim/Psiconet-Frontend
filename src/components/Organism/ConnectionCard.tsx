'use client';

import Link from 'next/link';
import type { ActiveConnectionDTO } from '@/types/connection';

interface ConnectionCardProps {
  connection: ActiveConnectionDTO;
  onDisconnect: (connectionId: string) => void;
  isMutating: boolean;
}

function formatConnectedAt(iso: string): string {
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function formatExperienceTime(months?: number): string | null {
  if (months == null) return null;
  if (months < 12) return `${months} ${months === 1 ? 'mês' : 'meses'} de experiência`;
  const years = Math.floor(months / 12);
  return `${years} ${years === 1 ? 'ano' : 'anos'} de experiência`;
}

export function ConnectionCard({ connection, onDisconnect, isMutating }: ConnectionCardProps) {
  const { connectionId, connectedAt, user } = connection;
  const isPsychologist = user.role === 'PSYCHOLOGIST';
  const profileType = isPsychologist ? 'psychologist' : 'patient';
  const profileUrl = `/${profileType}/profile/${user.id}`;
  const roleLabel = isPsychologist ? 'Psicólogo(a)' : 'Paciente';
  const location = [user.city, user.state].filter(Boolean).join(', ');
  const experienceLabel = formatExperienceTime(user.experienceTime);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row items-center sm:items-start p-5 gap-5">
        {/* Avatar */}
        <Link href={profileUrl} className="flex-shrink-0" aria-label={`Ver perfil de ${user.fullName}`}>
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-2 border-slate-200 hover:border-[var(--primary)] transition-colors">
            {user.photoUrl ? (
              <img
                src={user.photoUrl}
                alt={user.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-slate-400">
                {user.fullName?.charAt(0).toUpperCase() ?? '?'}
              </span>
            )}
          </div>
        </Link>

        {/* Info */}
        <div className="flex-1 flex flex-col justify-center text-center sm:text-left min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <Link href={profileUrl}>
              <h3 className="text-lg font-bold text-slate-800 hover:text-[var(--primary)] transition-colors leading-snug">
                {user.fullName}
              </h3>
            </Link>
            <span className={`inline-flex self-center items-center px-2 py-0.5 rounded-full text-xs font-semibold ${isPsychologist
                ? 'bg-indigo-50 text-indigo-600'
                : 'bg-emerald-50 text-emerald-600'
              }`}>
              {roleLabel}
            </span>
          </div>

          {/* Location */}
          {location && (
            <p className="text-sm text-slate-500 mt-1 flex items-center gap-1 justify-center sm:justify-start">
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {location}
            </p>
          )}

          {/* Psychologist-specific info */}
          {isPsychologist && (
            <div className="mt-2 flex flex-col gap-1.5">
              {user.crp && (
                <p className="text-xs text-slate-500">
                  <span className="font-semibold text-slate-600">CRP:</span> {user.crp}
                </p>
              )}
              {experienceLabel && (
                <p className="text-xs text-slate-500">{experienceLabel}</p>
              )}
              {user.specialties && user.specialties.length > 0 && (
                <div className="flex flex-wrap gap-1 justify-center sm:justify-start">
                  {user.specialties.slice(0, 3).map((s) => (
                    <span
                      key={s.id}
                      className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-md font-medium"
                    >
                      {s.name}
                    </span>
                  ))}
                  {user.specialties.length > 3 && (
                    <span className="px-2 py-0.5 bg-slate-50 text-slate-500 text-xs rounded-md font-medium">
                      +{user.specialties.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Connected since */}
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1 justify-center sm:justify-start">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Conectado desde {formatConnectedAt(connectedAt)}
          </p>
        </div>

        <div className="flex-shrink-0 flex flex-row sm:flex-col gap-2 w-full sm:w-auto">
          {!isPsychologist && (
            <Link
              href={`/psychologist/appointments?patientId=${user.id}`}
              id={`schedule-appointment-${user.id}`}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-xl transition-all shadow-2xs"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Agendar
            </Link>
          )}
          <Link
            href={profileUrl}
            id={`view-profile-${user.id}`}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-[var(--primary)] bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Ver Perfil
          </Link>
          <button
            id={`disconnect-${connectionId}`}
            onClick={() => onDisconnect(connectionId)}
            disabled={isMutating}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Desvincular
          </button>
        </div>
      </div>
    </div>
  );
}
