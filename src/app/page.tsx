import { PresentationSection } from "@/components/Organism/PresentationSection";
import { CarouselSection } from "@/components/Organism/CarouselSection";
import homepage from "@/data/mock.json";


export default function Home() {
  return (
    <main>
      <PresentationSection
        variant="image-right"
        primaryContent={{
          title: homepage.homepage.firstSection.title,
          text: homepage.homepage.firstSection.text,
          buttonText: homepage.homepage.firstSection.buttonText,
          buttonLink: homepage.homepage.firstSection.buttonLink
        }}
        bgVariant="--secondary"
        textColor="--tertiary"
        imageSrc={homepage.homepage.firstSection.imageSrc}
      />

      <PresentationSection
        variant="image-left"
        primaryContent={{
          title: homepage.homepage.secondSection.title,
          text: homepage.homepage.secondSection.text,
          buttonText: homepage.homepage.secondSection.buttonText,
          buttonLink: homepage.homepage.secondSection.buttonLink,
          buttonVariant: 'secondary'
        }}
        bgVariant="--primary"
        textColor="--secondary"
        imageSrc={homepage.homepage.secondSection.imageSrc}
      />

      <CarouselSection
        title={homepage.homepage.carouselSection.title}
        text={homepage.homepage.carouselSection.text}
        items={homepage.homepage.carouselSection.items}
      />

      <PresentationSection
        variant="text-both"
        primaryContent={{
          title: homepage.homepage.thirdSection.block1.title,
          text: homepage.homepage.thirdSection.block1.text,
          buttonText: homepage.homepage.thirdSection.block1.buttonText,
          buttonLink: homepage.homepage.thirdSection.block1.buttonLink,
          buttonVariant: 'secondary'
        }}
        secondaryContent={{
          title: homepage.homepage.thirdSection.block2.title,
          text: homepage.homepage.thirdSection.block2.text,
          buttonText: homepage.homepage.thirdSection.block2.buttonText,
          buttonLink: homepage.homepage.thirdSection.block2.buttonLink,
          buttonVariant: 'secondary'
        }}
        bgVariant="--primary"
        textColor="--secondary"
      />
    </main>
  );
}
