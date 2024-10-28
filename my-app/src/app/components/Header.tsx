// src/app/components/Header.tsx
"use client"; // Adicione esta linha

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';

const Header: React.FC = () => {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className='relative flex justify-between items-center bg-blue-700 p-4'>
      <h1 className='text-2xl text-white'>Gerenciamento de Tarefas</h1>
      
      <button 
        className='sm:hidden text-white' 
        onClick={toggleMenu} 
        aria-label="Toggle menu"
      >
        {isMenuOpen ? '✖️' : '☰'}
      </button>

      <nav className={`hidden sm:flex gap-10`}>
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

      {isMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-10" onClick={closeMenu}></div>
      )}

      <nav className={`flex-col sm:hidden fixed bg-blue-700 w-full h-1/2 z-20 top-0 left-0 items-center justify-center pt-20 ${isMenuOpen ? 'flex' : 'hidden'}`}>
        <button 
          className='absolute top-4 right-4 text-white text-2xl' 
          onClick={closeMenu}
          aria-label="Close menu"
        >
          ✖️
        </button>
        <Link href="/dashboard" className='bg-white text-blue-700 hover:bg-gray-200 border border-blue-500 rounded-lg shadow-md w-3/4 mb-4 py-4 text-center transition duration-300 ease-in-out transform hover:scale-105' onClick={closeMenu}>
          Página Inicial
        </Link>
        <Link href="/usuarios" className='bg-white text-blue-700 hover:bg-gray-200 border border-blue-500 rounded-lg shadow-md w-3/4 mb-4 py-4 text-center transition duration-300 ease-in-out transform hover:scale-105' onClick={closeMenu}>
          Usuários
        </Link>
        {session ? (
          <>
            <span className='text-white mb-4'>Bem-vindo, {session.user.email}</span>
            <button onClick={() => { signOut(); closeMenu(); }} className='bg-red-500 hover:bg-red-400 text-white w-3/4 py-4 rounded-lg shadow-md'>
              Logout
            </button>
          </>
        ) : (
          <Link href="/login" className='text-white hover:underline mb-4' onClick={closeMenu}>Login</Link>
        )}
      </nav>
    </header>
  );
};

export default Header;
