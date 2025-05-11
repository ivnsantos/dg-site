import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { MenuSection } from './MenuSection';

@Entity('menu_items')
export class MenuItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => MenuSection, (section: MenuSection) => section.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'section_id' })
  section!: MenuSection;

  @Column({ length: 100 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ type: 'boolean', default: true })
  available!: boolean;

  @Column({ type: 'int', nullable: true })
  position?: number;

  @Column({ length: 255, nullable: true })
  imageUrl?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
} 