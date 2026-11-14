# Lern Deutsch

Mobile-first web app for French speakers learning German vocabulary (FR→DE), with spaced repetition, XP, levels and streaks.

## Desarrollo

```bash
npm install
npm run dev      # servidor de desarrollo (Vite)
npm run test     # tests (Vitest)
npm run build    # typecheck + build de producción en dist/
```

## Contenido

Las lecciones viven en `src/content/lessons/*.ts`, se ensamblan en `src/content/course.ts` y se validan con `src/content/course.test.ts`.

## GitHub Pages

El workflow `.github/workflows/deploy.yml` ejecuta tests, build y publica `dist/` en GitHub Pages.

La app usa `HashRouter` (rutas tipo `#/lesson/x`) y `base: "./"` en `vite.config.ts`, así que funciona en local, en sitios raíz y también en project pages (`/<repo>/`) sin configuración extra.
