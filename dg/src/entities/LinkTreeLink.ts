import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm'
import { LinkTree } from './LinkTree'

@Entity('link_tree_links')
export class LinkTreeLink {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'varchar', length: 255 })
  title!: string

  @Column({ type: 'text' })
  url!: string

  @Column({ type: 'varchar', length: 10, default: '🔗' })
  icon!: string

  @Column({ type: 'varchar', length: 255, nullable: true })
  imageUrl!: string

  @Column({ type: 'boolean', default: true })
  isActive!: boolean

  @Column({ type: 'int', default: 0 })
  position!: number

  @Column({ type: 'int' })
  linkTreeId!: number

  @ManyToOne(() => LinkTree, linkTree => linkTree.links, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'linkTreeId' })
  linkTree!: LinkTree
} 