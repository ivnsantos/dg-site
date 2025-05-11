import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Menu } from './Menu';
import { MenuItem } from './MenuItem';

@Entity('menu_sections')
export class MenuSection {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Menu, menu => menu.sections, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'menu_id' })
  menu!: Menu;

  @Column({ length: 100 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'text', nullable: true, name: 'image_url' })
  imageUrl?: string;

  @Column({ type: 'int', nullable: true })
  position?: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @OneToMany(() => MenuItem, (item: MenuItem) => item.section, { cascade: true, eager: true })
  items?: MenuItem[];
} 