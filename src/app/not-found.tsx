import Link from "next/link";

export default function NotFound() {
    return (
        <div>
            <main className="bg-[var(--primary)] min-h-screen min-w-screen flex items-center justify-center">
                <div className="flex flex-col items-center justify-center bg-slate-100 px-10 py-8 rounded-lg shadow-lg md:px-16 md:py-12">
                    <h1 className="text-6xl font-bold text-gray-800">404</h1>
                    <p className="text-xl text-gray-600 mt-4">Ops! Página não encontrada.</p>
                    <Link href="/" className="mt-6 text-blue-500 hover:text-blue-700">Voltar para a página inicial</Link>
                </div>
            </main>
        </div>
    );
}