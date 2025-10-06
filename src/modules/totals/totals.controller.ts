import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { TotalsService } from './totals.service';
import { TotalsQueryDto } from './dto/total.dto';

@Controller('totals')
export class TotalsController {
  constructor(private readonly totalsService: TotalsService) {}

   @Get()
  async getTotals(@Query() query: TotalsQueryDto) {
    return this.totalsService.getTotals(query);
  }
  // Example: /totals/comparison?start_date=2025-10-01&end_date=2025-10-04
  @Get('comparison')
  async getComparison(
    @Query('start_date') start_date: string,
    @Query('end_date') end_date: string,
  ) {
    if (!start_date || !end_date) {
      throw new BadRequestException('start_date and end_date are required');
    }

    return this.totalsService.getTotalsByGrainType({
      start_date,
      end_date,
    });
  }
}
