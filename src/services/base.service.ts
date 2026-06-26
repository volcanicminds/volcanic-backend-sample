import { In } from 'typeorm'
import type {
  DeepPartial,
  EntityManager,
  FindOptionsRelations,
  FindOptionsWhere,
  ObjectLiteral,
  ObjectType,
  Repository
} from 'typeorm'
import { executeCountQuery, executeFindQuery } from '@volcanicminds/backend/typeorm'
import type { UserContext } from '../../types/index.js'

/**
 * BaseService — Canonical v2 data-access pattern (context-aware Service Layer).
 *
 * Usage (thin controller):
 *   await partnerService.use(req.db).findAll(req.userContext, req.data())
 *
 * The repository is ALWAYS resolved from the request-scoped EntityManager (`req.db`),
 * which keeps the service multi-tenant safe. NEVER touch `global.repository.X`: it is
 * forbidden at runtime by the @volcanicminds/backend/typeorm fail-fast Proxy.
 */
export abstract class BaseService<T extends ObjectLiteral> {
  protected manager?: EntityManager
  /** Relations to eager-load on read (passed to executeFindQuery / findOne). */
  protected relations: ObjectLiteral = {}

  constructor(protected readonly entityType: ObjectType<T>) {}

  /** Bind the service to the request-scoped manager (`req.db`). Returns a scoped clone. */
  use(manager?: EntityManager): this {
    const scoped = Object.create(this) as this
    scoped.manager = manager
    return scoped
  }

  protected get repository(): Repository<T> {
    if (!this.manager) {
      throw new Error(`[${this.constructor.name}] used without context. Call service.use(req.db) first.`)
    }
    return this.manager.getRepository(this.entityType)
  }

  /**
   * Row Level Security hook. Return an extra `where` object AND-ed to the query, or
   * `undefined` for no restriction. Override per entity to enforce RLS based on ctx.
   */
  protected applyPermissions(_ctx: UserContext): ObjectLiteral | undefined {
    return undefined
  }

  async findAll(ctx: UserContext, params: ObjectLiteral = {}): Promise<{ headers: ObjectLiteral; records: T[] }> {
    return executeFindQuery(this.repository, this.relations, params, this.applyPermissions(ctx))
  }

  async count(ctx: UserContext, params: ObjectLiteral = {}): Promise<number> {
    return executeCountQuery(this.repository, params, this.applyPermissions(ctx))
  }

  async findOne(ctx: UserContext, id: string): Promise<T | null> {
    const extra = this.applyPermissions(ctx)
    const where = extra ? { id, ...extra } : { id }
    return this.repository.findOne({
      where: where as unknown as FindOptionsWhere<T>,
      relations: this.relations as FindOptionsRelations<T>
    })
  }

  async create(_ctx: UserContext, data: ObjectLiteral): Promise<T> {
    const repo = this.repository
    const entity = repo.create(data as DeepPartial<T>)
    return repo.save(entity)
  }

  async update(_ctx: UserContext, id: string, data: ObjectLiteral): Promise<T | null> {
    const repo = this.repository
    const { id: _ignore, ...rest } = data
    const preloaded = await repo.preload({ id, ...rest } as unknown as DeepPartial<T>)
    if (!preloaded || !(preloaded as ObjectLiteral).id) return null
    return repo.save(preloaded)
  }

  async remove(_ctx: UserContext, id: string): Promise<{ affected?: number | null }> {
    return this.repository.delete(id)
  }

  async removeMany(_ctx: UserContext, ids: string[]): Promise<number> {
    if (!ids.length) return 0
    const result = await this.repository.delete({ id: In(ids) } as unknown as FindOptionsWhere<T>)
    return result?.affected || 0
  }
}
