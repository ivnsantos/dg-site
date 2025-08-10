import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm'
import { User } from './User'

@Entity('subscriptions')
@Index(['userId'], { unique: true }) // Garante que um usuário só pode ter uma assinatura
@Index(['externalId'], { unique: true }) // ID externo único
@Index(['status'])
@Index(['nextDueDate'])
export class Subscription {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'varchar', length: 100, unique: true })
  externalId!: string // ID da assinatura no sistema externo (ex: sub_3dbvs2ngwyg8ezcg)

  @Column({ type: 'varchar', length: 100, nullable: true })
  customerId?: string // ID do cliente no sistema externo (ex: cus_000006899660)

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  value!: number // Valor da assinatura (ex: 5.50)

  @Column({ type: 'varchar', length: 10 })
  cycle!: string // Ciclo de cobrança (ex: MONTHLY, YEARLY)

  @Column({ type: 'text', nullable: true })
  description?: string // Descrição da assinatura

  @Column({ type: 'varchar', length: 20 })
  billingType!: string // Tipo de cobrança (ex: CREDIT_CARD, PIX, BOLETO)

  @Column({ type: 'varchar', length: 20 })
  status!: string // Status da assinatura (ex: ACTIVE, INACTIVE, CANCELLED, OVERDUE)

  @Column({ type: 'boolean', default: false })
  deleted!: boolean // Se a assinatura foi deletada

  @Column({ type: 'date', nullable: true })
  dateCreated?: Date // Data de criação da assinatura

  @Column({ type: 'date', nullable: true })
  nextDueDate?: Date // Próxima data de vencimento

  @Column({ type: 'date', nullable: true })
  endDate?: Date // Data de término da assinatura

  @Column({ type: 'varchar', length: 255, nullable: true })
  externalReference?: string // Referência externa

  @Column({ type: 'varchar', length: 255, nullable: true })
  paymentLink?: string // Link de pagamento

  @Column({ type: 'varchar', length: 255, nullable: true })
  checkoutSession?: string // Sessão de checkout

  // Informações do cartão de crédito
  @Column({ type: 'varchar', length: 4, nullable: true })
  creditCardNumber?: string // Últimos 4 dígitos do cartão

  @Column({ type: 'varchar', length: 20, nullable: true })
  creditCardBrand?: string // Bandeira do cartão

  @Column({ type: 'varchar', length: 100, nullable: true })
  creditCardToken?: string // Token do cartão

  // Relacionamento com o usuário
  @ManyToOne(() => User, (user) => user.subscriptions)
  @JoinColumn({ name: 'userId' })
  user!: any

  @Column({ type: 'int' })
  userId!: number

  // Campos de auditoria
  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date

  // Métodos auxiliares
  isActive(): boolean {
    return this.status === 'ACTIVE' && !this.deleted
  }

  isOverdue(): boolean {
    if (!this.nextDueDate) return false
    return new Date() > this.nextDueDate && this.status === 'ACTIVE'
  }

  isExpired(): boolean {
    if (!this.endDate) return false
    return new Date() > this.endDate
  }

  getDaysUntilNextDue(): number {
    if (!this.nextDueDate) return 0
    const today = new Date()
    const dueDate = new Date(this.nextDueDate)
    const diffTime = dueDate.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  getFormattedValue(): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(this.value)
  }

  getFormattedNextDueDate(): string {
    if (!this.nextDueDate) return 'N/A'
    return new Date(this.nextDueDate).toLocaleDateString('pt-BR')
  }

  getFormattedEndDate(): string {
    if (!this.endDate) return 'N/A'
    return new Date(this.endDate).toLocaleDateString('pt-BR')
  }
} 