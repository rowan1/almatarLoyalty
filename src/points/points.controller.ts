import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guard/jwt.auth.guard';
import { User } from 'src/user/user.decorator';
import { PointsService } from './points.service';
import { TransferePointsDto } from 'src/transaction/dto/transfere-points-dto';

@Controller('points')
@UseGuards(JwtAuthGuard)
export class PointsController {
  constructor(private readonly pointsService: PointsService) {}
  @Get()
  async getByUserId(@User() user) {
    const points = await this.pointsService.getPointsByUserId(user.id);
    return points;
  }

  @Post('/transfer')
  async transferePoints(
    @User() user,
    @Body() transfereDto: TransferePointsDto,
  ) {
    const transaction = await this.pointsService.transferPoints(
      user.id,
      transfereDto,
    );
    return transaction;
  }
}
