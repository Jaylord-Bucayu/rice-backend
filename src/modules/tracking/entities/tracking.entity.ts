import { AbstractEntity } from 'src/common/database/abstract.entity';
import { Entity, Column } from 'typeorm';

@Entity()
export class Tracking extends AbstractEntity<Tracking> {
  @Column()
  grain_type: string;

  @Column()
  total_sacks: number;

  @Column()
  total_kilos: number;

  @Column()
  price_per_kilo: number;

  @Column()
  total_income: number; // was total_price

  @Column('json', { nullable: true })
  expenses: { title: string; amount: number }[];

  @Column()
  total_expenses: number;

  @Column()
  total_profit: number; // was total_earning

  // 🚚 Truck stored as JSON
  @Column('json')
  truck: {
    driver_name: string;
    plate_no: string;
    truck_name: string;
  };

  // 🧱 Backload stored as JSON with nested structure
  @Column('json', {
    nullable: false,
    default: {
      cement: { quantity: 0, price: 0, total: 0 },
      abono: { quantity: 0, price: 0, total: 0 },
      hardware: { quantity: 0, price: 0, total: 0 },
    },
  })
  backload: {
    cement: { quantity: number; price: number; total: number };
    abono: { quantity: number; price: number; total: number };
    hardware: { quantity: number; price: number; total: number };
  };

  // 💰 Total of all backload items
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  total_backload_amount: number;
}
