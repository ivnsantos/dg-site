import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm'

@Entity('feedback_responses')
export class FeedbackResponse {
  @PrimaryGeneratedColumn()
  id!: number


  @Column()
  selectedOption!: string

  @Column({ type: 'text', nullable: true })
  textResponse!: string

  @Column({ type: 'varchar', nullable: true })
  clientName!: string

  @Column({ type: 'varchar', nullable: true })
  clientEmail!: string

  @Column()
  feedbackId!: number

  @ManyToOne('Feedback', 'responses', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'feedbackId' })
  feedback!: any

  @CreateDateColumn()
  createdAt!: Date
} 