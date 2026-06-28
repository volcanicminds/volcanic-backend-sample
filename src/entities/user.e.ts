import {
  Entity,
  Column,
  Index,
  Unique,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  VersionColumn
} from 'typeorm'

import { User as UserEx } from '@volcanicminds/backend/typeorm'
import { UserLanguage } from './all.enums'

// Native columns are redeclared (override pattern) with EXPLICIT column types:
// the tsx/esbuild dev runner does not emit `emitDecoratorMetadata`, so TypeORM
// cannot infer column types from reflection. Explicit types keep both `tsx`
// (dev) and `tsc` (build) working.
@Entity()
@Unique(['username'])
@Unique(['email'])
export class User extends UserEx {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Index()
  @Column({ type: 'varchar' })
  externalId: string

  @Index()
  @Column({ type: 'varchar' })
  username: string

  @Index()
  @Column({ type: 'varchar' })
  email: string

  @Column({ type: 'varchar' })
  password: string

  @Column({ type: 'timestamp' })
  passwordChangedAt: Date

  @Column({ type: 'boolean', default: false })
  confirmed: boolean = false

  @Column({ type: 'timestamp', nullable: true })
  confirmedAt: Date

  @Column({ type: 'varchar', nullable: true })
  confirmationToken: string

  @Column({ type: 'boolean', default: false })
  blocked: boolean = false

  @Column({ type: 'varchar', nullable: true })
  blockedReason: string

  @Column({ type: 'timestamp', nullable: true })
  blockedAt: Date

  @Column({ type: 'varchar', nullable: true })
  resetPasswordToken: string

  @Column({ type: 'timestamp', nullable: true })
  resetPasswordTokenGenerationDate: Date

  @Column({ type: 'timestamp', nullable: true })
  resetPasswordTokenAt: Date

  @Column({ type: 'boolean', default: false })
  mfaEnabled: boolean = false

  @Column({ type: 'varchar', nullable: true, select: false })
  mfaSecret: string

  @Column({ type: 'varchar', nullable: true })
  mfaType: string

  @Column({ type: 'simple-array', nullable: true, select: false })
  mfaRecoveryCodes: string[]

  // Absolute TOTP time-step last consumed (unix_seconds / 30 ≈ 5.9e7 in 2026), used for anti-replay.
  // Fits in int4 until ~year 4000; stored as int so it returns a JS number (bigint would return a string).
  @Column({ type: 'int', nullable: true })
  mfaLastUsedCounter: number

  @Column({ type: 'simple-array', nullable: true })
  roles: string[]

  @VersionColumn()
  version: number

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @DeleteDateColumn()
  deletedAt: Date

  // additional custom fields : begin

  @Column({ type: 'varchar', nullable: true })
  firstName: string

  @Column({ type: 'varchar', nullable: true })
  lastName: string

  @Column({
    type: 'enum',
    enum: UserLanguage,
    default: UserLanguage.EN,
    nullable: true
  })
  language: UserLanguage

  // additional custom fields : end

  getId() {
    return this.id
  }

  setId(id) {
    this.id = id
  }
}
