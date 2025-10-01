import { Entity, Column } from 'typeorm';
import { AbstractEntity } from 'src/common/database/abstract.entity';

@Entity()
export class Grain extends AbstractEntity<Grain> {
  @Column()
  grain_type: string;

  @Column('int')
  total_sacks: number;

  @Column('int')
  total_kilos: number;

  @Column('decimal', { precision: 10, scale: 2 })
  price_per_kilo: number;

  @Column('decimal', { precision: 12, scale: 2 })
  total_price: number;
}
