import { getMyPaymentsAction } from '@/actions/payments';
import { PaymentsView } from '@/components/Organism/PaymentsView';

export const metadata = {
  title: 'Cobranças | Psiconet',
  description: 'Acompanhe os pagamentos das suas consultas e envie comprovantes.',
};

export default async function PatientPaymentsPage() {
  const { data } = await getMyPaymentsAction(0, 10);

  return (
    <div className="w-full min-h-screen bg-slate-50 py-24 sm:py-28 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col gap-2 mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Cobranças</h1>
          <p className="text-slate-600">
            Acompanhe os pagamentos das suas consultas e envie os comprovantes quando necessário.
          </p>
        </div>

        <PaymentsView initialData={data} perspective="patient" />
      </div>
    </div>
  );
}
