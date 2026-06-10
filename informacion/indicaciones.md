# Guía de Despliegue de Onlifit PWA (Panel cPanel)

Esta guía detalla los pasos y requisitos necesarios para subir la PWA al dominio `onlifit.rubenmarin.es` utilizando un servidor con **cPanel**.

## ⚠️ Sobre el Alojamiento con cPanel

cPanel permite desplegar aplicaciones de Node.js de forma sencilla gracias al módulo **Setup Node.js App** (que utiliza Phusion Passenger por debajo).

Esto significa que no es estrictamente necesario gestionar la aplicación mediante consola continua para mantenerla viva, pero debes configurar todo correctamente desde el panel web de cPanel y realizar la compilación en el entorno virtual de Node.js.

---

## 🚀 Pasos para Desplegar en cPanel

### 1. Subir el Código al Servidor
En tu panel cPanel, abre el **Administrador de Archivos** (File Manager).
Sube los archivos en un `.zip` a la carpeta raíz de tu aplicación (por ejemplo, crea una carpeta `onlifit` directamente en tu directorio home `/home/usuario/onlifit`) y extráelos. Debes incluir **únicamente** los siguientes archivos y carpetas fundamentales:

**Carpetas que DEBES subir:**
- `prisma/`
- `public/`
- `src/`
- `types/`

**Archivos que DEBES subir:**
- `.env` (Tus variables de entorno)
- `dev.db` (Opcional: Si quieres llevarte la base de datos local con tus cuentas)
- `server.js` (🔴 ¡MUY IMPORTANTE! Es el archivo puente que hemos creado para que cPanel/Passenger entienda cómo arrancar Next.js)
- `next.config.ts`
- `package.json` y `package-lock.json`
- `tsconfig.json` y `next-env.d.ts`
- `postcss.config.mjs`

*(❌ **NO subas** `node_modules/`, `.next/`, `__prompts/` ni `informacion/`).*

### 2. Crear la Aplicación Node.js en cPanel
Vuelve al panel principal de cPanel y busca la herramienta **"Setup Node.js App"** (Configurar aplicación Node.js):
1. Haz clic en **Create Application** (Crear aplicación).
2. **Node.js version**: Selecciona la **20.x** (o la 18.x si es la máxima disponible).
3. **Application mode**: Selecciona `Production`.
4. **Application root (Raíz de la aplicación)**: Escribe la ruta de la carpeta donde subiste los archivos (por ejemplo, `onlifit`).
5. **Application URL (URL de la aplicación)**: Selecciona el dominio o subdominio `onlifit.rubenmarin.es`.
6. **Application startup file (Archivo de inicio)**: Escribe `server.js`.
7. Haz clic en el botón **Create** (Crear) arriba a la derecha. Esto creará el entorno virtual y arrancará una app por defecto.
8. **Variables de entorno (Environment variables)**: En la misma página de configuración (en la parte inferior), añade las siguientes variables:
   - `DATABASE_URL` = `file:./dev.db`
   - `NEXTAUTH_URL` = `https://onlifit.rubenmarin.es`
   - `NEXTAUTH_SECRET` = `tu-clave-secreta`
   *(Asegúrate de guardar/añadir cada una de ellas).*

### 3. Instalar Dependencias (NPM)
Una vez guardada y creada la aplicación, cPanel detectará el archivo `package.json` en la raíz de la aplicación.
En la sección superior de la pantalla, haz clic en el botón **"Run NPM Install"** (Ejecutar instalación de NPM). Espera a que termine el proceso de descarga e instalación.

### 4. Sincronizar la Base de Datos y Compilar (Build)
Para compilar la aplicación Next.js y sincronizar la base de datos con Prisma, necesitamos entrar al entorno virtual a través de la terminal:

1. En la parte superior de la página de configuración de la app Node.js en cPanel, copia el comando que se muestra (suele empezar con `source /home/.../nodevenv/...`).
2. Ve al panel principal de cPanel, busca y abre la herramienta **"Terminal"** (o accede mediante SSH a tu servidor si lo prefieres).
3. Pega el comando copiado y pulsa Enter. Esto te meterá dentro de la carpeta de la app y activará la versión correcta de Node.js/NPM.
4. Lanza los siguientes comandos:
   ```bash
   npx prisma db push
   npm run build
   ```

*Nota: Es 100% necesario que Next.js se compile en el servidor con el comando de build para generar la carpeta `.next` en producción.*

### 5. Reiniciar la Aplicación
Una vez terminada la compilación de forma exitosa, vuelve a la herramienta **"Setup Node.js App"** en cPanel, edita la aplicación y pulsa el botón **"Restart"** (Reiniciar) en la parte superior. Esto aplicará todos los cambios y cargará la carpeta compilada `.next`.

### 6. SSL y Listo
Asegúrate de tener un certificado SSL gratuito activado en cPanel (mediante AutoSSL o Let's Encrypt) para tu subdominio. Tu PWA ya estará corriendo a través de `server.js` y escuchará de forma segura en `https://onlifit.rubenmarin.es`.
