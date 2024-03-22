import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PointsService } from 'src/points/points.service';
import { CreatePointsDto } from 'src/points/dto/points.dto';
import { EventType } from './event-type.enum';
import User from '../user.entity';
import { UserCreatedEvent } from '../events/user-created.event';

// @Injectable()
// export class UserCreatedListener {
//   constructor(@Inject(PointsService) private userPointsService) {}

//   @OnEvent(EventType.USER_CREATED, { async: true })
//   async handleUserCreatedEvent(payload: User) {
//     console.log('User created event listener.');
//     const createPointsDto: CreatePointsDto = {
//       userId: payload.id,
//       count: 500,
//     };
//     this.userPointsService.createUserPoints(createPointsDto);
//   }
// }
@Injectable()
export class UserCreatedListener {
  constructor(@Inject(PointsService) private userPointsService) {}

  @OnEvent(EventType.USER_CREATED)
  handleUserCreatedEvent(payload: UserCreatedEvent) {
    console.log('handle and process UserCreatedEvent event');
    console.log(payload);
    const createPointsDto: CreatePointsDto = {
      userId: payload.id,
      count: 500,
    };
    this.userPointsService.createUserPoints(createPointsDto);
  }
}
