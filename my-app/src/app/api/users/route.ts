// src/app/api/usuarios/route.ts
import { NextResponse } from 'next/server';
import { auth } from '../../../lib/firebaseAdmin'; // Certifique-se de que o caminho está correto

export async function GET() {
    try {
        const users = await auth.listUsers();
        const usersList = users.users.map(user => ({
            id: user.uid,
            nome: user.displayName || 'Nome não definido',
            email: user.email || 'Email não definido',
        }));

        return NextResponse.json(usersList);
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}
