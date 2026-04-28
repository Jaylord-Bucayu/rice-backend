import { AbstractEntity } from 'src/common/database/abstract.entity';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Inventory extends AbstractEntity<Inventory> {

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

  // total available stock (sum of all batch remaining_quantity)
  @Column({ type: 'int', default: 0 })
  quantity: number;

  // optional: for quick display (latest or average price)
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  display_unit_cost?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  display_selling_price?: number;
}