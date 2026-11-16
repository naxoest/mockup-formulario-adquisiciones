# proyecto-frontend

Aplicación frontend del proyecto.

## Stack

- React + TypeScript
- Vite
- Tailwind v4 (pendiente)
- TanStack Router + TanStack Query (pendiente)
- Zod v4 + react-hook-form (pendiente)
- Vitest + Testing Library (pendiente)

## Requisitos

- Node 20 LTS o 22 LTS (versión exacta en `.nvmrc`)
- pnpm (versión exacta en `package.json` → `packageManager`)

## Instalación

```bash
pnpm install
```

## Scripts

| Comando          | Descripción                              |
| ---------------- | ---------------------------------------- |
| `pnpm dev`       | Levanta el servidor de desarrollo.       |
| `pnpm build`     | Genera el build de producción.           |
| `pnpm preview`   | Sirve localmente el build de producción. |
| `pnpm lint`      | Ejecuta ESLint.                          |
| `pnpm typecheck` | Verifica tipos con TypeScript.           |
