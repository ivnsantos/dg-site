import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

@Entity('footer_orcamento')
export class FooterOrcamento {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, user => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'text', default: 'Pix ou Kix no cartão de crédito' })
  formaPagamento!: string;

  @Column({ type: 'text', nullable: true })
  pix?: string;
} 