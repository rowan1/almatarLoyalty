import { Injectable } from '@nestjs/common';
import { CustomLogger } from '../logger/logger.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TransactionService } from 'src/transaction/transaction.service';

@Injectable()
export class TransactionScheduler {
  constructor(
    private logger: CustomLogger,
    private transactionService: TransactionService,
  ) {
    this.logger.setContext(TransactionScheduler.name);
  }

  @Cron(CronExpression.EVERY_MINUTE)
  handleExpiredTransactionCron() {
    this.logger.log('TransactionScheduler Called every minute');
    this.transactionService.updateExpiredTransaction();
  }
}
