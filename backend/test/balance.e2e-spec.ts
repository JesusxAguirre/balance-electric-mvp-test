import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import axios from 'axios';
import * as electricSample from '../src/modules/balance/electric-sample.json';
import { BalanceRepository } from '../src/modules/balance/balance.repository';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('BalanceController (e2e)', () => {
  let app: INestApplication;
  let balanceRepository: BalanceRepository;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    balanceRepository = moduleFixture.get<BalanceRepository>(BalanceRepository);
    await app.init();
    await balanceRepository.clear();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/balance/refresh (GET)', () => {
    it('should fetch data from REE API and store it', async () => {
      mockedAxios.get.mockResolvedValue({ data: electricSample });

      const response = await request(app.getHttpServer())
        .get('/balance/refresh?start_date=2019-01-01&end_date=2019-01-31')
        .expect(200);

      expect(response.body).toHaveProperty(
        'message',
        'Balances saved successfully',
      );
      expect(response.body.count).toBeGreaterThan(0);
    });

    it('should handle REE API failure gracefully', () => {
      mockedAxios.get.mockRejectedValue(new Error('Network Error'));

      return request(app.getHttpServer())
        .get('/balance/refresh?start_date=2023-01-01&end_date=2023-01-31')
        .expect(502) // Bad Gateway
        .then((response) => {
          expect(response.body).toHaveProperty(
            'message',
            'Failed to fetch data from REE Api please try later',
          );
        });
    });

    it('should return 400 for invalid date range', () => {
      return request(app.getHttpServer())
        .get('/balance/refresh?start_date=2023-01-31&end_date=2023-01-01')
        .expect(400);
    });
  });

  describe('/balance (GET)', () => {
    it('should return a list of balances', () => {
      return request(app.getHttpServer())
        .get('/balance')
        .expect(200)
        .then((response) => {
          expect(Array.isArray(response.body)).toBe(true);
        });
    });
  });
});
