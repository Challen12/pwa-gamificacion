"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Credenciales incorrectas. Inténtalo de nuevo.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("Ocurrió un error inesperado.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen mesh-bg flex flex-col justify-center items-center p-container-padding font-body-md text-on-surface">
      <div className="w-full max-w-sm glass-card rounded-xl p-8 flex flex-col items-center shadow-xl">
        <div className="w-32 h-32 mb-6 relative">
          <Image
            src="/logo-onlinemente.png"
            alt="Onlinemente Logo"
            fill
            className="object-contain"
            priority
          />
        </div>

        <h1 className="font-headline-lg text-headline-lg text-primary mb-2 text-center">
          Bienvenido
        </h1>
        <p className="text-on-surface-variant text-center mb-8">
          Inicia sesión para continuar tu progreso.
        </p>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <label className="font-label-tech text-label-tech text-on-surface-variant uppercase ml-1">
              Usuario
            </label>
            <div className="input-focus-effect bg-surface-container-lowest rounded-t-lg px-3 py-2">
              <input
                type="text"
                className="bg-transparent border-none w-full text-body-md focus:ring-0 p-0 placeholder-on-surface-variant/50"
                placeholder="tu@email.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-label-tech text-label-tech text-on-surface-variant uppercase ml-1">
              Contraseña
            </label>
            <div className="input-focus-effect bg-surface-container-lowest rounded-t-lg px-3 py-2">
              <input
                type="password"
                className="bg-transparent border-none w-full text-body-md focus:ring-0 p-0 placeholder-on-surface-variant/50"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error && (
            <p className="text-error text-sm font-medium text-center bg-error-container/50 py-2 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="mt-4 w-full bg-primary hover:bg-primary/90 text-on-primary font-headline-md text-[18px] py-3 rounded-full transition-all active:scale-95 disabled:opacity-70 flex justify-center items-center"
          >
            {isLoading ? "Iniciando..." : "Entrar al Reto"}
          </button>
        </form>
      </div>
    </div>
  );
}
