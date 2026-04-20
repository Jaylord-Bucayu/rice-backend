import { AbstractEntity } from 'src/common/database/abstract.entity';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Inventory extends AbstractEntity<Inventory> {
  @PrimaryGeneratedColumn()

  @Column({ type: 'enum', enum: ['Abono', 'Gamot','Sako','Bini'] })
  type: 'Abono' | 'Gamot' | 'Sako' | 'Bini';

  @Column()
  name: string;

   @Column({
    type: 'varchar',
    length: 400,
    default: 'https://www.shutterstock.com/image-vector/default-ui-image-placeholder-wireframes-600nw-1037719192.jpg', // default image
  })
  img_url: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  // @Column({ type: 'decimal', precision: 12, scale: 2 })
  // total: number;
}
