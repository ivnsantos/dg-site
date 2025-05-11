import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from "./User";
import type { IConfeitaria } from '../interfaces/entities';

@Entity("confeitarias")
export class Confeitaria implements IConfeitaria {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  nome: string;

  @OneToOne(() => User, user => user.confeitaria)
  @JoinColumn({ name: 'userId' }) 
  usuario!: User;

  @Column({ type: 'text', nullable: true })
  endereco: string;

  @Column({ length: 255, nullable: true })
  logo: string;

  @Column({ length: 100, nullable: true })
  horarioFuncionamento: string;

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  horasTrabalhoDiarias: number;

  @Column({ type: 'integer', nullable: true })
  quantidadeFuncionarios: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  folhaPagamentoTotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  faturamentoMedio: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  faturamentoDesejado: number;

  @Column({ length: 50, nullable: true })
  regimeTributario: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  porcentagemImposto: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  custosFixos: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  proLabore: number;

  @Column({ type: 'integer', nullable: true })
  diasTrabalhadosMes: number;

  @Column({ type: 'boolean', default: false, nullable: true })
  pagaComissao: boolean;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  porcentagemComissao: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  taxaMaquininha: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  porcentagemLucroDesejado: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  markupIdeal: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 