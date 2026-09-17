//
// One copy of each peer dependency, when the framework is a local checkout.
//
// Installed from npm, `@volcanicminds/backend` arrives without a `node_modules` of its own and
// its peer dependencies — drizzle-orm, pg, bcrypt — resolve to this project's copies. That is
// the contract a peer dependency expresses: one instance, shared.
//
// A `file:` dependency is a symlink to a working checkout, and that checkout has its own
// `node_modules` from its own development. Node resolves through the realpath, so the
// framework finds ITS drizzle and this project finds its own: two copies of the same version,
// and a table object built by one is a foreign object to the other. The symptom is a type
// error that names two identical paths, or worse, a runtime that silently disagrees.
//
// So this replaces the duplicates here with links to the framework's copies. It runs on
// `postinstall`, does nothing when the dependency came from the registry, and is a
// development convenience rather than a shape production ever sees.
//
import { existsSync, lstatSync, rmSync, symlinkSync, readlinkSync } from 'fs'
import { dirname, join, relative, resolve } from 'path'
import { fileURLToPath } from 'url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const backend = join(root, 'node_modules', '@volcanicminds', 'backend')

// Shared instance required: a table object, a SQL fragment or a pool created by one copy is
// not recognised by the other.
const SHARED = ['drizzle-orm', 'pg', 'bcrypt']

if (!existsSync(backend) || !lstatSync(backend).isSymbolicLink()) {
  process.exit(0)
}

const target = resolve(dirname(backend), readlinkSync(backend))

for (const name of SHARED) {
  const theirs = join(target, 'node_modules', name)
  const ours = join(root, 'node_modules', name)
  if (!existsSync(theirs)) continue
  if (existsSync(ours) && lstatSync(ours).isSymbolicLink()) continue
  if (!existsSync(ours)) continue

  rmSync(ours, { recursive: true, force: true })
  symlinkSync(relative(dirname(ours), theirs), ours, 'dir')
  console.log(`link-peers: ${name} -> framework checkout`)
}
