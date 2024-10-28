"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FaGithub, FaEnvelope } from "react-icons/fa"; // Importa os ícones do GitHub e de e-mail
import { MdVisibility, MdVisibilityOff } from "react-icons/md"; // Ícones para mostrar e esconder a senha

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Estado para controlar a visibilidade da senha
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
          <div className="relative"> {/* Div para posicionar o ícone de mostrar/esconder senha */}
            <input
              type={showPassword ? "text" : "password"} // Altera o tipo com base no estado
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha"
              className="p-2 border rounded w-full"
            />
            <div
              onClick={() => setShowPassword(!showPassword)} // Alterna a visibilidade da senha
              className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer text-black" // Estilização do ícone
              aria-label={showPassword ? "Esconder senha" : "Mostrar senha"} // Acessibilidade
            >
              {showPassword ? <MdVisibility /> : <MdVisibilityOff />} {/* Ícone de mostrar/esconder senha */}
            </div>
          </div>

          {error && <p className="text-red-500 mt-2 text-xs">{error}</p>}

          <button 
            type="submit" 
            className="bg-blue-500 text-white p-2 rounded w-full flex items-center justify-center" // Alinha o ícone e o texto
          >
            <FaEnvelope className="mr-2" /> {/* Ícone de e-mail com espaçamento à direita */}
            Logar com Email
          </button>
        </form>

        <button
          onClick={() =>
            signIn("github", { callbackUrl: "/dashboard" }) // Redireciona para /dashboard após login com GitHub
          }
          className="bg-gray-800 text-white p-2 rounded w-full flex items-center justify-center mt-4" // w-full e flex para alinhar o ícone
        >
          <FaGithub className="mr-2" /> {/* Ícone do GitHub com espaçamento à direita */}
          Logar com GitHub
        </button>
      </div>
    </div>
  );
}
