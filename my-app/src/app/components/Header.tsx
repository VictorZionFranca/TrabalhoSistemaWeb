// src/app/components/Header.tsx
"use client"; // Adicione esta linha

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

const Header: React.FC = () => {
  const { data: session } = useSession();

  return (
    <header className='flex justify-between'>
      <h1 className='text-2xl'>Gerenciamento de Tarefas</h1>
      <nav className='flex px-5 gap-10'>
        <Link href="/">Página Inicial</Link>
        <Link href="/usuarios">Usuários</Link>
        {session ? (
          <>
            <span>Bem-vindo, {session.user.email}</span>
            <button onClick={() => signOut()}>Logout</button>
          </>
        ) : (
          <Link href="/login">Login</Link>
        )}
      </nav>
    </header>
  );
};

export default Header;
