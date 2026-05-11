"use server";

import { API_URL } from "@/constants/api";
import { ROUTES } from "@/config/routes";
import { RoleEnum } from "@/enums/RoleEnum";

type RegisterResponse = {
    success?: boolean;
    redirectTo?: string;
    error?: string;
    fields?: Record<string, string>;
};

export async function registerAction(formData: FormData): Promise<RegisterResponse> {
    const role = formData.get("userRole") as RoleEnum;

    const endpoint =
        role === RoleEnum.PATIENT
            ? "/auth/register/patient"
            : "/auth/register/psychologist";

    const payload = {
        email: formData.get("email")?.toString().trim(),
        cpf: formData.get("cpf")?.toString().trim(),
        birthDate: formData.get("birthDate")?.toString().trim(),
        password: formData.get("password")?.toString(),
        ...(role === RoleEnum.PSYCHOLOGIST && {
            crp: formData.get("crp")?.toString().trim(),
        }),
    };

    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            return {
                error:
                    errorData?.message ||
                    "Erro ao realizar cadastro.",
                fields:
                    errorData?.errors || {},
            };
        }
        return {
            success: true,
            redirectTo: ROUTES.LOGIN,
        };

    } catch (error) {
        console.error("Erro ao conectar com a API:", error);

        return {
            error: "Erro de conexão com o servidor.",
        };
    }
}