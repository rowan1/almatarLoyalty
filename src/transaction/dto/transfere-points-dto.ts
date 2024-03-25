import { IsNotEmpty } from 'class-validator';

export class TransferePointsDto {
  @IsNotEmpty()
  userId: number;

  @IsNotEmpty()
  amount: number;
}
