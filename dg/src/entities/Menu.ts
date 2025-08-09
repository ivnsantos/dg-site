import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './User';
import { MenuSection } from './MenuSection';

export enum MenuStatus {
  ATIVO = 'Ativo',
  INATIVO = 'Inativo',
}

@Entity('menus')
export class Menu {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, user => user.id)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ unique: true })
  codigo!: string;

  @Column({
    type: 'enum',
    enum: MenuStatus,
    default: MenuStatus.ATIVO,
  })
  status!: MenuStatus;

  @Column({ length: 100 })
  name!: string;

  @Column({ length: 100, nullable: true })
  telefone?: string;

  @Column({ length: 100, nullable: true })
  instagram?: string;

  @Column({ length: 255, nullable: true })
  imageUrl!: string;

  @Column({ length: 255, nullable: true })
  imageUrlBackground?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ length: 50, default: 'default' })
  template!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @OneToMany(() => MenuSection, (section: MenuSection) => section.menu, { cascade: true, eager: true })
  sections?: MenuSection[];
} 