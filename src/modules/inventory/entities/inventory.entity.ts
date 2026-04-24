import { AbstractEntity } from 'src/common/database/abstract.entity';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Inventory extends AbstractEntity<Inventory> {
  @PrimaryGeneratedColumn()

  @Column({ type: 'enum', enum: ['Abono', 'Gamot', 'Sako', 'Bini'] })
  type: 'Abono' | 'Gamot' | 'Sako' | 'Bini';

  @Column()
  name: string;

  @Column({
    type: 'varchar',
    length: 400,
    default: 'https://www.shutterstock.com/image-vector/default-ui-image-placeholder-wireframes-600nw-1037719192.jpg',
  })
  img_url: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unit_cost: number;  // ✅ added

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  selling_price: number;  // ✅ added
}