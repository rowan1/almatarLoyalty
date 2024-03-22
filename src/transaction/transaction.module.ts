import { Module } from '@nestjs/common';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { PointsTransferedListener } from 'src/listeners/points-transfered.listener';
import { TypeOrmModule } from '@nestjs/typeorm';
import Transaction from './transaction.entity';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction]), PassportModule],
  controllers: [TransactionController],
  providers: [TransactionService, PointsTransferedListener],
})
export class TransactionModule {}
