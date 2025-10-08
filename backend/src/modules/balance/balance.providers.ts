import { DataSource } from 'typeorm';
import { BalanceRepository } from './balance.repository';

export const balanceProviders = [
  {
    provide: BalanceRepository,
    useFactory: (dataSource: DataSource) => new BalanceRepository(dataSource),
    inject: ['DATA_SOURCE'],
  },
];
