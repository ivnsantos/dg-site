import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm'
import { User } from './User'
import { FichaTecnica } from './FichaTecnica'

@Entity("products")
export class Product {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  name!: string

  @Column({ nullable: true })
  description!: string

  @Column()
  quantity!: number

  @Column('decimal', { precision: 10, scale: 2 })
  price!: number

  @Column()
  category!: string

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date

  @Column('decimal', { precision: 10, scale: 2 })
  totalWeight!: number // Peso total em gramas

  @Column('decimal', { precision: 10, scale: 2 })
  totalCost!: number // Custo total dos ingredientes

  @Column('decimal', { precision: 10, scale: 2 })
  suggestedPrice!: number // Preço sugerido baseado no markup

  @Column('decimal', { precision: 10, scale: 2 })
  sellingPrice!: number // Preço de venda real

  @Column('decimal', { precision: 10, scale: 2 })
  profitMargin!: number // Margem de lucro real em porcentagem

  @Column('decimal', { precision: 10, scale: 2, default: 2.5 })
  idealMarkup!: number // Markup ideal (padrão 2.5 = 250%)

  @Column({ type: 'timestamp' })
  lastUpdate!: Date

  @ManyToOne('User', 'products')
  @JoinColumn({ name: 'userId' })
  user!: User

  @OneToMany('FichaTecnica', 'product')
  fichaTecnicas!: FichaTecnica[]
} 