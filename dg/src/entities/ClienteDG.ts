import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm'
import { PedidoDG } from './PedidoDG'
import { EnderecoDG } from './EnderecoDG'

export interface IClienteDG {
  id: number
  nome: string
  telefone: string
  ativo: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreateClienteDG {
  nome: string
  telefone: string
}

export interface UpdateClienteDG {
  nome?: string
  telefone?: string
  ativo?: boolean
}

@Entity('clientes_dg')
export class ClienteDG {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'varchar', length: 100 })
  nome!: string

  @Column({ type: 'varchar', length: 20, unique: true })
  telefone!: string

  @Column({ type: 'boolean', default: true })
  ativo!: boolean

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date

  @OneToMany(() => PedidoDG, (pedido) => pedido.clienteId, { eager: false })
  pedidos!: any[]

  @OneToMany(() => EnderecoDG, (endereco) => endereco.clienteId, { eager: false })
  enderecos!: any[]
}