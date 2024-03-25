import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import User from '../user/user.entity';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserCreatedEvent } from 'src/events/user-created.event';
import { EventType } from 'src/events/enum/event-type.enum';
import { CustomLogger } from 'src/service/logger/logger.service';
import { TokenResponseDto } from './dto/token.response.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private eventEmitter: EventEmitter2,
    private logger: CustomLogger,
  ) {
    this.logger.setContext(AuthService.name);
  }

  async signUp(signUpDto: SignUpDto): Promise<TokenResponseDto> {
    const { name, email, password } = signUpDto;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.usersRepository.create({
      name,
      email,
      password: hashedPassword,
    });

    await this.usersRepository.save(user);

    this.logger.log('New user has been created!');
    this.emitUserCreatedEvent(user);

    const token = this.generateToken(user.id);

    return { id: user.id, name: user.name, token };
  }

  async login(loginDto: LoginDto): Promise<TokenResponseDto> {
    const { email, password } = loginDto;

    const user = await this.usersRepository.findOne({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = this.generateToken(user.id);

    return { id: user.id, name: user.name, token };
  }

  private emitUserCreatedEvent(user: User): void {
    const userCreatedEvent = new UserCreatedEvent();
    userCreatedEvent.name = user.name;
    userCreatedEvent.id = user.id;
    this.eventEmitter.emit(EventType.USER_CREATED, userCreatedEvent);
  }

  private generateToken(userId: number): string {
    return this.jwtService.sign({ id: userId });
  }
}
