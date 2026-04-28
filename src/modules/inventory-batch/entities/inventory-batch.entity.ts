import { AbstractEntity } from 'src/common/database/abstract.entity';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class InventoryBatch extends AbstractEntity<InventoryBatch> {

  @Column()
  inventory_id: number; // reference to Inventory (manual)

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'int', default: 0 })
  sold_quantity: number;

  @Column({ type: 'int' })
  remaining_quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unit_cost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  selling_price: number;

  @Column({ type: 'timestamp', nullable: true })
  expiry_date?: Date;

  @Column({ nullable: true })
  batch_code?: string;

  @Column({ nullable: true })
  supplier?: string;
}