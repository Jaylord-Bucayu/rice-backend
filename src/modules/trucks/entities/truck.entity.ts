import { AbstractEntity } from 'src/common/database/abstract.entity';
import { Entity, Column } from 'typeorm';

@Entity()
export class Truck extends AbstractEntity<Truck> {
  @Column()
  driver_name: string;

  @Column({ unique: true })
  plate_no: string;

  @Column()
  truck_name: string;
}
