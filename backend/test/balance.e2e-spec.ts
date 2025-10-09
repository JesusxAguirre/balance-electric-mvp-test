import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import axios from 'axios';
import * as electricSample from '../src/modules/balance/electric-sample.json';
import { BalanceRepository } from '../src/modules/balance/balance.repository';
import { globalValidationExceptionFactory } from '../src/core/exceptions/exception.factory';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('BalanceController (e2e)', () => {
  let app: INestApplication;
  let balanceRepository: BalanceRepository;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Enable validation pipe like in main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        exceptionFactory: globalValidationExceptionFactory,
      }),
    );
    
    balanceRepository = moduleFixture.get<BalanceRepository>(BalanceRepository);
    await app.init();
  });

  beforeEach(async () => {
    await balanceRepository.clear();
  });

  afterAll(async () => {
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
        .expect(500) // The exception filter returns 500 for non-axios errors
        .then((response) => {
          expect(response.body).toHaveProperty('message');
        });
    });

    it('should return error for invalid date format', () => {
      return request(app.getHttpServer())
        .get('/balance/refresh?start_date=invalid&end_date=2023-01-01')
        .expect(400)
        .then((response) => {
          expect(response.body).toHaveProperty('message');
          expect(response.body.message).toContain('ISO 8601');
        });
    });
  });

  describe('/balance (GET)', () => {
    it('should return a list of balances', () => {
      return request(app.getHttpServer())
        .get('/balance?start_date=2023-01-01&end_date=2023-01-31')
        .expect(200)
        .then((response) => {
          expect(Array.isArray(response.body)).toBe(true);
        });
    });
    
    it('should return 400 for missing required params', () => {
      return request(app.getHttpServer())
        .get('/balance')
        .expect(400);
    });
  });
});
