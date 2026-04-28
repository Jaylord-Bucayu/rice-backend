import { AbstractEntity } from 'src/common/database/abstract.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('inventory_history')
export class InventoryHistory extends AbstractEntity<InventoryHistory> {

  // ✅ match Inventory.id (number, not ObjectId)
  @Column()
  inventoryId: number;

  // ✅ track stock change only (optional but useful)
  @Column({ type: 'int', nullable: true })
  old_quantity?: number;

  @Column({ type: 'int', nullable: true })
  new_quantity?: number;

  // ❌ REMOVE these (handled by batches now)
  // old_unit_cost
  // new_unit_cost
  // old_selling_price
  // new_selling_price

  // ✅ flexible logging instead
  @Column({ type: 'json', nullable: true })
  old_data?: any;

  @Column({ type: 'json', nullable: true })
  new_data?: any;

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'text', nullable: true })
  notes?: string;
}