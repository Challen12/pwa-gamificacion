Rol: Actúa como un Desarrollador Full-Stack Senior y Arquitecto de Software experto en Progressive Web Apps (PWA) responsivas y sistemas de gamificación
.
Objetivo: Desarrollar el frontend, el backend y la base de datos para una PWA llamada "PWA GAMIFICACIÓN ONLINEMENTE"
. Esta aplicación debe ser 100% responsive, siguiendo el enfoque "mobile-first", y debe basarse estrictamente en las reglas descritas en el archivo adjunto datos-pwa.md.
Instrucciones de Desarrollo Paso a Paso:
Paso 1: Arquitectura y Diseño Responsive PWA
Propón el stack tecnológico más adecuado (ej. React/Next.js con Tailwind CSS) para asegurar que la interfaz se adapte perfectamente a móviles, tablets y escritorio
.
Configura el manifiesto de la PWA (manifest.json) y el Service Worker para que la app sea instalable y tenga soporte offline básico
.
Paso 2: Base de Datos y Seed de Usuarios
Genera el esquema de la base de datos para las siguientes entidades: Usuarios, Actividades (ejercicios y pasos), Premios, Retos, Misiones, Insignias y Niveles
.
Crucial: Escribe un script de inicialización (Seed) que lea el archivo adjunto trabajadores.md para parsear e importar directamente a los usuarios iniciales a la base de datos
.
Paso 3: Pantalla de Login
Desarrolla una pantalla de inicio de sesión utilizando la imagen corporativa proporcionada en el archivo adjunto logo-onlinemente.png
.
Incluye inputs para usuario y contraseña, y el botón de iniciar sesión
.
Paso 4: Roles y Permisos del Sistema Implementa un sistema de control de acceso protegido para dos roles
:
Rol Usuario: Debe tener un dashboard con toda su actividad diaria. Debe poder configurar su perfil y ver: ranking, monedas, insignias, misiones, logros, retos, niveles, puntos y premios
.
Rol Admin: Tiene todas las funciones del usuario, más permisos completos de CRUD (Crear y Eliminar) para: usuarios, insignias, misiones, retos, niveles, puntos, premios y tipos de ejercicio
. Los premios creados por el admin deben incluir: Nombre, Descripción, Imagen, Puntos necesarios y Fecha de caducidad
.
Paso 5: Vistas de Gamificación (Progreso)
Genera las vistas UI para las páginas de Premios, Retos, Misiones, Niveles y Puntos
.
En todas estas páginas, debe aparecer un listado con los elementos disponibles. El sistema debe calcular de forma dinámica cuántos puntos le faltan al usuario para conseguir cada ítem, o mostrar un 'check' visual si ya está conseguido
.
Paso 6: Calendario y Motor de Puntos (Lógica de Negocio)
Desarrolla un calendario diario en el que debe aparecer un check visual en los días que se han realizado actividades o introducido pasos
.
Formulario de actividad: Debe permitir añadir Tipo de ejercicio, Duración, Elegir la intensidad (Suave, moderado, titán), y un input para adjuntar una foto que se almacenará en el servidor
.
Pasos diarios: Casilla para introducir los pasos; si no se introduce nada, cuenta como 0 puntos
.
Sistema de Puntos Estricto: Programa en el backend la siguiente fórmula automática: Cada paso diario vale 0,0001 puntos. Cada hora de entrenamiento vale 100 puntos
.
Instrucciones de ejecución para la IA: No me des solo explicaciones. Procede paso a paso. Empieza entregándome la estructura de carpetas, el esquema de la base de datos y el script para leer trabajadores.md. Pregúntame y espera mi confirmación antes de pasar a programar la UI o los siguientes pasos para ir revisando el código
.
Para llevar a cabo este proyecto, ten en cuenta los siguientes archivos que te proporciono:
[Archivo adjunto: datos-pwa.md] [Archivo adjunto: trabajadores.md] [Archivo adjunto: logo-onlinemente.png]

----