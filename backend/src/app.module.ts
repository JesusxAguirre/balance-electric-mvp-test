import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { BalanceModule } from './modules/balance/balance.module';

@Module({
  imports: [ScheduleModule.forRoot(), DatabaseModule, BalanceModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
