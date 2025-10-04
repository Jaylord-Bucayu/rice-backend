import { Controller, Get, Query } from '@nestjs/common';
import { TotalsService } from './totals.service';
import { TotalsQueryDto } from './dto/total.dto';

@Controller('totals')
export class TotalsController {
  constructor(private readonly totalsService: TotalsService) {}

   @Get()
  async getTotals(@Query() query: TotalsQueryDto) {
    return this.totalsService.getTotals(query);
  }
}
