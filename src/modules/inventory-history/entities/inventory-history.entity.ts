import { AbstractEntity } from 'src/common/database/abstract.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ObjectIdColumn,
  ObjectId,
} from 'typeorm';

@Entity('inventory_history')
export class InventoryHistory extends AbstractEntity<InventoryHistory> {

  @ObjectIdColumn()
  inventoryId: ObjectId;

  @Column('int')
  old_quantity: number;

  @Column('int')
  new_quantity: number;

  @Column('decimal', { precision: 12, scale: 2 })
  old_unit_cost: number;       // ✅ replaced old_price

  @Column('decimal', { precision: 12, scale: 2 })
  new_unit_cost: number;       // ✅ replaced new_price

  @Column('decimal', { precision: 12, scale: 2 })
  old_selling_price: number;   // ✅ added

  @Column('decimal', { precision: 12, scale: 2 })
  new_selling_price: number;   // ✅ added

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'text', nullable: true })
  notes?: string;
}