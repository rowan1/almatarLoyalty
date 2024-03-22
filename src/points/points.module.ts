import { Module } from '@nestjs/common';
import { PointsController } from './points.controller';
import { PointsService } from './points.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import Points from './points.entity';
import { PassportModule } from '@nestjs/passport';
import { UserCreatedListener } from 'src/user/listeners/user-created.lisenter';

@Module({
  imports: [TypeOrmModule.forFeature([Points]), PassportModule],
  controllers: [PointsController],
  providers: [PointsService, UserCreatedListener],
})
export class PointsModule {}
