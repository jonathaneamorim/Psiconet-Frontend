"use server";

import { RoleEnum } from "@/enums/RoleEnum";
import { API_URL } from '@/constants/api';
import { ROUTES } from "@/config/routes";

export async function registerAction(formData: FormData) {
    const role = formData.get('userRole') as RoleEnum;
    const email = formData.get('email')?.toString().trim();
    const cpf = formData.get('cpf')?.toString().trim();
    const datebirth = formData.get('datebirth')?.toString().trim();
    const password = formData.get('password')?.toString();
    const repeatPassword = formData.get('repeatPassword')?.toString();
    const crp = formData.get('crp')?.toString().trim();

    if (!email || !cpf || !datebirth || !password || !role) {
        return { error: 'Preencha todos os campos obrigatórios.' };
    }

    if (role === RoleEnum.PSYCHOLOGIST && !crp) {
        return { error: 'O CRP é obrigatório para psicólogos.' };
    }

    if (password !== repeatPassword) {
        return { error: 'As senhas não coincidem.' };
    }

    const endpoint = role === RoleEnum.PATIENT
        ? '/auth/register/patient'
        : '/auth/register/psychologist';

    const payload = {
        email,
        cpf,
        datebirth,
        password,
        ...(role === RoleEnum.PSYCHOLOGIST && { crp })
    };

    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            return { error: errorData?.message || 'Erro ao realizar o cadastro. Verifique os dados.' };
        }

        return { success: true, redirectTo: ROUTES.LOGIN };

    } catch (error) {
        console.error('Erro ao conectar com a API de cadastro:', error);
        return { error: 'Erro de conexão com o servidor.' };
    }
}