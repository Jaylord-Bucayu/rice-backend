import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Put,
  UnauthorizedException,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AbilityFactory, Action } from '../ability/ability.factory';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { ForbiddenError } from '@casl/ability';
import { User } from './entities/user.entity';
import { Request } from 'express';
import { AbilitiesGuard } from 'src/common/guards/abilities.guard';
import { CheckAbilities } from 'src/common/decorators/ability.decorator';
import { SignInUser } from './dto/signIn-user.dto';
import { SortDto } from './dto/sort-user.dto';
import { GetUsersFilterDto } from './dto/filter-user.dto';
import * as bcrypt from 'bcrypt';

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Put,
  UnauthorizedException,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AbilityFactory, Action } from '../ability/ability.factory';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { ForbiddenError } from '@casl/ability';
import { User } from './entities/user.entity';
import { Request } from 'express';
import { AbilitiesGuard } from 'src/common/guards/abilities.guard';
import { CheckAbilities } from 'src/common/decorators/ability.decorator';
import { SignInUser } from './dto/signIn-user.dto';
import { SortDto } from './dto/sort-user.dto';
import { GetUsersFilterDto } from './dto/filter-user.dto';
import * as bcrypt from 'bcrypt';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private abilityFactory: AbilityFactory,
  ) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(JwtGuard, AbilitiesGuard)
  @CheckAbilities({ action: Action.Read, subject: User })
  async findAll(@Query() filterDto: GetUsersFilterDto): Promise<any> {
    return this.usersService.findAll(filterDto);
  }

  @Get(':id')
  @UseGuards(JwtGuard, AbilitiesGuard)
  @CheckAbilities({ action: Action.Read, subject: User })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtGuard)
  // @CheckAbilities({ action: Action.Update, subject: User })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }
 

  @UseGuards(JwtGuard)
  @Put('profile')
  async updateProfile(@Req() req:SignInUser, @Body() updateUserDto: UpdateUserDto) {
    const userId = req.user.id;
    return this.usersService.updateUser(userId, updateUserDto);
  }
  

  @Patch(':id/reset-password')
async resetPassword(@Param('id') id: string) {
  const hashed = await bcrypt.hash('default123', 10); // or generate random
  return this.usersService.updateUserPassword(id, hashed);
}

@UseGuards(JwtGuard)
@Put('/auth/profile/change-password')
async currentUserChangePassword(
  @Req() req: any,
  @Body() body: { currentPassword: string; newPassword: string },
) {
  const userId = req.user.id;
  console.log({userId})
  return this.usersService.currentUserChangePassword(
    userId,
    body.currentPassword,
    body.newPassword,
  );
}


  @Delete(':id')
  @UseGuards(JwtGuard, AbilitiesGuard)
  // @CheckAbilities({ action: Action.Delete, subject: User })
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  @Post('profile')
  @UseGuards(JwtGuard, AbilitiesGuard)
  async currentUser(@Req() req:any){
    const user = req.user;

    if(!user){
      return UnauthorizedException;
    }
    return this.usersService.currentUser(user);
  }

}
