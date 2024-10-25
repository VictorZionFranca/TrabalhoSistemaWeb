// src/app/layout.tsx
"use client"; // Certifique-se de que isso está no topo

import './styles/globals.css';
import Header from './components/Header';
import Footer from './components/Footer';
import { SessionProvider } from 'next-auth/react';

const RootLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SessionProvider>
      <html lang="pt-BR">
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Gerenciamento de Tarefas</title>
          <meta name="description" content="Acompanhe suas tarefas diárias de forma simples e eficiente." />
        </head>
        <body>
          <Header />
          <main className='h-screen'>{children}</main>
          <Footer />
        </body>
      </html>
    </SessionProvider>
  );
};

export default RootLayout;
