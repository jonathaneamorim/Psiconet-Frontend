'use client';

import Image from "next/image";
import { TextBlock, TextContentProps } from "../Molecules/TextBlock";

type VariantType = 'image-left' | 'image-right' | 'text-both';

interface PresentationSectionProps {
    variant: VariantType;
    primaryContent: TextContentProps;
    secondaryContent?: TextContentProps;
    imageSrc?: string;
    imageAlt?: string;
    imageWidth?: number;
    imageHeight?: number;
    bgVariant?: '--primary' | '--secondary' | '--tertiary';
    textColor?: '--primary' | '--secondary' | '--tertiary';
}

export function PresentationSection({
    variant,
    primaryContent,
    secondaryContent,
    imageSrc,
    imageAlt = "Imagem da seção",
    imageWidth,
    imageHeight,
    bgVariant = '--primary',
    textColor = '--tertiary',
}: PresentationSectionProps) {

    const layoutClasses = {
        'image-right': 'lg:flex-row',
        'image-left': 'lg:flex-row-reverse',
        'text-both': 'lg:flex-row'
    };

    return (
        <section
            className="w-full min-h-screen py-16 px-4 flex items-center"
            style={{
                backgroundColor: `var(${bgVariant})`,
                color: `var(${textColor})`,
                textAlign: 'center'
            }}
        >
            <div className={`container mx-auto flex flex-col items-center gap-10 lg:gap-16 ${layoutClasses[variant]}`}>

                <TextBlock {...primaryContent} />

                {variant === 'text-both' && secondaryContent ? (
                    <TextBlock {...secondaryContent} />
                ) : (
                    <div className="w-full lg:w-1/2 flex justify-center items-center">
                        {imageSrc && (
                            <Image
                                src={imageSrc}
                                alt={imageAlt}
                                width={imageWidth || 800}
                                height={imageHeight || 800}
                                loading="eager"
                                className="rounded-2xl shadow-lg w-auto h-auto max-w-full max-h-[80vh] object-contain"
                            />
                        )}
                    </div>
                )}

            </div>
        </section>
    );
}