import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Orcamento } from './Orcamento';

@Entity('itens_orcamento')
export class ItemOrcamento {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne('Orcamento', (orcamento: Orcamento) => orcamento.itens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orcamento_id' })
  orcamento!: Orcamento;

  @Column({ type: 'varchar', length: 100 })
  descricao!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantidade!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  valorUnitario!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  valorTotal!: number;

  @Column({ type: 'text', nullable: true })
  observacoes?: string;
} 