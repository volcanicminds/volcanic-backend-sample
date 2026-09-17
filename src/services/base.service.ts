/* eslint-disable @typescript-eslint/no-explicit-any */
import { and, eq, inArray, isNull, type SQL, type Table } from 'drizzle-orm'
import type { DataHandle } from '@volcanicminds/backend'
import { access, executeCount, executeFind, type QueryOptions } from '@volcanicminds/backend/db'
import type { AppTables } from '../tables/index.js'
import { tablesFor } from '../tables/index.js'
import type { UserContext } from '../../types/index.js'

/**
 * BaseService — the context-aware data-access pattern, on the v5 data layer.
 *
 * Usage (thin controller):
 *   await partnerService.on(req.tenant ?? req.control).findAll(userContext(req), req.data())
 *
 * What changed from v4, and why it is not a rename. The service used to be bound to an
 * `EntityManager` taken from `req.db`, and a service used without one fell back to the global
 * connection — which meant reading whichever container the pool happened to hold (defects
 * D-01, D-06). Here the handle is the only way in, the table objects are built for the
 * container that handle addresses, and a call with no handle throws instead of guessing.
 */
export abstract class BaseService<K extends keyof AppTables> {
  protected handle?: DataHandle

  /**
   * Fields that must never be returned and — new in v5 — never filtered on either: a filter
   * on a hash is an oracle, so the query layer answers 400 rather than running it.
   */
  protected sensitiveFields: string[] = []

  constructor(protected readonly tableName: K) {}

  /** Bind the service to the container this request works on. Returns a scoped clone. */
  on(handle?: DataHandle): this {
    const scoped = Object.create(this) as this
    scoped.handle = handle
    return scoped
  }

  protected get bound(): { handle: DataHandle; db: any; table: Table; options: QueryOptions } {
    if (!this.handle) {
      throw new Error(`[${this.constructor.name}] used without a container. Call service.on(req.tenant ?? req.control).`)
    }
    const { db, dialect } = access(this.handle, this.constructor.name)
    return {
      handle: this.handle,
      db,
      table: tablesFor(this.handle)[this.tableName] as unknown as Table,
      options: { dialect, sensitiveFields: this.sensitiveFields }
    }
  }

  /**
   * Row-level security hook. Return an extra condition AND-ed to every read, or `undefined`
   * for no restriction. Override per table.
   */
  protected applyPermissions(_ctx: UserContext, _table: any): SQL | undefined {
    return undefined
  }

  /** Soft-deleted rows are out of every read unless a route deliberately asks for them. */
  protected alive(table: any): SQL | undefined {
    return table.deletedAt ? isNull(table.deletedAt) : undefined
  }

  async findAll(ctx: UserContext, params: Record<string, unknown> = {}) {
    const { db, table, options } = this.bound
    const restriction = and(...([this.alive(table), this.applyPermissions(ctx, table)].filter(Boolean) as SQL[]))
    return executeFind<any>({ db }, table, params, { ...options, extraWhere: restriction } as QueryOptions)
  }

  async count(ctx: UserContext, params: Record<string, unknown> = {}) {
    const { db, table, options } = this.bound
    const restriction = and(...([this.alive(table), this.applyPermissions(ctx, table)].filter(Boolean) as SQL[]))
    return executeCount({ db }, table, params, { ...options, extraWhere: restriction } as QueryOptions)
  }

  async findOne(ctx: UserContext, id: string) {
    const { db, table } = this.bound
    const t = table as any
    const where = and(...([eq(t.id, id), this.alive(t), this.applyPermissions(ctx, t)].filter(Boolean) as SQL[]))
    const rows = await db.select().from(table).where(where).limit(1)
    return rows[0] ?? null
  }

  async create(_ctx: UserContext, data: Record<string, unknown>) {
    const { db, table } = this.bound
    const rows = await db.insert(table).values(this.writable(data)).returning()
    return rows[0] ?? null
  }

  async update(ctx: UserContext, id: string, data: Record<string, unknown>) {
    const { db, table } = this.bound
    const t = table as any
    const where = and(...([eq(t.id, id), this.alive(t), this.applyPermissions(ctx, t)].filter(Boolean) as SQL[]))
    const rows = await db
      .update(table)
      .set({ ...this.writable(data), updatedAt: new Date() })
      .where(where)
      .returning()
    return rows[0] ?? null
  }

  /**
   * Soft delete: the row keeps its place and stops being read. A hard `delete` is available
   * on the table for the cases that need it, but it is not what a REST DELETE should mean on
   * data an audit trail refers to.
   */
  async remove(ctx: UserContext, id: string) {
    const updated = await this.update(ctx, id, { deletedAt: new Date() } as Record<string, unknown>)
    return { affected: updated ? 1 : 0 }
  }

  async removeMany(ctx: UserContext, ids: string[]) {
    if (!ids.length) return 0
    const { db, table } = this.bound
    const t = table as any
    const where = and(...([inArray(t.id, ids), this.alive(t), this.applyPermissions(ctx, t)].filter(Boolean) as SQL[]))
    const rows = await db.update(table).set({ deletedAt: new Date(), updatedAt: new Date() }).where(where).returning()
    return rows.length
  }

  /**
   * The columns a caller is allowed to write.
   *
   * Built from the table rather than from a denylist: a column added tomorrow is writable
   * only if it is in the table, and a key the caller invented is dropped instead of reaching
   * the database as an error nobody can read. The identity and the stamps are the table's.
   */
  protected writable(data: Record<string, unknown>): Record<string, unknown> {
    const table = this.bound.table as unknown as Record<string, unknown>
    const reserved = new Set(['id', 'createdAt', 'updatedAt'])
    const out: Record<string, unknown> = {}
    for (const key of Object.keys(data)) {
      if (reserved.has(key)) continue
      if (key in table) out[key] = data[key]
    }
    return out
  }
}
