import { Injectable, NotFoundException } from '@nestjs/common';
import Points from './points.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePointsDto } from './dto/points.dto';

@Injectable()
export class PointsService {
  constructor(
    @InjectRepository(Points)
    private pointsRepository: Repository<Points>,
  ) {}

  async getAllPoints() {
    console.log('Get all points!!!!');
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
    console.log('Create user points!');
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
}
