import { getPsychologistProfileAction } from '@/actions/profile';
import { ConnectionButton } from '@/components/Molecules/ConnectionButton';
import { notFound } from 'next/navigation';

export default async function PsychologistProfilePage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const { data: profile, error } = await getPsychologistProfileAction(id);

  if (error || !profile) {
    return notFound();
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 py-24 sm:py-32 px-4 sm:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          
          {/* Header/Cover */}
          <div className="h-32 sm:h-48 bg-gradient-to-r from-blue-100 to-indigo-50 w-full relative">
            <div className="absolute -bottom-12 sm:-bottom-16 left-6 sm:left-10 w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center overflow-hidden shadow-sm">
              {profile.photoUrl ? (
                <img src={profile.photoUrl} alt={profile.fullName || 'User'} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl sm:text-4xl font-bold text-slate-400">
                  {profile.fullName?.charAt(0).toUpperCase() || '?'}
                </span>
              )}
            </div>
          </div>

          <div className="pt-16 sm:pt-20 px-6 sm:px-10 pb-10">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">{profile.fullName || 'Psicólogo'}</h1>
                <p className="text-slate-500 mt-1 font-medium flex items-center gap-2">
                  <span className="bg-[var(--primary)] text-white text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wide">CRP: {profile.crp}</span>
                </p>
              </div>

              <div className="flex-shrink-0 w-full sm:w-auto">
                <ConnectionButton 
                  userId={profile.id} 
                  initialStatus={profile.connectionStatus || 'NONE'} 
                  connectionId={profile.connectionId}
                />
              </div>
            </div>

            {profile.description && (
              <div className="mt-8">
                <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                  "{profile.description}"
                </p>
              </div>
            )}

            <div className="mt-10 border-t border-slate-100 pt-8">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Especialidades</h3>
              <div className="flex flex-wrap gap-2">
                {profile.specialties && profile.specialties.length > 0 ? (
                  profile.specialties.map(spec => (
                    <span key={spec} className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-lg font-medium">
                      {spec}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 text-sm italic">Nenhuma especialidade informada.</span>
                )}
              </div>
            </div>

            <div className="mt-10 border-t border-slate-100 pt-8">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Informações Adicionais</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Localização</p>
                  <p className="text-slate-700 font-medium">
                    {profile.city && profile.state ? `${profile.city}, ${profile.state}` : 'Não informada'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Experiência</p>
                  <p className="text-slate-700 font-medium">
                    {profile.experienceTime ? `${profile.experienceTime} anos` : 'Não informada'}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
