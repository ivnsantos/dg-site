import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm'
import { User } from './User'
import { LinkTreeLink } from './LinkTreeLink'

@Entity('link_trees')
@Index(['code'], { unique: true })
export class LinkTree {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'varchar', length: 255 })
  name!: string

  @Column({ type: 'text', nullable: true })
  description!: string

  @Column({ type: 'varchar', length: 50, unique: true, nullable: true })
  code?: string

  @Column({ type: 'varchar', length: 500, nullable: true })
  imageUrl?: string

  @Column({ type: 'boolean', default: true })
  isActive!: boolean

  @ManyToOne(() => User, (user) => user.linkTrees, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: any

  @Column({ type: 'int' })
  userId!: number

  @Column({ type: 'varchar', length: 7, default: '#2D1810' })
  backgroundColor!: string

  @Column({ type: 'varchar', length: 7, default: '#ffffff' })
  textColor!: string

  @Column({ type: 'varchar', length: 7, default: '#0B7A48' })
  accentColor!: string

  @Column({ type: 'varchar', length: 20, default: 'none' })
  backgroundEffect!: string

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date

  @OneToMany(() => LinkTreeLink, (link) => link.linkTree, { cascade: true })
  links!: any[]
} 