import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm'
import { ClienteDG } from './ClienteDG'
import { EnderecoDG } from './EnderecoDG'

@Entity('pedidos_dg')
export class PedidoDG {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'varchar', length: 20 })
  codigo!: string

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  valorTotal!: number

  @Column({ type: 'varchar', length: 20, default: 'pendente' })
  status!: 'pendente' | 'confirmado' | 'em_preparo' | 'pronto' | 'entregue' | 'cancelado'

  @Column({ type: 'text', nullable: true })
  observacoes!: string

  @Column({ type: 'varchar', length: 20, nullable: true })
  formaPagamento!: string

  @Column({ type: 'varchar', length: 20, nullable: true })
  formaEntrega!: string

  @Column({ type: 'timestamp', nullable: true })
  dataEntrega!: Date

  @Column({ type: 'varchar', length: 100, nullable: true })
  nomeDestinatario!: string

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefoneDestinatario!: string

  @ManyToOne(() => ClienteDG, (cliente) => cliente.pedidos, { eager: false })
  @JoinColumn({ name: 'cliente_id' })
  cliente!: any

  @Column({ name: 'cliente_id' })
  clienteId!: number

  @ManyToOne(() => EnderecoDG, { eager: false })
  @JoinColumn({ name: 'endereco_id' })
  endereco!: any

  @Column({ name: 'menu_id' })
  menuId!: number

  @Column({ name: 'endereco_id', nullable: true })
  enderecoId!: number | null

  // Campos para salvar o endereço de entrega diretamente no pedido
  @Column({ name: 'endereco_entrega', type: 'varchar', length: 200, nullable: true })
  enderecoEntrega!: string

  @Column({ name: 'numero_entrega', type: 'varchar', length: 20, nullable: true })
  numeroEntrega!: string

  @Column({ name: 'bairro_entrega', type: 'varchar', length: 100, nullable: true })
  bairroEntrega!: string

  @Column({ name: 'cidade_entrega', type: 'varchar', length: 100, nullable: true })
  cidadeEntrega!: string

  @Column({ name: 'estado_entrega', type: 'varchar', length: 2, nullable: true })
  estadoEntrega!: string

  @Column({ name: 'cep_entrega', type: 'varchar', length: 9, nullable: true })
  cepEntrega!: string

  @Column({ name: 'complemento_entrega', type: 'varchar', length: 100, nullable: true })
  complementoEntrega!: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date

  @OneToMany(() => ItemPedidoDG, (item) => item.pedido, { eager: false })
  itens!: any[]
}

@Entity('itens_pedido_dg')
export class ItemPedidoDG {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'varchar', length: 100 })
  nomeProduto!: string

  @Column({ type: 'int' })
  quantidade!: number

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precoUnitario!: number

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precoTotal!: number

  @Column({ type: 'text', nullable: true })
  observacao!: string

  @ManyToOne(() => PedidoDG, { eager: false })
  @JoinColumn({ name: 'pedido_id' })
  pedido!: any

  @Column({ name: 'pedido_id' })
  pedidoId!: number

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date
} 