"use client";

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import React, { useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';

const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { status } = useSession(); // Removendo 'session'
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === '/login';

  useEffect(() => {
    if (status === 'unauthenticated' && !isLoginPage) {
      router.push('/login');
    }
  }, [status, router, isLoginPage]);

  if (status === 'loading') {
    return <p>Carregando...</p>;
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
};

export default AuthGuard;
