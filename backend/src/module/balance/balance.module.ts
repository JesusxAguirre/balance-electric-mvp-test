import { Module } from '@nestjs/common';
import { BalanceService } from './balance.service';
import { BalanceController } from './balance.controller';
import { DatabaseModule } from 'src/database/database.module';
import { balanceProviders } from './balance.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [BalanceController],
  providers: [...balanceProviders, BalanceService],
})
export class BalanceModule {}
