import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepository: Repository<AuditLog>,
  ) {}

  async logAction(
    action: string,
    entity: string,
    entityId: string,
    data: Record<string, any>,
    user?: { id?: string; username?: string },
  ) {
    const audit = this.auditRepository.create({
      action,
      entity,
      entityId,
      data,
      userId: user?.id,
      username: user?.username,
    });

    return this.auditRepository.save(audit);
  }

  async findAll() {
    return this.auditRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findByEntity(entity: string) {
    return this.auditRepository.find({
      where: { entity },
      order: { createdAt: 'DESC' },
    });
  }
}
