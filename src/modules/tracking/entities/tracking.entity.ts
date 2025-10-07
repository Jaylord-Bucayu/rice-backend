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

  // truck stored as JSON
  @Column('json')
  truck: {
    driver_name: string;
    plate_no: string;
    truck_name: string;
  };

  //backload
  @Column('json', { nullable: false, default: { cement_amount: 0, abono_amount: 0, hardware_amount: 0 } })
  backload: { cement_amount: number; abono_amount: number; hardware_amount: number };

  @Column()
  //total_amount backload
   total_backload_amount: number;
}
