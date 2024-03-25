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
    const newTransaction = await this.transactionRepository.save({
      userId: createTransactionDto.userId,
      authorId: createTransactionDto.authorId,
      amount: createTransactionDto.amount,
      created_at: new Date(),
    });
    return newTransaction;
  }

  async confirmTransfer(userId: number, transactionId: number) {
    this.logger.log(
      `User ${userId} sent confirm transfer request for transaction ${transactionId}`,
    );
    const transaction = await this.getTransaction(userId, transactionId);
    this.validateTransaction(transaction);
    this.checkAndHandleExpiry(transaction);

    transaction.status = TransactionStatus.CONFIRMED;
    await this.transactionRepository.save(transaction);

    this.sendPointTransferedConfirmedEvent(transaction);
    return transaction;
  }

  async getAllTransactions() {
    return this.transactionRepository.find();
  }

  async getAuthorTransactions(authorId: number) {
    return this.transactionRepository.find({ where: { authorId } });
  }

  private async getTransaction(userId: number, transactionId: number) {
    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId, userId },
    });
    if (!transaction) {
      throw new NotFoundException('Could not find the transaction');
    }
    return transaction;
  }

  private validateTransaction(transaction: Transaction) {
    if (transaction.status !== TransactionStatus.PENDING) {
      throw new BadRequestException('Transition cannot be done at this state!');
    }
  }

  private checkAndHandleExpiry(transaction: Transaction) {
    if (this.isExpired(transaction)) {
      transaction.status = TransactionStatus.EXPIRED;
      throw new BadRequestException('Transition expired!');
    }
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
    const expiryDate = new Date(transaction.created_at);
    expiryDate.setMinutes(expiryDate.getMinutes() + 10);

    this.logger.log(
      `Transaction ID ${transaction.id} created at ${transaction.created_at}`,
    );
    this.logger.log(
      `Transaction ID ${transaction.id} expires at ${expiryDate}`,
    );

    return Date.now() >= expiryDate.getTime();
  }

  async updateExpiredTransaction() {
    const pendingTransactions = await this.findPendingTransactions();
    const expiredTransactions = pendingTransactions.filter((transaction) =>
      this.isExpired(transaction),
    );

    if (expiredTransactions.length > 0) {
      expiredTransactions.forEach((transaction) => {
        transaction.status = TransactionStatus.EXPIRED;
      });

      await this.transactionRepository.save(expiredTransactions);
    }
  }

  private async findPendingTransactions(): Promise<Transaction[]> {
    return this.transactionRepository.find({
      where: { status: TransactionStatus.PENDING },
    });
  }
}
