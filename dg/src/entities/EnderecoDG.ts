import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, JoinColumn, ManyToOne } from 'typeorm'
import { ClienteDG } from './ClienteDG'

export interface IEnderecoDG {
  id: number
  clienteId: number
  cep?: string
  endereco: string
  numero: string
  bairro: string
  cidade: string
  estado: string
  complemento?: string
  referencia?: string
  ativo: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreateEnderecoDG {
  clienteId: number
  cep?: string
  endereco: string
  numero: string
  bairro: string
  cidade: string
  estado: string
  complemento?: string
  referencia?: string
}

export interface UpdateEnderecoDG {
  cep?: string
  endereco?: string
  numero?: string
  bairro?: string
  cidade?: string
  estado?: string
  complemento?: string
  referencia?: string
  ativo?: boolean
}

@Entity('enderecos_dg')
export class EnderecoDG {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ name: 'cliente_id' })
  clienteId!: number

  @Column({ type: 'varchar', length: 9, nullable: true })
  cep?: string

  @Column({ type: 'varchar', length: 200 })
  endereco!: string

  @Column({ type: 'varchar', length: 20, nullable: true })
  numero!: string

  @Column({ type: 'varchar', length: 100 })
  bairro!: string

  @Column({ type: 'varchar', length: 100 })
  cidade!: string

  @Column({ type: 'varchar', length: 2 })
  estado!: string

  @Column({ type: 'varchar', length: 100, nullable: true })
  complemento?: string

  @Column({ type: 'varchar', length: 100, nullable: true })
  referencia?: string

  @Column({ type: 'boolean', default: true })
  ativo!: boolean

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date

  @ManyToOne(() => ClienteDG)
  @JoinColumn({ name: 'cliente_id' })
  cliente!: any
}
