import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User';
import { Cliente } from './Cliente';
import { ItemOrcamento } from './ItemOrcamento';

@Entity('orcamentos')
export class Orcamento {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, user => user.id)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Cliente, cliente => cliente.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cliente_id' })
  cliente!: Cliente;

  @Column({ type: 'varchar', length: 50 })
  numero!: string;

  @Column({ type: 'varchar', length: 50 })
  codigo!: string;

  @Column({ type: 'date' })
  dataValidade!: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  valorTotal!: number;

  @Column({ type: 'text', nullable: true })
  observacoes?: string;

  @Column({ type: 'varchar', length: 20, default: 'PENDENTE' })
  status!: string;

  @OneToMany(() => ItemOrcamento, (item: ItemOrcamento) => item.orcamento)
  itens!: ItemOrcamento[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
} 