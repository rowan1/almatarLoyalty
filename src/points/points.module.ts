import { Module } from '@nestjs/common';
import { PointsController } from './points.controller';
import { PointsService } from './points.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import Points from './points.entity';
import { PassportModule } from '@nestjs/passport';
import { UserCreatedListener } from 'src/listeners/user-created.lisenter';
import { PointsTransferConfirmedListener } from 'src/listeners/points-transfer-confirmed.listener';

@Module({
  imports: [TypeOrmModule.forFeature([Points]), PassportModule],
  controllers: [PointsController],
  providers: [
    PointsService,
    UserCreatedListener,
    PointsTransferConfirmedListener,
  ],
})
export class PointsModule {}
