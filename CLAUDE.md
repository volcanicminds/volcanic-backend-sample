# CLAUDE.md — volcanic-backend-sample

> **App consumer di riferimento** dello stack Volcanic Minds (NON una libreria). Pacchetto privato
> `volcanic-backend-sample` v2.3.0. Mostra come costruire un'applicazione usando i 3 pacchetti
> `@volcanicminds/{backend,typeorm,tools}`. È il "repo consumer" a cui si riferiscono gli esempi
> applicativi in `volcanic-backend/llms.txt`. Per l'ecosistema vedi il CLAUDE.md di `volcanic-backend`.

## Stack & convenzioni

- Stesse convenzioni dei pacchetti: **Node >= 24**, **ESM puro** (NodeNext), import con `.js`, TypeScript 5.9, ESLint 9, Prettier.
- A differenza delle librerie, **il sorgente è in `src/`** (le librerie usano `lib/`). Entry `index.ts`, build `tsc` → `dist/`.
- Dipendenze: `@volcanicminds/backend ^3.0` (il data layer è il subpath `@volcanicminds/backend/typeorm`, ex `@volcanicminds/typeorm`, ora EOL), `@volcanicminds/tools ^0.1`, `axios`, + peer del data layer: `typeorm`, `bcrypt`, `pluralize`, `reflect-metadata`, `pg`.

## Comandi

```bash
npm run dev          # tsx watch index.ts (--env-file .env)
npm start            # tsx index.ts
npm run build        # tsc -> dist/   |  npm run prod (gira da dist/)
npm test             # mocha completo (PORT=2231 NODE_ENV=memory)
npm run test:unit    # solo unit   (via MOCHA_SKIP_TASK=demo,e2e)
npm run test:e2e     # solo e2e
npm run test:demo    # solo demo
npm run check-all    # lint + type-check  <-- prima di committare
```

## Struttura reale (`src/`)

- `index.ts` — bootstrap minimale: `startDatabase(database.default)` (solo se `START_DB=true`) poi `startServer({ userManager })`. **Cabla solo `userManager`** (da typeorm); MFA/transfer/tenant NON sono wirati qui.
- `src/api/{hello,partners,rawbody,upload}/` — moduli con `routes.ts` + `controller/`. `partners` è l'esempio CRUD completo; `rawbody` (webhook), `upload` (TUS).
- `src/config/` — `auth`, `constants`, `database` (TypeORM/pool), `general`, `plugins` (CORS/Helmet/rateLimit/rawBody/multipart), `roles`, `tracking`.
- `src/entities/` — `partner.e.ts`, `user.e.ts`, `all.enums.ts` (entità con estensione `.e.ts`).
- `src/hooks/` — `preHandler` (popola contesto), `preSerialization`. `src/middleware/` — `preAuth`, `postAuth`.
- `src/schemas/` — JSON Schema (`partner`, `user`, `upload`, `global`). `src/schedules/test.job.ts`. `src/utils/common.ts`.

## Pattern effettivo (≠ dai doc enterprise)

⚠️ **Il sample NON usa il pattern `BaseService` / Service Layer** descritto in `llms.txt` e in
`volcanic-backend/docs/ADVANCED_ARCHITECTURE.md`. Quei doc descrivono un'architettura *aspirazionale*.
Qui i **controller chiamano direttamente** il data layer:

```typescript
// src/api/partners/controller/partner.ts (pattern reale)
import { executeCountQuery, executeFindQuery, useWhere } from '@volcanicminds/backend/typeorm'
export async function find(req, reply) {
  const { headers, records } = await executeFindQuery(repository.partners, { company: true }, req.data())
  return reply.headers(headers).send(records)
}
// create/update usano entity.Partner.create/save/preload/merge, removeMany usa useWhere({'id:in': ...})
```

## Pattern dati = A (Service Layer context-aware) — migrato 2026-06

Il **pattern ufficiale v2 è A**: Service Layer context-aware via `service.use(req.db)` (necessario per il
multi-tenancy forte; `global.repository.X` è vietato a runtime dal Proxy "Architecture 2.0" di typeorm).
Il modulo `partners` è stato migrato ad A:

- `src/services/base.service.ts` — `BaseService<T>` astratto: `use(req.db)` + getter `repository` che risolve
  da `manager.getRepository(entityType)`; metodi `findAll/count/findOne/create/update/remove/removeMany`
  basati su Magic Query (`executeFindQuery`/`executeCountQuery`); hook `applyPermissions(ctx)` per RLS.
- `src/services/partner.service.ts` — `PartnerService extends BaseService<Partner>` (singleton).
- `src/api/partners/controller/partner.ts` — controller thin: `partnerService.use(req.db).<metodo>(req.userContext, …)`.

Esempio canonico aggiornato: `volcanic-backend/docs/ADVANCED_ARCHITECTURE.md` e `volcanic-backend/llms.txt`.

> Nota runtime: `START_DB=false` di default e `src/hooks/preHandler.ts` è vuoto → `req.userContext` è
> `undefined` a runtime. Il default `applyPermissions` lo ignora (non rompe); popolare `preHandler` se si
> vuole RLS reale. Migrazione verificata con `npm run check-all` (lint+type-check), non a runtime (serve Postgres).

## Maturità

🟡 App di esempio ben strutturata e con suite di test segmentata (unit/e2e/demo), ma **nessuna CI** e
allineamento ai pacchetti incompleto (vedi sopra). Utile come scaffold di partenza, non come oracolo dei pattern v2.
