import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './User';
import { Orcamento } from './Orcamento';

@Entity('clientes')
export class Cliente {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.clientes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: any;

  @OneToMany(() => Orcamento, (orcamento) => orcamento.cliente)
  orcamentos!: any[];

  @Column({ length: 100 })
  nome!: string;

  @Column({ length: 20, nullable: true })
  telefone?: string;

  @Column({ type: 'text', nullable: true })
  endereco?: string;
} 