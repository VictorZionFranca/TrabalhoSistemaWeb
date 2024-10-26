"use client";

import React from 'react';
import { SessionProvider } from 'next-auth/react';
import './styles/globals.css';
import AuthGuard from './components/AuthGuard';

const RootLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <SessionProvider>
          <AuthGuard>
            <main className="h-screen">{children}</main>
          </AuthGuard>
        </SessionProvider>
      </body>
    </html>
  );
};

export default RootLayout;
