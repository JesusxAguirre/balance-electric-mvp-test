import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as moment from 'moment';
import { BalanceService } from './balance.service';

const logger = new Logger('Cron Service');

@Injectable()
export class BalanceCronService {
  constructor(private readonly balanceService: BalanceService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    try {
      const datePart = moment().subtract(1, 'days').format('YYYY-MM-DD');
      logger.log(`[Cron] Refreshing data for ${datePart}`);

      const startDate = `${datePart}T00:00`; // E.g., 2025-01-01T00:00
      const endDate = `${datePart}T23:59`; // E.g., 2025-01-01T23:59
      await this.balanceService.refreshData(startDate, endDate);

      logger.log(`[Cron] Data refresh for ${datePart} completed successfully`);
    } catch (error) {
      const datePart = moment().subtract(1, 'days').format('YYYY-MM-DD');

      //catch http error
      if (error && error.response && error.status) {
        const errorMessage =
          error.response.message || 'Unknown HTTP error details';
        const errorDetails = error.response.details || '';
        const statusCode = error.status;

        logger.error(
          `[Cron Failed] HTTP Status ${statusCode} for ${datePart}: ${errorMessage}`,
          errorDetails, // Log details on a separate line for clarity
        );
      } else {
        logger.error(
          `[Cron CRITICAL] Unexpected error refreshing data for ${datePart}`,
          error.stack || error.message, // Log stack for debugging critical errors
        );
      }
    }
  }
}
