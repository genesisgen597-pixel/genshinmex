# Socios Casino México — Landing (React + Vite)

## Correr local
```
npm install
npm run dev
```

## Deploy en Vercel
1. Subí esta carpeta a tu repo de GitHub (reemplaza el .html anterior).
2. En Vercel: "Add New Project" → importá el repo.
3. Vercel detecta automáticamente que es un proyecto Vite. No cambies nada, solo confirmá:
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Deploy. Listo, ya no da 404 porque ahora hay un `dist/index.html` real generado en el build.

## Estructura
- `src/App.jsx` — toda la landing (secciones, calculadora, animaciones)
- `src/App.css` — estilos (incluye ajustes específicos para mobile al final del archivo)
- `index.html` — entrada de Vite
