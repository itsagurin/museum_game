@AGENTS.md
@AI_MEMORY.md

## Claude Code

- Plan i priorytety: `docs/14_PLAN_ROZWOJU.md`. Odpowiadaj i pisz dokumentację po polsku.
- Uruchomienie: `npm run dev` (port 3000). Pełne sprawdzenie: `npm run lint && npm run typecheck && npm test && npm run build && npm run test:e2e`.
- E2E działają na eksporcie `out/`, więc wymagają wcześniejszego `npm run build`. Inny port: `PLAYWRIGHT_PORT=3100`.
- `public/art/`, `src/data/asset-manifest.json` i `src/data/decoration-geometry.json` są generowane; edytuj źródła w `img/` i `scripts/`.
