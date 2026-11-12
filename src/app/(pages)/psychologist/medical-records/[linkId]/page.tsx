import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getMedicalRecordAction, getSessionNotesAction } from '@/actions/medicalRecords';
import { getMyAppointmentsAction } from '@/actions/appointments';
import { MedicalRecordWorkspace } from '@/components/Organism/MedicalRecordWorkspace';
import { formatDateTime } from '@/lib/datetime';

export const metadata: Metadata = { title: 'Prontuário | Psiconet' };

interface Props {
  params: Promise<{ linkId: string }>;
}

export default async function PsychologistRecordPage({ params }: Props) {
  const { linkId } = await params;
  const [record, notes, appointments] = await Promise.all([
    getMedicalRecordAction(linkId),
    getSessionNotesAction(linkId),
    getMyAppointmentsAction(0, 200, 'startDateTime,desc'),
  ]);
  if (record.status === 404 || record.status === 400) notFound();

  const options = (appointments.data?.content ?? [])
    .filter((a) => record.data && a.patient?.id === record.data.patientUserId && a.status !== 'CANCELLED')
    .map((a) => ({ id: a.id, label: formatDateTime(a.startDateTime) }));

  return (
    <div className="w-full min-h-screen bg-slate-50 py-24 sm:py-28 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        <Link href="/psychologist/medical-records" className="text-sm font-medium text-blue-600 hover:text-blue-700 self-start">← Prontuários</Link>
        {(record.error || notes.error) && (
          <div role="alert" className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">{record.error ?? notes.error}</div>
        )}
        {record.data && <MedicalRecordWorkspace record={record.data} notes={notes.data ?? []} appointments={options} />}
      </div>
    </div>
  );
}
