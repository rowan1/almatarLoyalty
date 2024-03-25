import { IsNotEmpty } from 'class-validator';

export class CreatePointsDto {
  @IsNotEmpty()
  userId: number;

  @IsNotEmpty()
  count: number;
}
