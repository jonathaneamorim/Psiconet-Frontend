import { NextRequest, NextResponse } from 'next/server';
import { API_URL } from '@/constants/api';
import { cookieService } from '@/services/cookieService';

interface Params {
    params: Promise<{ linkId: string }>;
}

// Proxy do PDF de guarda do psicólogo (o backend exige Bearer). ?includePrivateNotes=true inclui as
// anotações pessoais — a decisão de acesso é do backend (só o titular). Nunca cacheia.
export async function GET(request: NextRequest, { params }: Params) {
    const { linkId } = await params;

    const token = await cookieService.getAuthToken();
    if (!token) {
        return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });
    }

    const includePrivate = request.nextUrl.searchParams.get('includePrivateNotes') === 'true';
    const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
    if (ip) headers['X-Forwarded-For'] = ip;

    const response = await fetch(
        `${API_URL}/medical-records/links/${encodeURIComponent(linkId)}/pdf?includePrivateNotes=${includePrivate}`,
        { headers, cache: 'no-store' }
    );

    if (!response.ok || !response.body) {
        const errorBody = await response.json().catch(() => null);
        return NextResponse.json(
            { message: errorBody?.message || 'Não foi possível gerar o PDF.' },
            { status: response.status || 502, headers: { 'Cache-Control': 'no-store' } }
        );
    }

    return new NextResponse(response.body, {
        status: 200,
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': response.headers.get('Content-Disposition') || 'attachment; filename="prontuario.pdf"',
            'X-Document-SHA256': response.headers.get('X-Document-SHA256') || '',
            'Cache-Control': 'no-store',
        },
    });
}
