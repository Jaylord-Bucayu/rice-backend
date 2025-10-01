import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Truck } from './entities/truck.entity';
import { CreateTruckDto } from './dto/create-truck.dto';
import { UpdateTruckDto } from './dto/update-truck.dto';
import { ObjectId } from 'mongodb';

@Injectable()
export class TrucksService {
constructor(
@InjectRepository(Truck)
private readonly truckRepository: Repository<Truck>,
) {}

async create(createTruckDto: CreateTruckDto): Promise<Truck> {
const truck = this.truckRepository.create(createTruckDto);
return await this.truckRepository.save(truck);
}

async findAll(): Promise<Truck[]> {
return await this.truckRepository.find();
}

async findOne(id: string): Promise<Truck> {
let objectId: ObjectId;
try {
objectId = new ObjectId(id);
} catch (e) {
throw new NotFoundException(`Invalid ID format: ${id}`);
}


const truck = await this.truckRepository.findOne({
  // @ts-ignore
  where: { _id: objectId },
});

if (!truck) {
  throw new NotFoundException(`Truck with ID ${id} not found`);
}

return truck;


}

async update(id: string, updateTruckDto: UpdateTruckDto): Promise<Truck> {
const truck = await this.findOne(id);
Object.assign(truck, updateTruckDto);
return await this.truckRepository.save(truck);
}

async remove(id: string): Promise<void> {
let objectId: ObjectId;
try {
objectId = new ObjectId(id);
} catch (e) {
throw new NotFoundException(`Invalid ID format: ${id}`);
}


const result = await this.truckRepository.delete(objectId);
if (result.affected === 0) {
  throw new NotFoundException(`Truck with ID ${id} not found`);
}


}
}
