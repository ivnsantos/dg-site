import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

export enum StatusCupom {
  ATIVO = 'ATIVO',
  INATIVO = 'INATIVO',
  EXPIRADO = 'EXPIRADO'
}

@Entity("cupons")
export class Cupom {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ length: 255 })
  nome!: string

  @Column({ 
    length: 50,
    unique: true 
  })
  codigo!: string

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2
  })
  desconto!: number // valor em porcentagem (ex: 10.00 = 10%)

  @Column({
    type: 'enum',
    enum: StatusCupom,
    default: StatusCupom.ATIVO
  })
  status: StatusCupom

  @Column({ nullable: true })
  dataExpiracao: Date

  @Column({ 
    type: 'integer',
    nullable: true,
    name: 'limite_usos'
  })
  limiteUsos: number

  @Column({ 
    type: 'integer',
    default: 0,
    name: 'quantidade_usos'
  })
  quantidadeUsos: number

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date
} 