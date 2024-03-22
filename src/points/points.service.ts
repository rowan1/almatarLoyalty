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
    console.log('Get all points.');
    const users = this.pointsRepository.find();
    return users;
  }

  async getPointsById(id: number) {
    const points = await this.pointsRepository.findOne({
      where: {
        id: id,
      },
    });
    if (points) {
      return points;
    }
    throw new NotFoundException('Could not find point for this id');
  }

  async getPointsByUserId(userId: number) {
    const points = await this.pointsRepository.findOne({
      where: {
        userId: userId,
      },
    });
    if (points) {
      return points;
    }
    throw new NotFoundException('Could not find the points for this user');
  }

  async createUserPoints(createPointsDto: CreatePointsDto) {
    const newUserPoints = await this.pointsRepository.create(createPointsDto);
    console.log('Create user points.');
    await this.pointsRepository.save({
      count: createPointsDto.count,
      userId: createPointsDto.userId,
    });
    return newUserPoints;
  }

  async deleteById(id: number) {
    const points = await this.pointsRepository.findOne({
      where: {
        id: id,
      },
    });
    if (!points) {
      throw new NotFoundException('Could not find point for this id');
    }

    await this.pointsRepository.remove(points);
    return points;
  }
  async transferPoints(authorId: number, transfereDto: TransferePointsDto) {
    console.log(
      `Transfere Points ${transfereDto.amount} from user ID ${authorId} to user ID ${transfereDto.userId}`,
    );
    const points = await this.pointsRepository.findOne({
      where: {
        userId: authorId,
      },
    });
    if (!points) throw new NotFoundException('Cannot find user points.');
    if (points.count < transfereDto.amount)
      throw new BadRequestException('You cannot transefer this amount.');

    points.count = points.count - transfereDto.amount;
    await this.pointsRepository.save(points);

    const pointsTransferedEvent = new PointsTransferedEvent();
    pointsTransferedEvent.userId = transfereDto.userId;
    pointsTransferedEvent.authorId = authorId;
    pointsTransferedEvent.amount = transfereDto.amount;

    this.eventEmitter.emit(EventType.POINTS_TRANSFERED, pointsTransferedEvent);

    return points;
  }

  async confirmTransferPoints(userId: number, amount: number) {
    const points = await this.pointsRepository.findOne({
      where: {
        userId: userId,
      },
    });
    if (!points) {
      console.log(
        `No points found. Creating new Points for user ${userId} with amount: ${amount}`,
      );
      const createPointsDto = new CreatePointsDto();
      createPointsDto.count = amount;
      createPointsDto.userId = userId;
      return await this.createUserPoints(createPointsDto);
    }
    points.count = points.count + amount;
    return await this.pointsRepository.save(points);
  }
}
