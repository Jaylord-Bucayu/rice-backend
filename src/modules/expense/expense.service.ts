// src/expenses/expenses.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense } from './entities/expense.entity';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepo: Repository<Expense>,
  ) {}

  create(dto: CreateExpenseDto) {
    const expense = this.expenseRepo.create(dto);
    return this.expenseRepo.save(expense);
  }

  findAll() {
    return this.expenseRepo.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    //@ts-ignore
    const expense = await this.expenseRepo.findOne({ where: { id } });
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
