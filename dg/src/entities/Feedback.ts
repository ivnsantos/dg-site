import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm'
import { User } from './User'

export enum FeedbackStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

@Entity('feedbacks')
export class Feedback {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  title!: string

  @Column()
  question!: string

  @Column('simple-array')
  options!: string[]

  @Column({ type: 'text', nullable: true })
  description!: string

  @Column({ type: 'text', nullable: true })
  logoUrl!: string

  @Column({ type: 'varchar', length: 7, nullable: true })
  primaryColor!: string

  @Column({ type: 'varchar', length: 7, nullable: true })
  secondaryColor!: string

  @Column({ unique: true })
  code!: string

  @Column({
    type: 'enum',
    enum: FeedbackStatus,
    default: FeedbackStatus.ACTIVE
  })
  status!: FeedbackStatus

  @Column()
  userId!: number

  @ManyToOne(() => User, (user) => user.feedbacks)
  @JoinColumn({ name: 'userId' })
  user!: any

  @OneToMany('FeedbackResponse', 'feedback')
  responses!: any[]

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
} 