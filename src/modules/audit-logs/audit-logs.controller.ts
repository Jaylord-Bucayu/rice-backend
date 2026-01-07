import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';

import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { UpdateAuditLogDto } from './dto/update-audit-log.dto';
import { AuditLogsService } from './audit-logs.service';

@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

 
  @Get()
  findAll() {
    return this.auditLogsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
   // return this.auditLogsService.findOne(+id);
  }

}
