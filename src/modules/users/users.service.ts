import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, FindManyOptions, Like, ObjectId, Repository } from 'typeorm';
import { classToPlain } from 'class-transformer';
import { GetUsersFilterDto } from './dto/filter-user.dto';
import * as bcrypt from 'bcrypt';
import { Types } from 'mongoose';


@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private readonly itemRepository: Repository<User>,
    // private readonly entityManager: EntityManager,
  ) { }

  async create(createUserDto: CreateUserDto) {


    const existingUser = await this.findOneEmail(createUserDto.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const newUser = new User({ ...createUserDto });
    await this.itemRepository.save(newUser);
    return newUser;
  }
  async findAll(filterDto: GetUsersFilterDto): Promise<any> {
    const { search, role, page, per_page, sort, from, to, firstname, middlename, lastname, email } = filterDto;

    let query: any = {};

    if (search) {
      query.$or = [
        { firstname: { $regex: new RegExp(search, 'i') } },
        { middlename: { $regex: new RegExp(search, 'i') } },
        { lastname: { $regex: new RegExp(search, 'i') } },
        { email: { $regex: new RegExp(search, 'i') } },
      ];
    }

    if (from || to) {
      query.createdAt = {};
      if (from) {
        query.createdAt.$gte = new Date(from);
      }
      if (to) {
        query.createdAt.$lte = new Date(to);
      }
    }

    if (role) {
      query.role = { $regex: new RegExp(role, 'i') };
    }

    if (firstname) {
      query.firstname = { $regex: new RegExp(firstname, 'i') };
    }

    if (middlename) {
      query.middlename = { $regex: new RegExp(middlename, 'i') };
    }

    if (lastname) {
      query.lastname = { $regex: new RegExp(lastname, 'i') };
    }

    if (email) {
      query.email = { $regex: new RegExp(email, 'i') };
    }

    // Pagination
    const pageSize = parseInt(per_page, 10) || 10; // Default to 10 items per page if not provided
    const currentPage = parseInt(page, 10) || 1;

    const [users, total] = await this.itemRepository.findAndCount({
      where: query,
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
      order: sort ? { [sort.split('.')[0]]: sort.split('.')[1].toUpperCase() } : { createdAt: 'DESC' }, // Default sorting by createdAt descending
    });

    return {
      data: users,
      total,
      page: currentPage,
      per_page: pageSize,
      total_pages: Math.ceil(total / pageSize),
    };
  }
  async findOne(id: any): Promise<any> {
    const user = await this.itemRepository.findOneBy(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return classToPlain(user);
  }

  async findOneEmail(email: string) {

    return await this.itemRepository.findOne({
      where: { email }
    });
  }

async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
  // ✅ Try to find the user by the given ID
  //@ts-ignore
  const user = await this.itemRepository.findOne({ where: { id } });

  if (!user) {
    throw new NotFoundException(`User not found for ID: ${id}`);
  }

  // ✅ Merge and save
  const updatedUser = this.itemRepository.merge(user, updateUserDto);
  return await this.itemRepository.save(updatedUser);
}


  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async updateUserPassword(userId: string, hashedPassword: string) {
    await this.itemRepository.update(userId, { password: hashedPassword });
    return 'Reset password successfully'
  }

  // ✅ Update user
  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    //@ts-ignore
    const user = await this.itemRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, updateUserDto);
    return await this.itemRepository.save(user);
  }

  async currentUser(user: any) {
    return await this.itemRepository.findOneBy({ email: user.email });
  }

  async currentUserChangePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    //@ts-ignore
    const user = await this.itemRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) throw new BadRequestException('Current password is incorrect');

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;

    await this.itemRepository.save(user);

    return { message: 'Password successfully changed' };
  }

}
