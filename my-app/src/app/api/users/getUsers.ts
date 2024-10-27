// src/app/api/users/getUsers.ts
import { NextApiRequest, NextApiResponse } from 'next'; // Importa os tipos necessários
import { auth } from '../../../lib/firebaseAdmin'; // Importa a configuração do Firebase Admin

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const listUsersResult = await auth.listUsers();
            res.status(200).json(listUsersResult.users); // Retorna a lista de usuários
        } catch (error) {
            console.error('Erro ao listar usuários:', error);
            res.status(500).json({ error: 'Erro ao listar usuários' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Método ${req.method} não permitido`);
    }
}
