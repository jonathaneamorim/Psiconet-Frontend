import { getMeProfileAction } from '@/actions/profile';
import { notFound } from 'next/navigation';
import type { PatientProfile } from '@/types/profile';

export default async function MyPatientProfilePage() {
  const { data: profile, error } = await getMeProfileAction();

  if (error || !profile) {
    return notFound();
  }

  const patientProfile = profile as PatientProfile;

  return (
    <div className="w-full min-h-screen bg-slate-50 py-24 sm:py-32 px-4 sm:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          
          {/* Header/Cover */}
          <div className="h-32 sm:h-48 bg-gradient-to-r from-teal-100 to-emerald-50 w-full relative">
            <div className="absolute -bottom-12 sm:-bottom-16 left-6 sm:left-10 w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center overflow-hidden shadow-sm">
              {patientProfile.photoUrl ? (
                <img src={patientProfile.photoUrl} alt={patientProfile.fullName || 'User'} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl sm:text-4xl font-bold text-slate-400">
                  {patientProfile.fullName?.charAt(0).toUpperCase() || '?'}
                </span>
              )}
            </div>
          </div>

          <div className="pt-16 sm:pt-20 px-6 sm:px-10 pb-10">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">{patientProfile.fullName || 'Paciente'}</h1>
                <p className="text-slate-500 mt-1 font-medium flex items-center gap-2">
                  <span className="bg-teal-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wide">PACIENTE</span>
                </p>
              </div>
            </div>

            <div className="mt-10 border-t border-slate-100 pt-8">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Minhas Informações</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">E-mail</p>
                  <p className="text-slate-700 font-medium">{patientProfile.email || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Localização</p>
                  <p className="text-slate-700 font-medium">
                    {patientProfile.city && patientProfile.state ? `${patientProfile.city}, ${patientProfile.state}` : 'Não informada'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Status da Conta</p>
                  <p className="text-slate-700 font-medium">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${patientProfile.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {patientProfile.status === 'ACTIVE' ? 'ATIVO' : 'INATIVO'}
                    </span>
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
