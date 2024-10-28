// src/app/usuarios/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { auth } from '../../lib/firebase'; // Importando auth para obter o usuário logado

// Definindo o tipo do usuário
interface Usuario {
    id: string;
    nome: string;
    email: string;
}

const UsuariosPage = () => {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [userEmail, setUserEmail] = useState<string | null>(null);

    useEffect(() => {
        const fetchUsuarios = async () => {
            const usuariosCollection = collection(db, 'usuarios');
            const usuariosSnapshot = await getDocs(usuariosCollection);
            const usuariosList: Usuario[] = usuariosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Usuario));

            setUsuarios(usuariosList);
            console.log('Usuários obtidos:', usuariosList);
        };

        fetchUsuarios();

        // Verifica o usuário logado
        const unsubscribe = auth.onAuthStateChanged(user => {
            if (user) {
                setUserEmail(user.email);
            } else {
                setUserEmail(null);
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-4">Usuários</h1>
            {userEmail && <h2 className="text-xl mb-4">Você está logado como: {userEmail}</h2>}
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
                    <thead>
                        <tr className="bg-blue-700 text-white">
                            <th className="py-2 px-4 text-left">Nome</th>
                            <th className="py-2 px-4 text-left">Email</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usuarios.map(usuario => (
                            <tr key={usuario.id} className="border-b hover:bg-gray-100">
                                <td className="py-2 px-4">{usuario.nome}</td>
                                <td className="py-2 px-4">{usuario.email}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UsuariosPage;
