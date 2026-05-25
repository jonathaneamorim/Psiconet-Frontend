import { CarouselSection } from "@/components/Organism/CarouselSection";
import homepage from "@/data/mock.json";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/Atoms/Button";

export default function Home() {
  return (
    <main className="w-full overflow-hidden bg-slate-50">
      
      {/* 1. Hero Section */}
      <section className="relative w-full min-h-[90vh] flex items-center pt-20 overflow-hidden">
        {/* Background blobs for elegance */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-blue-100/50 blur-3xl opacity-60"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-50/50 blur-3xl opacity-60"></div>
        </div>

        <div className="container mx-auto px-6 sm:px-12 lg:px-20 relative z-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <div className="flex-1 flex flex-col gap-6 text-center lg:text-left pt-10 lg:pt-0">
            <div className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold tracking-wide border border-blue-100 w-fit mx-auto lg:mx-0">
              Transformando a Saúde Mental
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              {homepage.homepage.firstSection.title}
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              {homepage.homepage.firstSection.text}
            </p>
            <div className="pt-4 flex justify-center lg:justify-start">
              <Link href={homepage.homepage.firstSection.buttonLink}>
                <Button variant="primary" className="px-8 py-4 shadow-lg shadow-blue-500/20 text-lg font-semibold rounded-full hover:scale-105 transform transition-all duration-300">
                  {homepage.homepage.firstSection.buttonText}
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex-1 flex justify-center lg:justify-end w-full max-w-lg lg:max-w-none pb-12 lg:pb-0">
            <div className="relative w-full aspect-square max-w-[500px]">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-50 rounded-[3rem] transform rotate-3 scale-105 -z-10"></div>
              <Image 
                src={homepage.homepage.firstSection.imageSrc} 
                alt="Saúde mental"
                fill
                priority
                className="object-cover rounded-[3rem] shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Quem somos nós Section */}
      <section className="w-full py-24 bg-white relative border-y border-slate-100" id="quem-somos">
        <div className="container mx-auto px-6 sm:px-12 lg:px-20 flex flex-col lg:flex-row-reverse items-center gap-16">
          <div className="flex-1 flex flex-col gap-6 text-center lg:text-left">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              {homepage.homepage.secondSection.title}
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              {homepage.homepage.secondSection.text}
            </p>
            <div className="pt-2 flex justify-center lg:justify-start">
              <Link href={homepage.homepage.secondSection.buttonLink}>
                <Button variant="secondary" className="px-8 py-3 bg-white border border-slate-200 text-slate-700 shadow-sm hover:bg-slate-50 font-medium rounded-full">
                  {homepage.homepage.secondSection.buttonText}
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex-1 flex justify-center lg:justify-start w-full">
            <div className="relative w-full max-w-[450px] aspect-[4/3]">
              <Image 
                src={homepage.homepage.secondSection.imageSrc} 
                alt="Sobre nós"
                fill
                className="object-cover rounded-3xl shadow-lg border border-slate-100"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Acesso (Cards) Section */}
      <section className="w-full py-24 bg-slate-50" id="utilities">
        <div className="container mx-auto px-6 sm:px-12 lg:px-20">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4">
              Junte-se à nossa comunidade
            </h2>
            <p className="text-lg text-slate-600">
              Escolha seu perfil para acessar a plataforma e começar sua jornada conosco.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Card Psicólogo */}
            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-0 opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
              
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 z-10">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4 z-10">{homepage.homepage.thirdSection.block1.title}</h3>
              <p className="text-slate-600 flex-1 leading-relaxed z-10">
                {homepage.homepage.thirdSection.block1.text}
              </p>
              <div className="mt-8 z-10">
                <Link href={homepage.homepage.thirdSection.block1.buttonLink}>
                  <Button variant="primary" className="w-full py-4 text-center rounded-xl shadow-sm">
                    {homepage.homepage.thirdSection.block1.buttonText}
                  </Button>
                </Link>
              </div>
            </div>

            {/* Card Paciente */}
            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -z-0 opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
              
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 z-10">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4 z-10">{homepage.homepage.thirdSection.block2.title}</h3>
              <p className="text-slate-600 flex-1 leading-relaxed z-10">
                {homepage.homepage.thirdSection.block2.text}
              </p>
              <div className="mt-8 z-10">
                <Link href={homepage.homepage.thirdSection.block2.buttonLink}>
                  <Button variant="secondary" className="w-full py-4 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-none text-center rounded-xl shadow-sm">
                    {homepage.homepage.thirdSection.block2.buttonText}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Carousel Section */}
      <CarouselSection
        title={homepage.homepage.carouselSection.title}
        text={homepage.homepage.carouselSection.text}
        items={homepage.homepage.carouselSection.items}
      />
      
    </main>
  );
}
