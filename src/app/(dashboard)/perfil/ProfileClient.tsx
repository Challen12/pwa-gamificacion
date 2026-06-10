"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { updateProfile } from "@/lib/actions/user";

export function ProfileClient({ user }: { user: any }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", isError: false });
  const [previewUrl, setPreviewUrl] = useState<string | null>(user.avatarUrl || null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ text: "La imagen excede el límite de 5MB. Por favor, elige otra.", isError: true });
        e.target.value = ''; // clear input
        return;
      }
      setMessage({ text: "", isError: false });
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setRemoveAvatar(false);
    }
  };

  const handleRemoveAvatar = () => {
    setPreviewUrl(null);
    setRemoveAvatar(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", isError: false });

    const formData = new FormData(e.currentTarget);
    if (removeAvatar) {
      formData.append("removeAvatar", "true");
    }
    
    const res = await updateProfile(formData);

    if (res.error) {
      setMessage({ text: res.error, isError: true });
    } else {
      setMessage({ text: "Perfil actualizado con éxito.", isError: false });
      (e.currentTarget.elements.namedItem("password") as HTMLInputElement).value = "";
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSave} className="glass-card rounded-xl p-6 border border-outline-variant/30 flex flex-col gap-6 relative overflow-hidden">
      
      {/* Avatar Section */}
      <div className="flex flex-col items-center gap-3 relative z-10 mt-2">
        <div className="w-32 h-32 rounded-full border-4 border-surface shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden bg-surface-container relative group">
          {previewUrl ? (
            <Image src={previewUrl} alt="Avatar" fill className="object-cover" sizes="128px" unoptimized />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-primary text-5xl font-bold bg-gradient-to-br from-primary/20 to-secondary-container/30">
              {user.name.charAt(0)}
            </div>
          )}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          >
            <span className="material-symbols-outlined text-white text-3xl drop-shadow-md">photo_camera</span>
          </div>
        </div>
        <input 
          type="file" 
          name="avatar" 
          accept="image/*" 
          className="hidden" 
          ref={fileInputRef}
          onChange={handleImageChange}
        />
        <div className="flex gap-4 items-center">
          <button 
            type="button" 
            onClick={() => fileInputRef.current?.click()}
            className="text-primary font-label-tech text-sm hover:underline flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">edit</span>
            Cambiar foto
          </button>
          
          {(previewUrl || user.avatarUrl) && (
            <button 
              type="button" 
              onClick={handleRemoveAvatar}
              className="text-error font-label-tech text-sm hover:underline flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">delete</span>
              Eliminar
            </button>
          )}
        </div>
      </div>

      <hr className="border-outline-variant/30 relative z-10" />

      {/* Form Fields */}
      <div className="flex flex-col gap-5 relative z-10">
        <div>
          <label className="font-label-tech text-xs text-on-surface-variant block mb-1">Usuario</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-[18px]">person</span>
            <input 
              type="text" 
              value={user.username} 
              disabled 
              className="w-full bg-surface-container-highest rounded-lg pl-9 pr-3 py-2.5 text-on-surface-variant/70 text-sm cursor-not-allowed border border-outline-variant/20" 
            />
          </div>
          <p className="text-[10px] text-on-surface-variant mt-1.5 ml-1">El nombre de usuario no se puede cambiar.</p>
        </div>

        <div>
          <label className="font-label-tech text-xs text-on-surface-variant block mb-1">Nombre Público</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary/70 text-[18px]">badge</span>
            <input 
              type="text" 
              name="name"
              defaultValue={user.name} 
              className="w-full input-focus-effect bg-surface-container-lowest rounded-lg pl-9 pr-3 py-2.5 text-on-surface text-sm focus:outline-none border border-outline-variant/30" 
              required 
            />
          </div>
        </div>

        <div>
          <label className="font-label-tech text-xs text-on-surface-variant block mb-1">Nueva Contraseña</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary/70 text-[18px]">lock</span>
            <input 
              type="password" 
              name="password"
              placeholder="Dejar en blanco para mantener la actual" 
              className="w-full input-focus-effect bg-surface-container-lowest rounded-lg pl-9 pr-3 py-2.5 text-on-surface text-sm focus:outline-none border border-outline-variant/30" 
            />
          </div>
        </div>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl text-sm flex items-center gap-3 relative z-10 border ${message.isError ? 'bg-error/10 text-error border-error/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
          <span className="material-symbols-outlined text-[20px]">
            {message.isError ? 'error' : 'check_circle'}
          </span>
          {message.text}
        </div>
      )}

      <button 
        type="submit" 
        disabled={loading}
        className={`w-full py-3.5 rounded-xl text-on-primary font-label-tech text-sm uppercase transition-all flex items-center justify-center gap-2 relative z-10 shadow-md ${
          loading ? "bg-primary/70 cursor-not-allowed" : "bg-primary hover:bg-primary-container hover:text-on-primary-container active:scale-95 hover:shadow-lg"
        }`}
      >
        {loading ? (
          <>
            <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
            Guardando...
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-[18px]">save</span>
            Guardar Cambios
          </>
        )}
      </button>

    </form>
  );
}
