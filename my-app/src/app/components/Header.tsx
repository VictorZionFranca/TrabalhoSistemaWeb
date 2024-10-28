// src/app/components/Header.tsx
"use client"; // Adicione esta linha

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

const Header: React.FC = () => {
  const { data: session } = useSession();

  return (
    <header className='flex flex-col sm:flex-row justify-between items-center bg-blue-700 p-4'>
      <h1 className='text-2xl text-white mb-2 sm:mb-0'>Gerenciamento de Tarefas</h1>
      <nav className='flex flex-col sm:flex-row items-center gap-4'>
        <Link href="/dashboard" className='text-white hover:underline'>Página Inicial</Link>
        <Link href="/usuarios" className='text-white hover:underline'>Usuários</Link>
        {session ? (
          <>
            <span className='text-white'>Bem-vindo, {session.user.email}</span>
            <button onClick={() => signOut()} className='bg-red-500 hover:bg-red-400 text-white px-2 py-1 rounded'>
              Logout
            </button>
          </>
        ) : (
          <Link href="/login" className='text-white hover:underline'>Login</Link>
        )}
      </nav>
    </header>
  );
};

export default Header;
