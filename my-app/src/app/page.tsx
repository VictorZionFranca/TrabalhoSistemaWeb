// src/app/page.tsx (ou ajuste conforme o caminho do seu projeto)
"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Espera o carregamento da sessão
    if (session) {
      router.replace("/dashboard"); // Redireciona para /dashboard se logado
    } else {
      router.replace("/login"); // Redireciona para /login se não logado
    }
  }, [session, status, router]);

  return null; // Página inicial vazia enquanto redireciona
}
