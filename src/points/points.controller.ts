import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guard/jwt.auth.guard';
import { User } from 'src/user/user.decorator';
import { PointsService } from './points.service';
import { TransferePointsDto } from 'src/transaction/dto/transfere-points-dto';

@Controller('points')
@UseGuards(JwtAuthGuard)
export class PointsController {
  constructor(private readonly pointsService: PointsService) {}
  @Get()
  async getPoints() {
    const points = await this.pointsService.getAllPoints();
    return points;
  }

  @Get('users/:id')
  async getByUserId(@User() user, @Param('id') userId: number) {
    this.ensureUserAccess(user, userId);
    const points = await this.pointsService.getPointsByUserId(user.id);
    return points;
  }

  @Post('transfer')
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
  private ensureUserAccess(user: any, userId: number): void {
    if (!user || user.id != userId) {
      throw new UnauthorizedException('Cannot access this resource');
    }
  }
}
