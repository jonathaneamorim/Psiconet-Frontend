'use client';

import Link from "next/link";
import { Button } from "../Atoms/Button";

export interface TextContentProps {
    title: string;
    text: string;
    buttonText?: string;
    buttonLink?: string;
    buttonVariant?: 'primary' | 'secondary' | 'tertiary';
}

export function TextBlock({ title, text, buttonText, buttonLink, buttonVariant }: TextContentProps) {
    return (
        <div className="flex flex-col gap-4 w-full lg:w-1/2 justify-center">
            <h2 className="text-3xl lg:text-4xl font-bold">
                {title}
            </h2>
            <p className="text-lg">
                {text}
            </p>
            {buttonText && buttonLink && (
                <div className="mt-2">
                    <Link href={buttonLink}>
                        <Button variant={buttonVariant || "primary"}>
                            {buttonText}
                        </Button>
                    </Link>
                </div>
            )}
        </div>
    );
}