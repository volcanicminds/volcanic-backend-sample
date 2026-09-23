# CLAUDE.md — volcanic-backend-sample

> **App consumer di riferimento** dello stack Volcanic Minds (NON una libreria). Pacchetto privato
> `volcanic-backend-sample` v5.0.0-alpha.0, allineato a `@volcanicminds/backend` **v5** (compito T-8.4
> di `volcanic-backend/EVO_FRAMEWORK.md`). Il suo lavoro è dimostrare che la guida di migrazione è
> completa: ogni punto in cui risulta insufficiente si corregge nella guida, non solo qui.

## Stack & convenzioni

- **Node >= 24**, **ESM puro** (NodeNext), import con `.js`, TypeScript 5.9, ESLint 9, Prettier.
- A differenza delle librerie, **il sorgente è in `src/`** (le librerie usano `lib/`). Entry `index.ts`, build `tsc` → `dist/`.
- Dipendenze: `@volcanicminds/backend` via **`file:../volcanic-backend`** finché la v5 non è pubblicata,
  `@volcanicminds/tools ^0.1`, più le peer del data layer: `drizzle-orm`, `pg`, `bcrypt`.
- **`postinstall` fa `scripts/link-peers.mjs`**, che collassa quelle peer sulle copie del checkout del
  framework. Serve perché una dipendenza `file:` è un symlink a un checkout con un proprio `node_modules`
  e Node risolve dal realpath: senza, ci sono due copie di Drizzle della stessa versione e una tabella
  costruita da una è un oggetto estraneo per l'altra. Installando da npm il problema non esiste.
- **Niente decoratori, niente `reflect-metadata`**: le tabelle sono Drizzle e i tipi si leggono dal codice.
  Il vincolo v4 su `emitDecoratorMetadata` è caduto con TypeORM.

## Comandi

```bash
npm run dev          # tsx watch index.ts (--env-file .env)
npm start            # tsx index.ts
npm run build        # tsc -> dist/   |  npm run prod (gira da dist/)
npm run db:generate  # rigenera migrations/control da src/tables/entry/control.pg.ts
npm run db:migrate   # applica lo schema: passo di deploy, non di avvio
npm test             # mocha completo (PORT=2231 NODE_ENV=memory)
npm run test:search  # solo il servizio di ricerca semantica (PGlite come doppio di test)
npm run check-all    # lint + type-check  <-- prima di committare
```

Serve un Postgres 16: `docker run -d --name sample-pg -e POSTGRES_USER=sample -e POSTGRES_PASSWORD=sample
-e POSTGRES_DB=sample -p 5432:5432 postgres:16-alpine`. **PGlite non è più un motore**: espone una sola
connessione, quindi non isola niente sotto concorrenza, ed è la classe di difetti che la v5 elimina.
Resta solo come doppio di test in `test/semanticSearch.spec.ts`.

## Struttura reale (`src/`)

- `index.ts` — bootstrap in tre passi **e in quest'ordine**: `preload()`, `startDataLayer()`,
  `startServer({ ...layer, mfaManager, challengeDeliveryManager })`, con i due manager di
  `src/services/auth.ts` (TOTP e consegna dei codici di accesso, su SMTP o, in sviluppo, a log e in
  una casella in memoria che i test leggono). `preload()` non è opzionale: è ciò che legge `config/general.ts` dentro
  `global.config`, da cui il data layer prende i blocchi `control` e `tenants`. Senza, il data layer non
  trova configurazione e ripiega in silenzio sui propri default, cioè su un altro database.
- `src/tables/` — le tabelle di questo progetto: `pg.ts` (fabbrica per locator), `enums.ts`,
  `index.ts` (`tablesFor(handle)` con cache **per locator**), `entry/` (moduli statici per drizzle-kit).
  **Convenzione**: `src/tables/` per le tabelle Drizzle, `src/schemas/` per gli schemi JSON di Fastify.
  Fino a T-10.26 le tabelle stavano in `src/schema/`, una lettera di differenza da `src/schemas/` per due
  cose diverse; `schemas` non si può rinominare perché è il nome che il loader del framework cerca.
- `migrations/{control,tenant}/pg` — SQL committato, **una cartella per dialetto**: il runner legge
  `migrations/<set>/<dialect>` e una cartella mancante non è un errore, è un insieme vuoto. Il framework
  porta le migrazioni delle **sue** tabelle e il runner legge la sua cartella prima di questa.
- `src/services/` — `base.service.ts` (pattern dati), `partner.service.ts`, `profile.service.ts`,
  `semanticSearch.ts`.
- `src/api/{hello,partners,profile,rawbody,search,upload}/` — moduli con `routes.ts` + `controller/`.
- `src/config/` — `general` (blocchi `control`/`tenants`, `manifest`), `plugins`, `roles`, `tracking`,
  `authFlows` (password o codice via email per identificarsi, l'admin solo con password): i soli
  nomi che il framework carica. Un file con un altro nome qui non lo legge nessuno.
- `src/utils/context.ts` — `container(req)` e `userContext(req)`.
- `src/schemas/` — JSON Schema. `src/hooks/`, `src/middleware/`, `src/schedules/`.

## Pattern dati: Service Layer legato al contenitore

I controller sono sottili e passano il contenitore al servizio:

```typescript
// src/api/partners/controller/partner.ts
const { headers, records } = await partnerService.on(container(req)).findAll(userContext(req), req.data())
```

- `container(req)` è `req.tenant ?? req.control`, e **non esiste un terzo caso**: una rotta che arriva
  senza contenitore lancia. In v4 c'era `global.connection` a cui ripiegare, ed è così che una richiesta
  finiva per leggere lo schema di un altro tenant (D-01, D-06).
- `BaseService.on(handle)` costruisce le tabelle **per quel contenitore**: Drizzle scrive il nome dello
  schema nell'SQL, quindi scegliere un contenitore è scegliere un oggetto, non mutare una connessione.
- `applyPermissions(ctx, table)` restituisce una condizione che finisce in `extraWhere`, messa in AND
  **dopo** tutto ciò che l'URL ha chiesto, `_logic` compreso: nessun filtro scritto dal client la aggira.
- Le tabelle del framework non si estendono (`docs/SCHEMA_V5.md` §6): i campi applicativi sull'utente
  stanno in `user_profile`, tabella di questo progetto. Ridefinire una tabella del framework rompe ogni
  sua migrazione futura, e la rottura arriva in fase di upgrade su un deployment già in produzione.

## Magic Query v5

Parametri riservati con underscore (`_page`, `_pageSize`, `_sort`, `_logic`), operatori senza la `s`
finale e con la `i` per l'insensibilità alle maiuscole, intervalli con `..`, `:raw` rimosso. Tabella di
corrispondenza completa in `volcanic-backend/docs/MAGIC_QUERY_V5.md` §9.

## Maturità

🟡 App di esempio ben strutturata, con suite segmentata (unit/e2e/demo) e **nessuna CI**. Verificata a
runtime contro Postgres 16 reale: migrazioni, login, CRUD dei partner, Magic Query e cancellazione
logica. Utile come scaffold e come prova della guida di migrazione, non come oracolo di ogni pattern.
