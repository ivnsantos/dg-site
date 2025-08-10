import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

@Entity('header_orcamento')
export class HeaderOrcamento {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.headerOrcamentos)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ length: 100 })
  nomeFantasia!: string;

  @Column({ type: 'text', nullable: true })
  logotipoUrl?: string;

  @Column({ length: 20, nullable: true })
  telefone?: string;

  @Column({ length: 100, nullable: true })
  instagram?: string;
} 