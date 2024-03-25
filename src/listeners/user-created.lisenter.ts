import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PointsService } from 'src/points/points.service';
import { CreatePointsDto } from 'src/points/dto/points.dto';
import { EventType } from '../events/enum/event-type.enum';
import { UserCreatedEvent } from '../events/user-created.event';

@Injectable()
export class UserCreatedListener {
  constructor(@Inject(PointsService) private userPointsService) {}

  @OnEvent(EventType.USER_CREATED)
  handleUserCreatedEvent(payload: UserCreatedEvent) {
    console.log('Handle and process UserCreatedEvent event');
    console.log(payload);
    const createPointsDto: CreatePointsDto = {
      userId: payload.id,
      count: 500, //add to to config file
    };
    this.userPointsService.createUserPoints(createPointsDto);
  }
}
