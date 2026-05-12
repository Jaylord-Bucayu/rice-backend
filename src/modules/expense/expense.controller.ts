// src/expenses/expenses.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UnauthorizedException } from '@nestjs/common';

import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ExpensesService } from './expense.service';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { SignInUser } from '../users/dto/signIn-user.dto';

@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) { }

  @Post()
  @UseGuards(JwtGuard)
  create(@Body() dto: CreateExpenseDto, @Req() req: SignInUser) {
    const user = req.user;
    if (!req.user) {
      throw new UnauthorizedException('Unauthorized');
    }

    return this.expensesService.create(dto, user);
  }

  @Get()
  findAll() {
    return this.expensesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.expensesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateExpenseDto,
  ) {
    return this.expensesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.expensesService.remove(id);
  }
}
