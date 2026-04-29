import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Grain, GrainStatus } from './entities/grain.entity';
import { CreateGrainDto } from './dto/create-grain.dto';
import { UpdateGrainDto } from './dto/update-grain.dto';
import { ObjectId } from 'mongodb';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { Expense } from '../expense/entities/expense.entity';

@Injectable()
export class GrainsService {
  constructor(
    @InjectRepository(Grain)
    private readonly grainRepository: Repository<Grain>,
    private readonly auditLogsService: AuditLogsService,
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
  ) { }


  async create(createGrainDto: CreateGrainDto,
    user: any, // or @Req() req in controller
  ): Promise<Grain> {
    // ✅ Base income
    const total_gross =
      createGrainDto.total_kilos * createGrainDto.price_per_kilo;

    // ✅ Total expenses
    const total_expenses =
      createGrainDto.expenses?.reduce((sum, exp) => sum + exp.amount, 0) ?? 0;

    // ✅ Compute total_gross based on status
    let total_net = total_gross;

    if (createGrainDto.status === GrainStatus.BUY) {
      total_net = total_gross + total_expenses;
    }

    if (createGrainDto.status === GrainStatus.SELL) {
      total_net = total_gross - total_expenses;
    }

    const grain = this.grainRepository.create({
      ...createGrainDto,
      total_net,
      total_expenses,
      total_gross,
      cropping_year: createGrainDto.cropping_year,
    });

    // ✅ SAVE FIRST
    const savedGrain = await this.grainRepository.save(grain);

    // ✅ AUDIT LOG — CREATE GRAIN
    await this.auditLogsService.logAction(
      'CREATE_GRAIN',
      'Grain',
      //@ts-ignore
      savedGrain.id, // ✅ ENTITY ID
      {
        total_gross,
        total_net,
        total_expenses,
        status: savedGrain.status,
      },
      {
        id: user.id,
        username: user.email, // or username
      },
    );


    return savedGrain;
  }


  async findAll(
    start_date?: string,
    end_date?: string,
    status?: string,
    cropping?: number,
    cropping_year?: number,
  ): Promise<{
    data: Grain[]
    totals: {
      total_kilos: number
      average_price_per_kilo: number
      total_grain_value: number
      total_expenses: number
      total_gross_value: number
      count: number
    }
  }> {
    const where: any = {}

    if (status) where.status = status

    // ── Date / cropping filter ──────────────────────────────────────────────
    let dateRange: { start?: Date; end?: Date } = {}

    if (cropping === 1 || cropping === 2) {
      where.cropping = Number(cropping)
    } else if (cropping === 3 || cropping === undefined) {
      if (start_date || end_date) {
        const start = new Date(start_date)
        const end = end_date ? new Date(end_date) : new Date(start_date)
        end.setUTCHours(23, 59, 59, 999)

        where.createdAt = { $gte: start, $lte: end }
        dateRange = { start, end }          // keep for Expense query below
      }
    }

    if (cropping_year) where.cropping_year = Number(cropping_year)

    // ── Fetch grains ────────────────────────────────────────────────────────
    const grains = await this.grainRepository.find({ where })

    // ── Base totals from Grain rows ─────────────────────────────────────────
    const { total_kilos, total_grain_value, grain_expenses } = grains.reduce(
      (acc, g) => {
        acc.total_kilos += g.total_kilos ?? 0
        acc.total_grain_value += Number(g.total_gross ?? 0)
        acc.grain_expenses += Number(g.total_expenses ?? 0)
        return acc
      },
      { total_kilos: 0, total_grain_value: 0, grain_expenses: 0 },
    )

    // ── Resolve total_expenses based on status ──────────────────────────────
    let total_expenses: number

    if (status === 'buy') {
      const expenseWhere: any = { status: GrainStatus.BUY }

      if (dateRange.start && dateRange.end) {
        // ✅ MongoDB syntax, NOT Between()
        expenseWhere.createdAt = {
          $gte: dateRange.start,
          $lte: dateRange.end,
        }
      }

      const expenses = await this.expenseRepository.find({ where: expenseWhere })
      total_expenses = expenses.reduce((sum, e) => sum + Number(e.amount ?? 0), 0)
    } else {
      // sell (or unfiltered) → use the value embedded in Grain rows
      total_expenses = grain_expenses
    }

    // ── Derived totals ──────────────────────────────────────────────────────
    const average_price_per_kilo =
      total_kilos > 0
        ? Number((total_grain_value / total_kilos).toFixed(2))
        : 0

    const total_gross_value =
      status === 'sell'
        ? total_grain_value - total_expenses
        : total_grain_value + total_expenses

    return {
      data: grains,
      totals: {
        total_kilos,
        average_price_per_kilo,
        total_grain_value,
        total_expenses,
        total_gross_value,
        count: grains.length,
      },
    }
  }




  /*async findAll(
    start_date?: string,
    end_date?: string,
    status?: string,
    cropping?: number,
    cropping_year?: number
  ): Promise<{ data: Grain[]; totals: any }> {
    const where: any = {};
  
    // ✅ Status filter
    if (status) {
      where.status = status;
    }
  
    // ✅ Cropping filter logic
    if (cropping == 1 || cropping == 2) {
      where.cropping = Number(cropping);
    } else if (cropping === 3 || cropping === undefined) {
      if (start_date || end_date) {
        const start = new Date(start_date);
        const end = end_date ? new Date(end_date) : new Date(start_date);
        end.setUTCHours(23, 59, 59, 999);
  
        where.createdAt = {
          $gte: start,
          $lte: end,
        };
      }
    }
  
    // ✅ Cropping year filter
    if (cropping_year) {
      where.cropping_year = Number(cropping_year);
    }
  
    // ✅ Use aggregation for totals
    const pipeline: any[] = [
      { $match: where },
      {
        $group: {
          _id: null,
          total_sacks: { $sum: '$total_sacks' },
          total_kilos: { $sum: '$total_kilos' },
          total_income: { $sum: '$total_income' },
          total_expenses: { $sum: '$total_expenses' },
          total_gross: { $sum: '$total_gross' },
        },
      },
    ];
  
    const [totalsResult] = await this.grainRepository.aggregate(pipeline).toArray();
  
    const totals = totalsResult
      ? {
          total_sacks: totalsResult.total_sacks || 0,
          total_kilos: totalsResult.total_kilos || 0,
          total_income: totalsResult.total_income || 0,
          total_expenses: totalsResult.total_expenses || 0,
          total_gross: totalsResult.total_gross || 0,
        }
      : {
          total_sacks: 0,
          total_kilos: 0,
          total_income: 0,
          total_expenses: 0,
          total_gross: 0,
        };
  
    // ✅ Fetch filtered data separately (paginated if needed)
    const data = await this.grainRepository.find({ where });
  
    return { data, totals };
  }
  */



  async findOne(id: string): Promise<Grain> {
    let objectId: ObjectId;

    try {
      objectId = new ObjectId(id);
    } catch (e) {
      throw new NotFoundException(`Invalid ID format: ${id}`);
    }

    const grain = await this.grainRepository.findOne({
      //@ts-ignore
      where: { _id: objectId },
    });

    if (!grain) {
      throw new NotFoundException(`Grain with ID ${id} not found`);
    }

    return grain;
  }

  async update(id: string, updateGrainDto: UpdateGrainDto, user: any): Promise<Grain> {
    let objectId: ObjectId;
    try {
      objectId = new ObjectId(id);
    } catch (e) {
      throw new NotFoundException(`Invalid ID format: ${id}`);
    }

    // Find existing grain
    const grain = await this.findOne(id);

    // Apply updates
    Object.assign(grain, updateGrainDto);

    // ✅ Always recalc total_income
    if (grain.total_kilos && grain.price_per_kilo) {
      grain.total_gross = grain.total_kilos * grain.price_per_kilo;
    }

    // ✅ Always recalc total_expenses
    grain.total_expenses =
      grain.expenses?.reduce((sum, exp) => sum + exp.amount, 0) ?? 0;

    // ✅ Always recalc total_profit
    grain.total_net = grain.total_gross + grain.total_expenses;

    const savedGrain = await this.grainRepository.save(grain);

    // ✅ AUDIT LOG — CREATE GRAIN
    await this.auditLogsService.logAction(
      'UPDATE_GRAIN',
      'Grain',
      //@ts-ignore
      savedGrain.id, // ✅ ENTITY ID
      savedGrain,
      {
        id: user.id,
        username: user.email, // or username
      },
    );

    return savedGrain;
  }

  async remove(id: string, user: any): Promise<void> {
    let objectId: ObjectId;
    try {
      objectId = new ObjectId(id);
    } catch (e) {
      throw new NotFoundException(`Invalid ID format: ${id}`);
    }

    const result = await this.grainRepository.delete(objectId);

    // ✅ AUDIT LOG — DELETE GRAIN
    await this.auditLogsService.logAction(
      'DELETE_GRAIN',
      'Grain',
      //@ts-ignore
      id, // ✅ ENTITY ID
      result,
      {
        id: user.id,
        username: user.email, // or username
      },
    );

    if (result.affected === 0) {
      throw new NotFoundException(`Grain with ID ${id} not found`);
    }
  }


  // 🆕 NEW FUNCTION — Get grains by multiple IDs
  async findByIds(ids: string[]) {
    if (!ids || !ids.length) {
      throw new NotFoundException('No IDs provided');
    }

    // Convert string IDs to ObjectId instances
    const objectIds = ids.map((id) => {
      try {
        return new ObjectId(id);
      } catch {
        throw new NotFoundException(`Invalid ID format: ${id}`);
      }
    });

    // @ts-ignore (MongoDB filter)
    const grains = await this.grainRepository.find({
      //@ts-ignore
      where: { _id: { $in: objectIds } },
    });

    if (!grains.length)
      throw new NotFoundException('No grains found for provided IDs');

    // 🧮 Compute summary totals
    const summary = {
      total_gross: grains.reduce((sum, g) => sum + (g.total_gross || 0), 0),
      total_expenses: grains.reduce((sum, g) => sum + (g.total_expenses || 0), 0),
      total_net: grains.reduce((sum, g) => sum + (g.total_net || 0), 0),
      total_kilos: grains.reduce((sum, g) => sum + (g.total_kilos || 0), 0),
      price_per_kilo: grains.reduce((sum, g) => sum + (g.price_per_kilo || 0), 0),

    };

    return { grains, summary };
  }

  async getGrainSummaryByStatus(
    status: GrainStatus,
    start_date?: string,
    end_date?: string,
  ) {
    if (!Object.values(GrainStatus).includes(status)) {
      throw new BadRequestException('Invalid grain status');
    }

    let where: any = { status };

    if (start_date || end_date) {
      const start = new Date(start_date);
      let end = end_date ? new Date(end_date) : new Date(start_date);
      end.setUTCHours(23, 59, 59, 999);

      where.createdAt = {
        $gte: start,
        $lte: end,
      };
    }

    const records = await this.grainRepository.find({ where });

    if (!records.length) {
      return {
        status,
        total_kilos: 0,
        average_price: 0,
        total_expenses: 0,
        average_gross: 0,
      };
    }

    let totalKilos = 0;
    let totalExpenses = 0;
    let totalPrice = 0;
    let priceCount = 0;

    for (const item of records) {
      totalKilos += Number(item.total_kilos) || 0;
      totalExpenses += Number(item.total_expenses) || 0;

      if (item.price_per_kilo !== null && item.price_per_kilo !== undefined) {
        totalPrice += Number(item.price_per_kilo) || 0;
        priceCount++;
      }
    }

    const averagePrice = priceCount > 0 ? totalPrice / priceCount : 0;
    const averageGross = totalKilos * averagePrice;

    return {
      status,
      total_kilos: totalKilos,
      average_price: Number(averagePrice.toFixed(2)),
      total_expenses: totalExpenses,
      average_gross: Number(averageGross.toFixed(2)),
    };
  }
}
