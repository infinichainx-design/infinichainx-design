```markdown
# InfinichainX — Landing + Starfield + Simulador (instrucciones de despliegue)

Estructura recomendada de carpetas (raíz del repo):
- assets/
  - logo-hood.png        <-- tu imagen "encapuchado" (usa la imagen 2)
  - bg.jpg               <-- imagen de fondo principal (usa la imagen 1)
  - worldcoin.png        <-- logo Worldcoin (usa la imagen 3)
  - favicon.ico (opcional)
- index.html
- styles.css
- starfield.js
- app.js
- README.md

Qué hace cada archivo:
- index.html: estructura HTML de la landing, incluye canvas para starfield y áreas del simulador.
- styles.css: estilos y layout, posiciona canvas y efectos neon.
- starfield.js: animación en canvas que crea las estrellas moviéndose hacia dentro (efecto "warp").
- app.js: simulador local (swap, lending, reputación). Demo en memoria, no conecta a red.
- assets/: coloca aquí tus imágenes (logo encapuchado, fondo y worldcoin).

Cómo organizar los assets:
1. Crea la carpeta `assets` en la raíz del repo.
2. Sube las imágenes:
   - assets/logo-hood.png  ← imagen encapuchado (Image 2)
   - assets/bg.jpg         ← screenshot/fondo (Image 1)
   - assets/worldcoin.png  ← logo Worldcoin (Image 3)
3. Asegúrate de que los nombres coincidan exactamente.

Probar localmente:
- Abre index.html en un navegador moderno (Chrome, Edge, Firefox).
- El canvas se ajusta a la ventana; el starfield y la bg.jpg se combinan para el efecto.
- Interactúa con el simulador (panel de la derecha).

Despliegue en GitHub Pages (dos opciones):

Opción A — Usar carpeta `docs/` (simple):
1. Crea repo en GitHub y haz push de todos los archivos.
2. Mueve los archivos estáticos a la carpeta `docs/` en la rama `main` o simplemente mantén los archivos en la raíz y en Settings -> Pages selecciona Source: main / root.
3. En GitHub repo -> Settings -> Pages:
   - Source: Branch = main, Folder = / (o /docs si usas docs/)
   - Guarda y espera unos minutos.
4. Tu sitio estará disponible en https://<tu-usuario>.github.io/<tu-repo>/ o si usas página de usuario, en https://<tu-usuario>.github.io

Opción B — Branch `gh-pages` (automático con scripts o action):
1. Genera el build (si tuvieras un bundler) o simplemente empuja los archivos estáticos a la rama `gh-pages`.
2. En Settings -> Pages selecciona Branch = gh-pages / root.
3. Alternativamente instala el paquete `gh-pages` y ejecuta `npx gh-pages -d build` si usas un bundler.

Comandos básicos Git (ejemplo simple usando main / root):
1. git init
2. git add .
3. git commit -m "Initial commit - landing with starfield"
4. git branch -M main
5. git remote add origin https://github.com/<tu-usuario>/<tu-repo>.git
6. git push -u origin main

Notas y recomendaciones:
- Revisa que las rutas `assets/*` estén exactas (distinción mayúsculas/minúsculas).
- Para un deploy de producción, optimiza las imágenes (webp/jpg optimizado) y comprime JS/CSS.
- Si quieres que las estrellas reaccionen al scroll o al hover, puedo añadir control de velocidad por scroll.
- Si quieres que el logo worldcoin sea un enlace, te lo adiciono.
- Para integrar con World Chain testnet o MoveVM, preparo instrucciones y código adicional (web3 connectors, oráculos).

Licencias / uso de imágenes:
- Asegúrate de que tienes derechos para usar las imágenes (logo encapuchado y background). Si quieres, las convierto a SVG estilizado para mayor versatilidad.

```
