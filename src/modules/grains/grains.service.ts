import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Grain } from './entities/grain.entity';
import { CreateGrainDto } from './dto/create-grain.dto';
import { UpdateGrainDto } from './dto/update-grain.dto';
import { ObjectId } from 'mongodb';

@Injectable()
export class GrainsService {
  constructor(
    @InjectRepository(Grain)
    private readonly grainRepository: Repository<Grain>,
  ) { }

async create(createGrainDto: CreateGrainDto): Promise<Grain> {
  // ✅ Compute total_income = kilos × price_per_kilo
  const total_income =
    createGrainDto.total_kilos * createGrainDto.price_per_kilo;

  // ✅ Compute total_expenses from expenses[]
  const total_expenses =
    createGrainDto.expenses?.reduce((sum, exp) => sum + exp.amount, 0) ?? 0;

  // ✅ Compute total_gross = income + expenses
  const total_gross = total_income + total_expenses;

  // ✅ Include cropping_year directly
  const grain = this.grainRepository.create({
    ...createGrainDto,
    total_income,
    total_expenses,
    total_gross,
    cropping_year: createGrainDto.cropping_year,
  });

  return this.grainRepository.save(grain);
}

// async findAll(
//   start_date?: string,
//   end_date?: string,
//   status?: string,
//   cropping?: number,
//   cropping_year?: number
// ): Promise<Grain[]> {
//   let where: any = {};

//   // ✅ Status filter
//   if (status) {
//     where.status = status;
//   }

//   // ✅ Cropping filter logic
//   if (cropping == 1 || cropping == 2) {
//     where.cropping = Number(cropping);
//   } else if (cropping === 3 || cropping === undefined) {
//     if (start_date || end_date) {
//       const start = new Date(start_date);
//       const end = end_date ? new Date(end_date) : new Date(start_date);
//       end.setUTCHours(23, 59, 59, 999);

//       where.createdAt = {
//         $gte: start,
//         $lte: end,
//       };
//     }
//   }

//   // ✅ Cropping year filter
//   if (cropping_year) {
//     where.cropping_year = Number(cropping_year);
//   }

//   return this.grainRepository.find({ where });
// }

async findAll(
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

  // ✅ Get MongoDB collection from TypeORM repository
  const mongoRepo = this.grainRepository.manager.connection.getMongoRepository(Grain);
  //@ts-ignore
  const collection = mongoRepo.collection;

  // ✅ Use MongoDB aggregation for totals
  const pipeline = [
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

  const [totalsResult] = await collection.aggregate(pipeline).toArray();

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

  // ✅ Fetch filtered data separately
  const data = await this.grainRepository.find({ where });

  return { data, totals };
}




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

  async update(id: string, updateGrainDto: UpdateGrainDto): Promise<Grain> {
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
      grain.total_income = grain.total_kilos * grain.price_per_kilo;
    }

    // ✅ Always recalc total_expenses
    grain.total_expenses =
      grain.expenses?.reduce((sum, exp) => sum + exp.amount, 0) ?? 0;

    // ✅ Always recalc total_profit
    grain.total_gross = grain.total_income + grain.total_expenses;

    return this.grainRepository.save(grain);
  }

  async remove(id: string): Promise<void> {
    let objectId: ObjectId;
    try {
      objectId = new ObjectId(id);
    } catch (e) {
      throw new NotFoundException(`Invalid ID format: ${id}`);
    }

    const result = await this.grainRepository.delete(objectId);

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
    total_income: grains.reduce((sum, g) => sum + (g.total_income || 0), 0),
    total_expenses: grains.reduce((sum, g) => sum + (g.total_expenses || 0), 0),
    total_gross: grains.reduce((sum, g) => sum + (g.total_gross || 0), 0),
    total_kilos: grains.reduce((sum, g) => sum + (g.total_kilos || 0), 0),
    price_per_kilo: grains.reduce((sum, g) => sum + (g.price_per_kilo || 0), 0),
 
  };

  return { grains, summary };
}


}
