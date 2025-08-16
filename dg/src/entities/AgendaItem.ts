import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { User } from './User'

export type AgendaItemType = 'anotacao' | 'encomenda'
export type AgendaItemPriority = 'baixa' | 'media' | 'alta'
export type AgendaItemStatus = 'pendente' | 'em_andamento' | 'concluido'

@Entity('agenda_items')
export class AgendaItem {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({
    type: 'enum',
    enum: ['anotacao', 'encomenda'],
    default: 'anotacao'
  })
  type!: AgendaItemType

  @Column({ type: 'varchar', length: 255 })
  title!: string

  @Column({ type: 'text', nullable: true })
  description?: string

  @Column({ type: 'date' })
  startDate!: string

  @Column({ type: 'date' })
  endDate!: string

  @Column({
    type: 'enum',
    enum: ['baixa', 'media', 'alta'],
    default: 'media'
  })
  priority!: AgendaItemPriority

  @Column({
    type: 'enum',
    enum: ['pendente', 'em_andamento', 'concluido'],
    default: 'pendente'
  })
  status!: AgendaItemStatus

  @ManyToOne(() => User, (user) => user.agendaItems)
  @JoinColumn({ name: 'userId' })
  user!: any

  @Column({ type: 'int' })
  userId!: number

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
} 