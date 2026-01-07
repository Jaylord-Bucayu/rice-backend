import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { User } from '../users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { ValidateteUserDto } from '../users/dto/validate-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { SignInUser } from '../users/dto/signIn-user.dto';
import { jwtConstants } from 'src/common/constants/constants';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private usersService: UsersService,
    private jwtService: JwtService,
    private readonly auditLogsService: AuditLogsService,

    private readonly entityManager: EntityManager,
  ) {}

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }

  async comparePasswords(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  async validateGoogle(details: ValidateteUserDto) {
    const user = await this.userRepository.findOneBy({ email: details.email });
    if (user) return user;
    const newUser = this.userRepository.create(details);
    return this.userRepository.save(newUser);
  }

  async validateUser(payload: ValidateteUserDto): Promise<any> {
    const user: any = await this.userRepository.findOne({
      where: { email: payload.email },
    });
    if (
      user &&
      (await this.comparePasswords(payload.password, user.password))
    ) {
      const { ...result } = user;
      return result;
    }
    return false;
    // TODO: Generate a JWT and return it here
    // instead of the user object
  }

  async login(loginDto: LoginDto) {
    const validUser = await this.validateUser(loginDto);
    if (!validUser) {
      throw new UnauthorizedException('Invalid credentials');
    }

    
    const payload = {
      id: validUser.id,
      email: validUser.email,
      sub: validUser.id,
      role: validUser.role,
    };
    const refreshToken =  this.jwtService.sign(payload , {expiresIn:'7d'})
    this.userRepository.update(validUser.id,{token:refreshToken})
    
  // ✅ AUDIT LOG — SUCCESSFUL LOGIN
  await this.auditLogsService.logAction(
    'LOGIN_SUCCESS',
    'User',
    validUser.id,
    {
      email: validUser.email,
      role: validUser.role,
    },
    {
      id: validUser.id,
      username: validUser.email, // or username field if you have one
    },
  );
  
     return {
      current_user:{
        "id": validUser.id,
        "token":  validUser.token,
        "firstname":  validUser.firstname,
        "lastname":  validUser.lastname,
        "email":  validUser.email,
        "role":  validUser.role
      },
      access_token: this.jwtService.sign(payload),
      refresh_token:refreshToken
    };
  }

  async register(user: RegisterDto) {
    const existingUser = await this.usersService.findOneEmail(user.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(user.password, 10);

    const newUser = this.userRepository.create({
      firstname: user.firstname,
      role: user.role || 'USER',
      email: user.email,
      lastname: user.lastname,
      password: hashedPassword,
      token : ""
     
    });

    await this.userRepository.save(newUser);

    return newUser;
  }

  async refreshToken(signInUser:any){

     const {id,email,role} = signInUser;
         //validate user
    const user = await this.userRepository.findOneBy(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const decoded = this.jwtService.verify(user.token, {  secret: jwtConstants.secret, });

    const payload = {
      id,
      email,
      sub:decoded.sub,
      role,
    };
    return {
       access_token: this.jwtService.sign(payload)
    };
  }

  async changePassword(id: any, body: ChangePasswordDto) {
    // Fetch the user by ID
    const user = await this.userRepository.findOneBy(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if the current password matches
    const isPasswordValid = await this.comparePasswords(
      body.currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash the new password
    const hashedPassword = await this.hashPassword(body.newPassword);

    // Update the user's password in the database
    return this.userRepository.update(user.id, { password: hashedPassword });
  }

  async logout(userId: number, res: any) {
  // Invalidate the stored token in the database
  await this.userRepository.update(userId, { token: '' });

  // Clear the cookies (if you're using cookies)
  res.clearCookie('access_token', { sameSite: 'strict', secure: true });
  res.clearCookie('refresh_token', { sameSite: 'strict', secure: true });

  return { message: 'Logout successful' };
}

}
