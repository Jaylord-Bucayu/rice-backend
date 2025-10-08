import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Grain } from '../grains/entities/grain.entity';
import { Tracking } from '../tracking/entities/tracking.entity';
import { TotalsQueryDto } from './dto/total.dto';

@Injectable()
export class TotalsService {
  constructor(
    @InjectRepository(Grain)
    private readonly grainRepository: Repository<Grain>,

    @InjectRepository(Tracking)
    private readonly trackingRepository: Repository<Tracking>,
  ) {}

 async getTotals(params: {
  classifier: string;
  start_date: string;
  end_date?: string;
  grain_type?: string;
}) {
  const { classifier, start_date, end_date, grain_type } = params;

  if (!classifier || !start_date) {
    throw new BadRequestException(
      "classifier and start_date are required",
    );
  }

  // Convert dates
  const start = new Date(start_date);
  let end: Date;

  if (end_date) {
    end = new Date(end_date);
  } else {
    // if no end_date, use same as start
    end = new Date(start_date);
  }

  // Always cover the full last day (until 23:59:59)
  end.setUTCHours(23, 59, 59, 999);

  // Build query (works with Mongo driver in TypeORM)
  const where: any = {
    createdAt: {
      $gte: start,
      $lte: end,
    },
  };

  if (grain_type) {
    where.grain_type = grain_type;
  }

  let data: any[] = [];

  if (classifier === "grain") {
    data = await this.grainRepository.find({ where });
  } else if (classifier === "tracking") {
    data = await this.trackingRepository.find({ where });
  } else {
    throw new BadRequestException(
      "Invalid classifier. Use 'grain' or 'tracking'",
    );
  }

  // ✅ Aggregate totals
  const totals = data.reduce(
    (acc, item) => {
      acc.total_sacks += item.total_sacks || 0;
      acc.total_kilos += item.total_kilos || 0;
      acc.total_income += Number(item.total_income) || 0; 
      acc.total_expenses += Number(item.total_expenses) || 0;
      acc.total_profit += Number(item.total_profit) || 0;
      return acc;
    },
    {
      total_sacks: 0,
      total_kilos: 0,
      total_income: 0,
      total_expenses: 0,
      total_profit: 0,
    },
  );

  return totals;
}

async getTotalsByGrainType(params: {
  start_date: string;
  end_date: string;
}) {
  const { start_date, end_date } = params;

  const start = new Date(start_date);
  const end = new Date(end_date);
  end.setUTCHours(23, 59, 59, 999);

  // Fetch grain data only
  const data = await this.grainRepository.find({
    where: {
      //@ts-ignore
      createdAt: { $gte: start, $lte: end },
    },
  });

  // Group by grain_type
  const grouped: Record<string, any> = {};

  data.forEach(item => {
    const type = item.grain_type;
    if (!grouped[type]) {
      grouped[type] = {
        grain_type: type,
        total_sacks: 0,
        total_kilos: 0,
        total_expenses: 0,
        total_income: 0,
        total_profit: 0,
      };
    }

    grouped[type].total_sacks += item.total_sacks || 0;
    grouped[type].total_kilos += item.total_kilos || 0;
    grouped[type].total_expenses += Number(item.total_expenses) || 0;
    grouped[type].total_income += Number(item.total_income) || 0;
    grouped[type].total_profit += Number(item.total_profit) || 0;
  });

  return Object.values(grouped);
}

// ✅ getIncomeExpensesPerMonth (with month names)
async getIncomeExpensesPerMonth(params: {
  year: number;
  classifier: string;
}) {
  const { year, classifier } = params;

  if (!year || !classifier) {
    throw new BadRequestException('year and classifier are required');
  }

  // Convert dates (full year)
  const start_date = `${year}-01-01`;
  const end_date = `${year}-12-31`;

  const start = new Date(start_date);
  let end: Date;

  if (end_date) {
    end = new Date(end_date);
  } else {
    end = new Date(start_date);
  }

  // Always cover the full last day (until 23:59:59)
  end.setUTCHours(23, 59, 59, 999);

  // Build query (Mongo-style range)
  const where: any = {
    createdAt: {
      $gte: start,
      $lte: end,
    },
  };

  let data: any[] = [];

  if (classifier === 'grain') {
    data = await this.grainRepository.find({ where });
  } else if (classifier === 'tracking') {
    data = await this.trackingRepository.find({ where });
  } else {
    throw new BadRequestException("Invalid classifier. Use 'grain' or 'tracking'");
  }

  // Month labels
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Initialize monthly totals
  const grouped = monthLabels.map((month) => ({
    month,
    total_income: 0,
    total_expenses: 0,
    total_profit: 0,
  }));

  // Aggregate data
  data.forEach(item => {
    const monthIndex = new Date(item.createdAt).getMonth(); // 0–11
    grouped[monthIndex].total_income += Number(item.total_income) || 0;
    grouped[monthIndex].total_expenses += Number(item.total_expenses) || 0;
    grouped[monthIndex].total_profit += Number(item.total_profit) || 0;
  });

  return grouped;
}

}
