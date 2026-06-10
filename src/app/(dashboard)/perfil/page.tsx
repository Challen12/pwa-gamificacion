import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ProfileClient } from "./ProfileClient";

export default async function PerfilPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id }
  });

  if (!dbUser) return redirect("/login");

  const userForClient = {
    name: dbUser.name,
    username: dbUser.username,
    avatarUrl: dbUser.avatarUrl,
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <header className="glass-card rounded-xl p-5 mesh-card-primary text-center relative overflow-hidden">
        <h1 className="font-headline-lg text-headline-lg text-primary mb-1 flex items-center justify-center gap-2 relative z-10">
          <span className="material-symbols-outlined text-3xl">manage_accounts</span>
          Tu Perfil
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant relative z-10">
          Actualiza tus datos y personaliza tu cuenta
        </p>
      </header>

      <ProfileClient user={userForClient} />
    </div>
  );
}
