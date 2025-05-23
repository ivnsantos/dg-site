import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm'
import { User } from './User'
import { FichaTecnica } from './FichaTecnica'

@Entity()
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

  @ManyToOne(() => User, user => user.ingredients)
  @JoinColumn({ name: 'userId' })
  user!: User

  @OneToMany(() => FichaTecnica, fichaTecnica => fichaTecnica.ingredient)
  fichaTecnicas!: FichaTecnica[]
} 