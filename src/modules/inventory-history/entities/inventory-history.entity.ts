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

  // MUST MATCH Inventory.id TYPE
  @ObjectIdColumn()
  inventoryId: ObjectId;


  @Column('int')
  old_quantity: number;

  @Column('int')
  new_quantity: number;

  @Column('decimal', { precision: 12, scale: 2 })
  old_price: number;

  @Column('decimal', { precision: 12, scale: 2 })
  new_price: number;

//   @Column('decimal', { precision: 12, scale: 2 })
//   old_total: number;

//   @Column('decimal', { precision: 12, scale: 2 })
//   new_total: number;

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'text', nullable: true })
  notes?: string;
}
