# Resurrection Fest 2026 - Agenda de Conciertos (Web Mobile App)

Esta es una aplicación web *mobile-first*, responsiva e instalable como una PWA (Progressive Web App) diseñada para consultar de manera rápida, cómoda y sin conexión los horarios y la agenda de conciertos del **Resurrection Fest 2026**.

Inspirada en el flujo y la experiencia de usuario de festivales premium, la aplicación cuenta con un diseño oscuro, texturizado y con acentos en rojo eléctrico que evoca la estética metalera y de rock moderno del festival.

---

## 🚀 Características Clave

1. **Dos Vistas Interactivas**:
   - **Vista por Horas**: Agrupación natural de actuaciones por bloques de horas (ej. de 15:00 a 15:59) para una consulta vertical rápida de quién toca en cada momento.
   - **Vista por Escenarios (Timeline)**: Parrilla horizontal en formato carril para cada escenario. Los conciertos se posicionan de manera absoluta a lo largo de un eje temporal continuo. Resuelve de forma visual los solapes y permite scroll horizontal fluido.
2. **Modelado de Tiempos Nocturnos**: Los conciertos que cruzan o se celebran después de medianoche (ej. de 00:00 a 03:30) se posicionan cronológicamente al final del día del festival correspondiente, evitando solapes o errores visuales.
3. **Descripciones Dinámicas**: Las biografías y anuncios oficiales de cada banda se cargan en tiempo de ejecución del archivo markdown `Resu 2026 banda a banda segun FB.md` a través de un importador raw de Vite, asegurando que cualquier cambio de texto se refleje al instante.
4. **Favoritos y Persistencia**: Guarda tus bandas preferidas con el botón de rayo (favoritos) y mantén la configuración (favoritos, orden de escenarios, visibilidad, última pestaña y día seleccionados) guardados automáticamente en el `localStorage` del dispositivo.
5. **Ordenación de Escenarios**: Modifica la prioridad y la visibilidad de los escenarios (Main, Ritual, Chaos, Desert) subiéndolos o bajándolos de orden en el panel de configuración.
6. **Búsqueda Flexible**: Busca tus bandas por nombre en el día actual o de forma global en todo el festival.
7. **PWA Instalable**: Configuración de `manifest.json`, iconos vectoriales y un Service Worker con estrategia *Stale-While-Revalidate* para un rendimiento óptimo sin conexión.

---

## 🛠️ Instalación y Desarrollo Local

Asegúrate de tener instalado **Node.js** (versión 18 o superior recomendada).

### 1. Clonar o descargar el proyecto
Sitúate en el directorio del proyecto en tu terminal.

### 2. Instalar dependencias
Instala los paquetes necesarios de npm (incluyendo React, Vite, TypeScript y Lucide Icons):
```bash
npm install
```

### 3. Iniciar el servidor de desarrollo
Inicia el entorno local interactivo:
```bash
npm run dev
```
Abre en tu navegador la dirección local que indique la consola (normalmente `http://localhost:5173`). Puedes emular vista móvil pulsando `F12` en Chrome/Edge y seleccionando un dispositivo móvil.

### 4. Compilar para producción (Build)
Para compilar la aplicación optimizada para desplegar estáticamente:
```bash
npm run build
```
Los archivos de distribución se generarán en la carpeta `/dist`.

---

## 🌐 Publicación en GitHub Pages

La aplicación está completamente preparada para su despliegue en GitHub Pages. Cuenta con un base-path relativo (`./`) para que cargue correctamente sin importar el nombre del repositorio.

### Paso a paso para publicar:

#### 1. Inicializar Git y realizar el primer Commit
Si aún no has subido el proyecto a GitHub, abre una terminal en la carpeta raíz y ejecuta:
```bash
git init
git add .
git commit -m "Initial commit: Resurrection Fest 2026 App"
```

#### 2. Crear el repositorio en GitHub y enlazarlo
Crea un nuevo repositorio vacío en tu cuenta de GitHub (ej. llamado `resurrection-fest-2026`). No agregues README, .gitignore ni licencia.
Luego, ejecuta los siguientes comandos en tu terminal local reemplazando `<tu-usuario>` por tu nombre de usuario de GitHub:
```bash
git branch -M main
git remote add origin https://github.com/<tu-usuario>/resurrection-fest-2026.git
git push -u origin main
```

#### 3. Configurar GitHub Actions y Permisos de Despliegue
La aplicación incluye un flujo de trabajo automatizado en `.github/workflows/deploy.yml` que compila y publica la app en la rama `gh-pages` de forma automática al hacer push a la rama `main`.

Para que la Action pueda escribir la rama de despliegue, debes configurar los permisos de escritura en GitHub:
1. Entra a tu repositorio en la web de GitHub.
2. Ve a **Settings** (Configuración) > **Actions** > **General**.
3. Baja hasta la sección **Workflow permissions** (Permisos del flujo de trabajo).
4. Selecciona **Read and write permissions** (Permisos de lectura y escritura).
5. Pulsa en **Save** (Guardar).

#### 4. Disparar el despliegue
1. Realiza cualquier pequeño cambio o simplemente haz el push inicial. La GitHub Action se activará.
2. Ve a la pestaña **Actions** en tu repositorio en GitHub para ver el progreso de la compilación y despliegue.
3. Una vez termine, ve a **Settings** > **Pages**.
4. En **Build and deployment**, asegúrate de que la fuente esté configurada como **Deploy from a branch** y que la rama seleccionada sea `gh-pages` (carpeta `/root`).
5. ¡Listo! GitHub te proporcionará un enlace tipo `https://<tu-usuario>.github.io/resurrection-fest-2026/` donde tu app ya estará online.
