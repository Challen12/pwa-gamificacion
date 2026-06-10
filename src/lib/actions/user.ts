"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import * as bcrypt from "bcrypt";
import sharp from "sharp";
import { join } from "path";
import { writeFile } from "fs/promises";
import { v4 as uuidv4 } from "uuid";

export async function updateProfile(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "No autorizado" };

  const name = formData.get("name") as string;
  const password = formData.get("password") as string;
  const file = formData.get("avatar") as File | null;

  if (!name) return { error: "El nombre es obligatorio" };

  const updateData: any = { name };

  if (password && password.length >= 6) {
    updateData.password = await bcrypt.hash(password, 10);
  } else if (password && password.length > 0) {
    return { error: "La contraseña debe tener al menos 6 caracteres" };
  }

  const removeAvatar = formData.get("removeAvatar") === "true";

  if (removeAvatar) {
    updateData.avatarUrl = null;
  } else if (file && file.size > 0) {
    try {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const optimizedBuffer = await sharp(buffer)
        .resize({ width: 400, height: 400, fit: "cover", withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();

      const fileName = `avatar-${uuidv4()}.webp`;
      const uploadDir = join(process.cwd(), "public", "uploads");
      const filePath = join(uploadDir, fileName);

      await writeFile(filePath, optimizedBuffer);
      updateData.avatarUrl = `/uploads/${fileName}`;
    } catch (e) {
      console.error("Error al procesar avatar:", e);
      return { error: "Error al subir la imagen." };
    }
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: updateData
    });
    
    revalidatePath("/dashboard");
    revalidatePath("/perfil");
    return { success: true };
  } catch (e) {
    return { error: "Error al actualizar el perfil en la base de datos." };
  }
}
