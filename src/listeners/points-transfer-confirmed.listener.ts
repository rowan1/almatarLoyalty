import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EventType } from 'src/events/enum/event-type.enum';
import { PointsTransferConfirmedEvent } from 'src/events/points-transfer-confirmed.event';
import { PointsService } from 'src/points/points.service';

@Injectable()
export class PointsTransferConfirmedListener {
  constructor(@Inject(PointsService) private pointsService) {}

  @OnEvent(EventType.POINTS_TRANSFER_CONFIRMED)
  handleUserCreatedEvent(payload: PointsTransferConfirmedEvent) {
    console.log('Handle and process PointsTransferConfirmed event, ', payload);
    this.pointsService.confirmTransferPoints(payload.userId, payload.amount);
  }
}
