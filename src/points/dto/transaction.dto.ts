import { IsNotEmpty } from 'class-validator';

export class CreateTransactionDto {
  @IsNotEmpty()
  userId: number;

  @IsNotEmpty()
  authorId: number;

  @IsNotEmpty()
  amount: number;
}
