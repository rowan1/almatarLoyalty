import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { User } from 'src/user/user.decorator';
import { TransactionService } from './transaction.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt.auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post(':id/confirm')
  async confirmTransferPoints(@User() user, @Param('id') id: number) {
    const transaction = await this.transactionService.confirmTransfer(
      user.id,
      id,
    );
    return transaction;
  }
  @Get()
  async getTransactions() {
    return await this.transactionService.getAllTransactions();
  }
  @Get('users/:id')
  async getAuthorTransactions(@Param('id') authorId: number) {
    return await this.transactionService.getAuthorTransactions(authorId);
  }
}
