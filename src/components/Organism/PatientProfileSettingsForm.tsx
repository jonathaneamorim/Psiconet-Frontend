'use client';

import { useRef, useState, useTransition } from 'react';
import toast from 'react-hot-toast';
import { updatePatientPhotoAction, updatePatientProfileAction } from '@/actions/profile';

interface Props {
  initial: {
    fullName: string;
    phone?: string;
    photoUrl?: string;
  };
}

const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;

export function PatientProfileSettingsForm({ initial }: Props) {
  const [isPending, startTransition] = useTransition();
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(initial.photoUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = async (file: File | null) => {
    if (!file) return;

    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      toast.error('A foto deve ser PNG ou JPG.');
      return;
    }
    if (file.size > MAX_PHOTO_SIZE_BYTES) {
      toast.error('A foto deve ter no máximo 5MB.');
      return;
    }

    setIsUploadingPhoto(true);
    const toastId = toast.loading('Enviando foto...');
    const result = await updatePatientPhotoAction(file);
    setIsUploadingPhoto(false);

    if (result.error) {
      toast.error(result.error, { id: toastId });
      return;
    }

    toast.success('Foto atualizada!', { id: toastId });
    if (result.data?.photoUrl) setPhotoUrl(result.data.photoUrl);
  };

  const handleSubmit = (formData: FormData) => {
    const fullName = String(formData.get('fullName') ?? '').trim();
    const phone = String(formData.get('phone') ?? '').trim();

    if (!fullName) {
      toast.error('Informe seu nome.');
      return;
    }

    startTransition(async () => {
      const result = await updatePatientProfileAction({
        fullName,
        phone: phone || undefined,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Perfil atualizado com sucesso!');
      }
    });
  };

  return (
    <form action={handleSubmit} className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-6 flex flex-col gap-5">
      <div>
        <h2 className="text-base font-bold text-slate-800">Perfil</h2>
        <p className="text-xs text-slate-500 mt-0.5">Dados que aparecem para psicólogos e outros usuários da plataforma.</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200 flex-shrink-0">
          {photoUrl ? (
            <img src={photoUrl} alt={initial.fullName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-xl font-bold text-slate-400">
              {initial.fullName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingPhoto}
            className="px-3.5 py-2 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors disabled:opacity-50 w-fit cursor-pointer"
          >
            {isUploadingPhoto ? 'Enviando...' : 'Alterar foto'}
          </button>
          <span className="text-[11px] text-slate-400">PNG ou JPG, até 5MB.</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            onChange={(e) => handlePhotoChange(e.target.files?.[0] ?? null)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="fullName" className="text-xs font-semibold text-slate-700">
          Nome <span className="text-red-500">*</span>
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          required
          defaultValue={initial.fullName}
          className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="phone" className="text-xs font-semibold text-slate-700">Telefone</label>
        <input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={initial.phone ?? ''}
          placeholder="(00) 00000-0000"
          className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
      </div>

      <div className="flex justify-end pt-3 border-t border-slate-100">
        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2.5 text-xs font-semibold text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
        >
          {isPending ? 'Salvando...' : 'Salvar Perfil'}
        </button>
      </div>
    </form>
  );
}
