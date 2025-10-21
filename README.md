```markdown
# InfinichainX — Landing + Starfield + Simulador (Demo profesional)

Estructura recomendada del repo:
- assets/
  - logo-hood.png        <-- tu imagen "encapuchado" (usa la imagen del hood)
  - bg.jpg               <-- imagen de fondo (screenshot con líneas/gradiente)
  - worldcoin.png        <-- logo Worldcoin
  - favicon.ico (opcional)
- index.html
- styles.css
- starfield.js
- app.js
- README.md

Resumen de los archivos:
- index.html: Estructura completa del sitio con secciones y elementos de simulador.
- styles.css: Estilos profesionales, responsive y efectos neon/vidrio.
- starfield.js: Animación de estrellas que se acercan (warp), funciona en canvas.
- app.js: Simulación realista en memoria: oráculo (random-walk), AMM (slippage y fees), lending con interés acumulado, historial de TXs simuladas, reputación y logs.
- assets/: Coloca las imágenes con los nombres exactos.

Cómo probar localmente:
1. Crea la carpeta proyecto y copia los archivos y la carpeta `assets`.
2. Abre `index.html` en tu navegador (Chrome/Edge/Firefox).
3. Interactúa: actualiza montos, haz swaps, deposita colateral, observa el oráculo y el historial de transacciones.

Despliegue en GitHub Pages (opción simple):
1. Crea un repositorio en GitHub.
2. Haz `git init`, `git add .`, `git commit -m "Initial demo"`.
3. `git branch -M main`
4. `git remote add origin https://github.com/<tu-usuario>/<tu-repo>.git`
5. `git push -u origin main`
6. En GitHub -> Settings -> Pages -> Source: branch = main, folder = / (o /docs si prefieres).
7. Espera unos minutos y la web estará disponible en `https://<tu-usuario>.github.io/<tu-repo>/`.

Recomendaciones antes de publicar:
- Optimiza imágenes (webp/jpg comprimido).
- Verifica nombres exactos y case-sensitive (assets/logo-hood.png).
- Si quieres dominio personalizado, configura CNAME en GitHub Pages.

Licencias y assets:
- Asegúrate de tener derecho a usar las imágenes y logos que subes.
```
