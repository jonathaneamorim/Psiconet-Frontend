import Link from "next/link";
import { Button } from "@/components/Atoms/Button";

export default function AboutPage() {
  return (
    <main className="w-full min-h-screen bg-slate-50 pt-20 pb-24">
      {/* Header Institucional */}
      <div className="w-full bg-white border-b border-slate-200 py-16 px-6 text-center shadow-sm relative overflow-hidden">
        <div className="absolute top-[-50%] left-[-10%] w-[400px] h-[400px] rounded-full bg-blue-50/50 blur-3xl opacity-60 pointer-events-none"></div>
        <div className="absolute bottom-[-50%] right-[-10%] w-[400px] h-[400px] rounded-full bg-emerald-50/50 blur-3xl opacity-60 pointer-events-none"></div>
        
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Sobre o Psiconet
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Nossa missão é democratizar o acesso à saúde mental de qualidade através da tecnologia e do cuidado humano.
          </p>
        </div>
      </div>

      {/* Conteúdo Institucional com Lorem Ipsum */}
      <div className="container mx-auto px-6 sm:px-12 lg:px-20 max-w-4xl mt-12">
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-200 prose prose-lg prose-slate max-w-none prose-headings:text-slate-800 prose-p:text-slate-600 prose-strong:text-slate-800">
          <h2 className="text-2xl font-bold mb-6">Nossa História</h2>
          <p className="mb-6 leading-relaxed">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus
            hendrerit arcu sed erat molestie vehicula. Sed auctor neque eu tellus rhoncus ut eleifend
            nibh porttitor. Ut in nulla enim. Phasellus molestie magna non est bibendum non venenatis
            nisl tempor. Suspendisse dictum feugiat nisl ut dapibus. Mauris iaculis porttitor posuere.
            Praesent id metus massa, ut blandit odio. Proin quis tortor orci. Etiam at risus et justo
            dignissim congue.
          </p>
          
          <p className="mb-10 leading-relaxed">
            Donec congue lacinia dui, a porttitor lectus condimentum laoreet. Nunc eu ullamcorper orci.
            Quisque eget odio ac lectus vestibulum faucibus eget in metus. In pellentesque faucibus 
            vestibulum. Nulla at nulla justo, eget luctus tortor. Nulla facilisi. Duis aliquet egestas
            purus in blandit.
          </p>

          <h2 className="text-2xl font-bold mb-6">Nossos Valores</h2>
          <ul className="mb-10 space-y-3">
            <li className="flex gap-3">
              <span className="text-blue-500 font-bold">✓</span>
              <span><strong>Empatia:</strong> Phasellus pellentesque neque eget diam posuere quis.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-500 font-bold">✓</span>
              <span><strong>Acessibilidade:</strong> Aliquam erat volutpat. Praesent accumsan feugiat.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-500 font-bold">✓</span>
              <span><strong>Segurança:</strong> Vestibulum ante ipsum primis in faucibus orci luctus.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-500 font-bold">✓</span>
              <span><strong>Inovação:</strong> Morbi vel purus at urna semper viverra.</span>
            </li>
          </ul>

          <h2 className="text-2xl font-bold mb-6">Como Trabalhamos</h2>
          <p className="mb-6 leading-relaxed">
            Curabitur vulputate, ligula lacinia scelerisque tempor, sanguis orci elementum diam,
            vitae congue dui velit sed magna. Pellentesque habitant morbi tristique senectus et netus
            et malesuada fames ac turpis egestas. Nam scelerisque, sapien eget consequat fermentum,
            lorem leo blandit magna, sit amet aliquam nisl velit sit amet nisl. Vestibulum tristique
            nulla sed nunc aliquet consequat.
          </p>
          <p className="leading-relaxed">
            Proin eleifend, dolor varius scelerisque iaculis, dui est sagittis augue, ut ultrices 
            neque est sit amet eros. Aenean ac lorem urna. Sed sed sapien non risus ultricies fringilla.
            Phasellus accumsan ullamcorper mi vel sagittis. Maecenas tristique orci at tellus vehicula 
            commodo. Fusce dictum rhoncus mauris, dignissim fringilla ligula consequat nec.
          </p>
        </div>

        {/* CTA Section */}
        <div className="mt-12 text-center bg-blue-50 rounded-3xl p-10 sm:p-14 border border-blue-100 shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4 tracking-tight">Pronto para começar?</h3>
            <p className="text-slate-600 mb-8 max-w-lg mx-auto text-lg">
              Junte-se a milhares de psicólogos e pacientes que já utilizam a Psiconet para transformar vidas.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/register">
                <Button variant="primary" className="px-8 shadow-md hover:scale-105 transform transition-all">
                  Criar uma conta
                </Button>
              </Link>
              <Link href="/">
                <Button variant="secondary" className="px-8 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all">
                  Voltar ao Início
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}