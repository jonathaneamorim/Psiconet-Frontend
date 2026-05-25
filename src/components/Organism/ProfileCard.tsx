'use client';

import Link from 'next/link';
import { UserProfile, ConnectionStatus } from '@/types/profile';
import { ConnectionButton } from '../Molecules/ConnectionButton';

interface ProfileCardProps {
  profile: UserProfile & { specialties?: string[] };
  profileType: 'patient' | 'psychologist';
}

export function ProfileCard({ profile, profileType }: ProfileCardProps) {
  const isPsychologist = profileType === 'psychologist';
  const profileUrl = `/${profileType}/profile/${profile.id}`;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col sm:flex-row items-center sm:items-start p-5 gap-5">
      <Link href={profileUrl} className="flex-shrink-0">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
          {profile.photoUrl ? (
            <img src={profile.photoUrl} alt={profile.fullName || 'User'} className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl font-bold text-slate-400">
              {profile.fullName?.charAt(0).toUpperCase() || '?'}
            </span>
          )}
        </div>
      </Link>
      
      <div className="flex-1 flex flex-col justify-center text-center sm:text-left">
        <Link href={profileUrl}>
          <h3 className="text-lg font-bold text-slate-800 hover:text-[var(--primary)] transition-colors">
            {profile.fullName || 'Usuário'}
          </h3>
        </Link>
        <p className="text-sm text-slate-500 mt-1">
          {isPsychologist ? 'Psicólogo(a)' : 'Paciente'}
        </p>
        
        {isPsychologist && profile.specialties && profile.specialties.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2 justify-center sm:justify-start">
            {profile.specialties.slice(0, 3).map((spec) => (
              <span key={spec} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-md font-medium">
                {spec}
              </span>
            ))}
            {profile.specialties.length > 3 && (
              <span className="px-2 py-1 bg-slate-50 text-slate-500 text-xs rounded-md font-medium">
                +{profile.specialties.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex-shrink-0 w-full sm:w-auto mt-4 sm:mt-0 flex items-center">
        <ConnectionButton 
          userId={profile.id} 
          initialStatus={profile.connectionStatus || 'NONE'} 
          connectionId={profile.connectionId} 
        />
      </div>
    </div>
  );
}
