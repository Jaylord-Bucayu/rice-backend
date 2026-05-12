// src/expenses/expenses.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { Expense } from './entities/expense.entity';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { AuditLogsService } from '../audit-logs/audit-logs.service';


@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepo: Repository<Expense>,
    private readonly auditLogsService: AuditLogsService,
  ) { }

 async create(dto: CreateExpenseDto, user: any) {
  const expense = this.expenseRepo.create(dto);

  const savedExpense = await this.expenseRepo.save(expense);

  // ✅ AUDIT LOG — CREATE EXPENSE
  await this.auditLogsService.logAction(
    'CREATE_EXPENSE',
    'Expense',
    //@ts-ignore
    savedExpense.id, // ✅ ENTITY ID
    {
      amount: dto.amount,
      remarks: dto.remarks,
    },
    {
      id: user.id,
      username: user.email,
    },
  );

  return savedExpense;
}


  findAll() {
    return this.expenseRepo.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {

    let objectId: ObjectId;

    try {
      objectId = new ObjectId(id);
    } catch (e) {
      throw new NotFoundException(`Invalid ID format: ${id}`);
    }

    //@ts-ignore
    const expense = await this.expenseRepo.findOne({ where: { _id: objectId } });
    if (!expense) throw new NotFoundException('Expense not found');
    return expense;
  }

  async update(id: string, dto: UpdateExpenseDto) {
    const expense = await this.findOne(id);
    Object.assign(expense, dto);
    return this.expenseRepo.save(expense);
  }

  async remove(id: string) {
    const expense = await this.findOne(id);
    await this.expenseRepo.remove(expense);
    return { message: 'Expense deleted successfully' };
  }
}
