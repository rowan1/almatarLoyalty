import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import Points from './points.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePointsDto } from './dto/points.dto';
import { TransferePointsDto } from 'src/transaction/dto/transfere-points-dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventType } from 'src/events/enum/event-type.enum';
import { PointsTransferedEvent } from 'src/events/transfere-points.event';

@Injectable()
export class PointsService {
  constructor(
    @InjectRepository(Points)
    private pointsRepository: Repository<Points>,
    private eventEmitter: EventEmitter2,
  ) {}

  async getAllPoints() {
    console.log('Fetching all points.');
    return this.pointsRepository.find();
  }

  async getPointsById(id: number) {
    const points = await this.findOnePoint({ id });
    if (points) {
      return points;
    }
    throw new NotFoundException('Could not find points with this ID');
  }

  async getPointsByUserId(userId: number) {
    const points = await this.findOnePoint({ userId });
    if (points) {
      return points;
    }
    throw new NotFoundException('Could not find points for this user');
  }

  async createUserPoints(createPointsDto: CreatePointsDto) {
    console.log('Creating user points.');
    return this.pointsRepository.save(createPointsDto);
  }

  async deleteById(id: number) {
    const points = await this.findOnePoint({ id });
    if (!points) {
      throw new NotFoundException('Could not find points with this ID');
    }
    await this.pointsRepository.remove(points);
    return points;
  }

  async transferPoints(authorId: number, transfereDto: TransferePointsDto) {
    console.log(
      `Transferring ${transfereDto.amount} points from user ID ${authorId} to user ID ${transfereDto.userId}`,
    );
    const authorPoints = await this.findUserPoints(authorId);
    this.validateUserPoints(authorPoints, transfereDto.amount);

    authorPoints.count -= transfereDto.amount;
    await this.pointsRepository.save(authorPoints);

    const pointsTransferedEvent = new PointsTransferedEvent();
    pointsTransferedEvent.userId = transfereDto.userId;
    pointsTransferedEvent.authorId = authorId;
    pointsTransferedEvent.amount = transfereDto.amount;

    this.eventEmitter.emit(EventType.POINTS_TRANSFERED, pointsTransferedEvent);

    return authorPoints;
  }

  async confirmTransferPoints(userId: number, amount: number) {
    const points = await this.findUserPoints(userId);
    if (!points) {
      console.log(
        `No points found for user ${userId}. Creating new points with amount: ${amount}`,
      );
      const createPointsDto = new CreatePointsDto();
      createPointsDto.count = amount;
      createPointsDto.userId = userId;
      return this.createUserPoints(createPointsDto);
    }
    points.count += amount;
    return this.pointsRepository.save(points);
  }

  private async findOnePoint(where: any) {
    return this.pointsRepository.findOne({ where });
  }

  private async findUserPoints(userId: number) {
    return this.findOnePoint({ userId });
  }

  private validateUserPoints(points: Points, amount: number) {
    if (!points) {
      throw new NotFoundException('Cannot find user points.');
    }
    if (points.count < amount) {
      throw new BadRequestException('Insufficient points for transfer.');
    }
  }
}
