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
    const [usuarios, setUsuarios] = useState<Usuario[]>([]); // Alterado para o tipo correto
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
                setUserEmail(user.email); // Armazena o e-mail do usuário logado
            } else {
                setUserEmail(null);
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <div>
            <h1>Usuários</h1>
            {userEmail && <h2>Você está logado como: {userEmail}</h2>}
            <ul>
                {usuarios.map(usuario => (
                    <li key={usuario.id}>
                        {usuario.nome} - {usuario.email}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default UsuariosPage;
