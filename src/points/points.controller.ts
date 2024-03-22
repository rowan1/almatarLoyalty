import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guard/jwt.auth.guard';
import { User } from 'src/user/user.decorator';
import { PointsService } from './points.service';

@Controller('points')
@UseGuards(JwtAuthGuard)
export class PointsController {
  constructor(private readonly pointsService: PointsService) {}
  @Get()
  async getByUserId(@User() user) {
    const points = await this.pointsService.getPointsByUserId(user.id);
    return points;
  }

  @Get('/all')
  async get() {
    const points = await this.pointsService.getAllPoints();
    return points;
  }
}
