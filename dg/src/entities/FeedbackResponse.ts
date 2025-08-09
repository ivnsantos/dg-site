import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { Feedback } from './Feedback'

@Entity('feedback_responses')
export class FeedbackResponse {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  feedbackId!: number

  @Column()
  selectedOption!: string

  @Column({ type: 'text', nullable: true })
  textResponse!: string

  @Column({ type: 'varchar', nullable: true })
  clientName!: string

  @Column({ type: 'varchar', nullable: true })
  clientEmail!: string

  @ManyToOne(() => Feedback, feedback => feedback.responses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'feedbackId' })
  feedback?: Feedback

  @CreateDateColumn()
  createdAt!: Date
} 