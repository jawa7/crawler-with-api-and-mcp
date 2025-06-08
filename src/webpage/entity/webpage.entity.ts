import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class WebPage {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ nullable: true })
  name: string;
  @Column({ unique: true })
  url: string;
  @Column({ nullable: false })
  title: string;
  @Column({ nullable: false })
  description: string;
  @Column({ nullable: false })
  category: string;
  @Column('text', { nullable: false })
  text: string;
  @Column({ nullable: true })
  wholePage: string;
  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
  @Column({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
