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

import { User as UserEx } from '@volcanicminds/typeorm'
import { UserLanguage } from './all.enums'

@Entity()
@Unique(['username'])
@Unique(['email'])
export class User extends UserEx {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Index()
  @Column()
  externalId: string

  @Index()
  @Column()
  username: string

  @Index()
  @Column()
  email: string

  @Column()
  password: string

  @Column()
  passwordChangedAt: Date

  @Column({ default: false })
  confirmed: boolean = false

  @Column({ nullable: true })
  confirmedAt: Date

  @Column({ nullable: true })
  confirmationToken: string

  @Column({ default: false })
  blocked: boolean = false

  @Column({ nullable: true })
  blockedReason: string

  @Column({ nullable: true })
  blockedAt: Date

  @Column({ nullable: true })
  resetPasswordToken: string

  @Column({ nullable: true })
  resetPasswordTokenGenerationDate: Date

  @Column({ nullable: true })
  resetPasswordTokenAt: Date

  @Column({ default: false })
  mfaEnabled: boolean = false

  @Column({ nullable: true, select: false })
  mfaSecret: string

  @Column({ nullable: true })
  mfaType: string

  @Column({ type: 'simple-array', nullable: true, select: false })
  mfaRecoveryCodes: string[]

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

  @Column({ nullable: true })
  firstName: string

  @Column({ nullable: true })
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
