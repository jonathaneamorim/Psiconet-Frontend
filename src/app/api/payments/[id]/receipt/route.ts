import { NextRequest, NextResponse } from 'next/server';
import { API_URL } from '@/constants/api';
import { cookieService } from '@/services/cookieService';

interface Params {
    params: Promise<{ id: string }>;
}

// Faz proxy do comprovante para o navegador: o endpoint do backend exige o
// Authorization: Bearer (não dá pra usar em <a>/<img> direto), então essa rota roda
// no servidor, injeta o token a partir do cookie httpOnly e repassa os bytes do arquivo.
export async function GET(request: NextRequest, { params }: Params) {
    const { id } = await params;

    const token = await cookieService.getAuthToken();
    if (!token) {
        return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });
    }

    const response = await fetch(`${API_URL}/payments/${id}/receipt`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
    });

    if (!response.ok || !response.body) {
        const errorBody = await response.json().catch(() => null);
        return NextResponse.json(
            { message: errorBody?.message || 'Não foi possível carregar o comprovante.' },
            { status: response.status || 502 }
        );
    }

    return new NextResponse(response.body, {
        status: 200,
        headers: {
            'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream',
            'Content-Disposition': response.headers.get('Content-Disposition') || 'inline',
        },
    });
}
