import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import Transaction from './transaction.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTransactionDto } from 'src/points/dto/transaction.dto';
import { TransactionStatus } from './enum/transaction-status.enum';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventType } from 'src/events/enum/event-type.enum';
import { PointsTransferConfirmedEvent } from 'src/events/points-transfer-confirmed.event';
import { CustomLogger } from 'src/service/logger/logger.service';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private eventEmitter: EventEmitter2,
    private logger: CustomLogger,
  ) {
    this.logger.setContext(TransactionService.name);
  }

  async create(createTransactionDto: CreateTransactionDto) {
    const newTransaction = await this.transactionRepository.create(
      createTransactionDto,
    );
    await this.transactionRepository.save({
      userId: createTransactionDto.userId,
      authorId: createTransactionDto.authorId,
      amount: createTransactionDto.amount,
      created_at: new Date(),
    });
    return newTransaction;
  }

  async confirmTransfer(userId: number, transactionId: number) {
    const transaction = await this.transactionRepository.findOne({
      where: {
        id: transactionId,
        userId: userId,
      },
    });
    if (!transaction)
      throw new NotFoundException('Could not find the transaction');
    if (transaction.status != TransactionStatus.PENDING)
      throw new BadRequestException('Transition cannot be done at this state!');
    if (this.isExpired(transaction)) {
      transaction.status = TransactionStatus.EXPIRED;
      this.transactionRepository.save(transaction);
      throw new BadRequestException('Transition expired!');
    }
    transaction.status = TransactionStatus.CONFIRMED;
    await this.transactionRepository.save(transaction);

    this.sendPointTransferedConfirmedEvent(transaction);
    return transaction;
  }

  async getAllTransactions() {
    return this.transactionRepository.find();
  }

  async getAuthorTransactions(authorId: number) {
    return this.transactionRepository.find({ where: { authorId: authorId } });
  }

  private sendPointTransferedConfirmedEvent(transaction: Transaction) {
    const pointsTransferConfirmed = new PointsTransferConfirmedEvent();
    pointsTransferConfirmed.amount = transaction.amount;
    pointsTransferConfirmed.userId = transaction.userId;

    this.eventEmitter.emit(
      EventType.POINTS_TRANSFER_CONFIRMED,
      pointsTransferConfirmed,
    );
  }

  private isExpired(transaction: Transaction): boolean {
    let expiryDate = transaction.created_at;
    const nowDate = new Date();
    this.logger.log(
      `Transaction of ID ${transaction.id} created at ${transaction.created_at}`,
    );
    expiryDate.setMinutes(expiryDate.getMinutes() + 10);
    expiryDate = new Date(expiryDate);
    this.logger.log(
      `Transaction of ID ${transaction.id} expires at ${expiryDate}`,
    );
    const isExpired = nowDate.getTime() >= expiryDate.getTime();
    this.logger.log(
      `Transaction of ID ${transaction.id}. Is expired? ${isExpired}`,
    );
    return isExpired;
  }

  async updateExpiredTransaction() {
    const transactions = await this.transactionRepository.find({
      where: { status: TransactionStatus.PENDING },
    });
    const expiredTransactions: Transaction[] = [];
    transactions.forEach((transaction) => {
      if (this.isExpired(transaction)) {
        transaction.status = TransactionStatus.EXPIRED;
        expiredTransactions.push(transaction);
      }
    });
    this.transactionRepository.save(transactions);
  }
}
