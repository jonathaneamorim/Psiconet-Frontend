import Link from "next/link";
import Image from "next/image";

export default function AcessLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full flex bg-white">
      {/* Lado Esquerdo - Branding (Visível apenas em Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 flex-col justify-center gap-12 p-12 pt-28 h-screen sticky top-0 overflow-hidden">
        {/* Background Gradients/Images */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-slate-900 to-indigo-900 z-0"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/30 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/20 blur-3xl pointer-events-none"></div>

        {/* Content Overlay */}
        <div className="relative z-10 max-w-xl">
          <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
            Sua jornada para o bem-estar mental começa aqui.
          </h2>
          <p className="text-lg text-slate-300 leading-relaxed">
            Conectamos pacientes a psicólogos de forma segura, humanizada e acessível, onde quer que você esteja.
          </p>
        </div>
        
        {/* Decorative Image */}
        <div className="relative z-10 w-full h-[30vh] mt-12 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
           <Image 
             src="/homepage1.png" 
             alt="Psiconet App" 
             fill
             className="object-cover opacity-80"
           />
           <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
        </div>
      </div>

      {/* Lado Direito - Formulário (Ocupa 100% no Mobile) */}
      <div className="w-full lg:w-1/2 min-h-screen bg-white relative flex items-center justify-center p-6 sm:p-12 lg:p-24 pt-[calc(4.5rem+1.5rem)] sm:pt-[calc(4.5rem+3rem)] lg:pt-[calc(4.5rem+6rem)]">
        <main className="w-full max-w-[440px]">
          {children}
        </main>
      </div>
    </div>
  );
}