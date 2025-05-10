import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm'

@Entity('ingredients')
export class Ingredient {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  name!: string

  @Column()
  unit!: string

  @Column('decimal', { precision: 10, scale: 2})
  quantity!: number

  @Column('decimal', { precision: 10, scale: 2 })
  pricePerGram!: number

  @Column()
  brand!: string

  @Column()
  lastUpdate!: Date

  @ManyToOne('User', 'ingredients')
  @JoinColumn({ name: 'user_id' })
  user!: any

  @OneToMany('FichaTecnica', 'ingredient')
  fichaTecnicas!: any[]
} 