'use client';

import { useRef, useState, useTransition } from 'react';
import toast from 'react-hot-toast';
import { updatePsychologistPhotoAction, updatePsychologistProfileAction } from '@/actions/profile';
import type { LocationDTO } from '@/types/appointment';

interface Props {
  initial: {
    fullName: string;
    phone?: string;
    description?: string;
    photoUrl?: string;
    officeAddress?: LocationDTO;
  };
}

const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;

export function ProfileSettingsForm({ initial }: Props) {
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
    const result = await updatePsychologistPhotoAction(file);
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
    const description = String(formData.get('description') ?? '').trim();

    const officeCep = String(formData.get('officeCep') ?? '').trim();
    const officeStreet = String(formData.get('officeStreet') ?? '').trim();
    const officeNumber = String(formData.get('officeNumber') ?? '').trim();
    const officeNeighborhood = String(formData.get('officeNeighborhood') ?? '').trim();
    const officeCity = String(formData.get('officeCity') ?? '').trim();
    const officeState = String(formData.get('officeState') ?? '').trim();

    if (!fullName) {
      toast.error('Informe seu nome.');
      return;
    }

    const hasOfficeAddress = Boolean(officeStreet || officeCity || officeState || officeCep || officeNumber || officeNeighborhood);
    if (hasOfficeAddress && (!officeStreet || !officeCity || !officeState)) {
      toast.error('Preencha ao menos Rua, Cidade e Estado do endereço do consultório, ou deixe todos os campos em branco.');
      return;
    }

    startTransition(async () => {
      const result = await updatePsychologistProfileAction({
        fullName,
        phone: phone || undefined,
        description: description || undefined,
        officeAddress: hasOfficeAddress
          ? {
            cep: officeCep || undefined,
            street: officeStreet,
            number: officeNumber || undefined,
            neighborhood: officeNeighborhood || undefined,
            city: officeCity,
            state: officeState.toUpperCase(),
            country: 'Brasil',
          }
          : undefined,
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
        <p className="text-xs text-slate-500 mt-0.5">Dados que aparecem para pacientes e outros usuários da plataforma.</p>
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

      <div className="flex flex-col gap-2.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
        <div>
          <p className="text-xs font-bold text-slate-700">Endereço do Consultório</p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Opcional. Usado como sugestão pré-preenchida ao agendar consultas presenciais — você ainda pode informar um endereço diferente em cada agendamento.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="officeCep" className="text-[11px] font-medium text-slate-500">CEP</label>
            <input
              id="officeCep"
              name="officeCep"
              type="text"
              defaultValue={initial.officeAddress?.cep ?? ''}
              placeholder="00000-000"
              className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
            />
          </div>
          <div>
            <label htmlFor="officeNumber" className="text-[11px] font-medium text-slate-500">Número</label>
            <input
              id="officeNumber"
              name="officeNumber"
              type="text"
              defaultValue={initial.officeAddress?.number ?? ''}
              placeholder="Ex: 120"
              className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
            />
          </div>
        </div>

        <div>
          <label htmlFor="officeStreet" className="text-[11px] font-medium text-slate-500">Rua / Logradouro</label>
          <input
            id="officeStreet"
            name="officeStreet"
            type="text"
            defaultValue={initial.officeAddress?.street ?? ''}
            placeholder="Av. Paulista, Sala 402"
            className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-1">
            <label htmlFor="officeNeighborhood" className="text-[11px] font-medium text-slate-500">Bairro</label>
            <input
              id="officeNeighborhood"
              name="officeNeighborhood"
              type="text"
              defaultValue={initial.officeAddress?.neighborhood ?? ''}
              placeholder="Bela Vista"
              className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
            />
          </div>
          <div className="col-span-1">
            <label htmlFor="officeCity" className="text-[11px] font-medium text-slate-500">Cidade</label>
            <input
              id="officeCity"
              name="officeCity"
              type="text"
              defaultValue={initial.officeAddress?.city ?? ''}
              placeholder="São Paulo"
              className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
            />
          </div>
          <div className="col-span-1">
            <label htmlFor="officeState" className="text-[11px] font-medium text-slate-500">UF</label>
            <input
              id="officeState"
              name="officeState"
              type="text"
              maxLength={2}
              defaultValue={initial.officeAddress?.state ?? ''}
              placeholder="SP"
              className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white uppercase"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className="text-xs font-semibold text-slate-700">Sobre você</label>
        <textarea
          id="description"
          name="description"
          rows={4}
          maxLength={1000}
          defaultValue={initial.description ?? ''}
          placeholder="Conte um pouco sobre sua abordagem e experiência."
          className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
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
