import { AbstractEntity } from 'src/common/database/abstract.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('audit_logs')
export class AuditLog extends AbstractEntity<AuditLog> {
  
  @Column()
  action: string; // e.g. 'CREATE_USER', 'UPDATE_GRAIN'

  @Column({ nullable: true })
  entity: string; // e.g. 'User', 'Grain'

  @Column({ nullable: true })
  entityId: string;

  @Column({ type: 'jsonb', nullable: true })
  data: any;

  @Column({ nullable: true })
  userId: string;

  @Column({ nullable: true })
  username: string;

}
