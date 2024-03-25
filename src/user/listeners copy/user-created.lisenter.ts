import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PointsService } from 'src/points/points.service';
import { CreatePointsDto } from 'src/points/dto/points.dto';
import { UserCreatedEvent } from '../../events/user-created.event';
import { EventType } from 'src/events/enum/event-type.enum';

@Injectable()
export class UserCreatedListener {
  constructor(@Inject(PointsService) private userPointsService) {}

  @OnEvent(EventType.USER_CREATED)
  handleUserCreatedEvent(payload: UserCreatedEvent) {
    console.log('Handle and process UserCreatedEvent event', payload);
    const createPointsDto: CreatePointsDto = {
      userId: payload.id,
      count: 500,
    };
    this.userPointsService.createUserPoints(createPointsDto);
  }
}
