"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter(); // Use o hook useRouter para redirecionar

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false, // Não redirecionar automaticamente
    });

    if (result?.error) {
      setError("Seu email ou sua senha estão errados!");
    } else {
      router.push("/dashboard"); // Redireciona manualmente para a página de dashboard
    }
  };

  return (
    <div className="flex justify-center items-center flex-wrap">
      <div className="flex flex-col items-center justify-center p-10 mt-20 bg-gray-300 rounded-2xl">
        <h1 className="text-2xl font-bold mb-4">Login</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="p-2 border rounded"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha"
            className="p-2 border rounded"
          />

          {error && <p className="text-red-500 mt-2 text-xs">{error}</p>}

          <button type="submit" className="bg-blue-500 text-white p-2 rounded">
            Logar com Email
          </button>
        </form>

        <button
          onClick={() =>
            signIn("github", { callbackUrl: "/dashboard" }) // Redireciona para /dashboard após login com GitHub
          }
          className="bg-gray-800 text-white p-2 rounded mt-4"
        >
          Logar com GitHub
        </button>
      </div>
    </div>
  );
}
