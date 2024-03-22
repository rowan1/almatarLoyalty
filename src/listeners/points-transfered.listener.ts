import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EventType } from 'src/events/enum/event-type.enum';
import { PointsTransferedEvent } from 'src/events/transfere-points.event';
import { CreateTransactionDto } from 'src/points/dto/transaction.dto';
import { TransactionService } from 'src/transaction/transaction.service';

@Injectable()
export class PointsTransferedListener {
  constructor(@Inject(TransactionService) private transactionService) {}

  @OnEvent(EventType.POINTS_TRANSFERED)
  handleUserCreatedEvent(payload: PointsTransferedEvent) {
    console.log('Handle and process PointsTransfered event, ', payload);
    const createTransactionDto: CreateTransactionDto = {
      userId: payload.userId,
      amount: payload.amount,
      authorId: payload.authorId,
    };
    this.transactionService.create(createTransactionDto);
  }
}
