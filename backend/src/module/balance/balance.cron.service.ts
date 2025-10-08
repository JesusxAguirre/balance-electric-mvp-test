import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import moment from 'moment';
import { BalanceService } from './balance.service';
import { logger } from 'src/main';

@Injectable()
export class BalanceCronService {
  constructor(private readonly balanceService: BalanceService) {}

  @Cron('0 2 * * *') // Runs every day at 2:00 AM
  async handleCron() {
    try {
      const yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD');

      logger.log(`[Cron] Refreshing data for ${yesterday}`);

      await this.balanceService.refreshData(yesterday, yesterday);

      logger.log(`[Cron] Data refresh for ${yesterday} completed successfully`);
    } catch (error) {
      console.error(
        `[Cron Error] Failed to refresh data for ${moment()
          .subtract(1, 'days')
          .format('YYYY-MM-DD')}`,
        error,
      );
    }
  }
}
