import { Injectable } from '@nestjs/common';
import { CustomLogger } from '../logger/logger.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TransactionService } from 'src/transaction/transaction.service';

@Injectable()
export class TaskService {
  constructor(
    private logger: CustomLogger,
    private transactionService: TransactionService,
  ) {
    this.logger.setContext(TaskService.name);
  }

  @Cron(CronExpression.EVERY_MINUTE)
  handleExpiredTransactionCron() {
    this.logger.log('Called every minute');
    this.transactionService.updateExpiredTransaction();
  }
}
