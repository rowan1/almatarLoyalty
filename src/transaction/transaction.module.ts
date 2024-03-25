import { Module } from '@nestjs/common';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { PointsTransferedListener } from 'src/listeners/points-transfered.listener';
import { TypeOrmModule } from '@nestjs/typeorm';
import Transaction from './transaction.entity';
import { PassportModule } from '@nestjs/passport';
import { CustomLogger } from 'src/service/logger/logger.service';
import { TransactionScheduler } from 'src/service/task/transaction.service';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction]), PassportModule],
  controllers: [TransactionController],
  providers: [
    TransactionService,
    PointsTransferedListener,
    CustomLogger,
    TransactionScheduler,
  ],
})
export class TransactionModule {}
