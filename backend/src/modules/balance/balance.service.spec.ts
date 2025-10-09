import { Test, TestingModule } from '@nestjs/testing';
import { BalanceService } from './balance.service';
import { BalanceRepository } from './balance.repository';
import { Balance } from './entities/balance.entity';
import { HttpException, NotFoundException } from '@nestjs/common';
import axios from 'axios';
import { env } from 'src/config/env';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('BalanceService', () => {
  let service: BalanceService;
  let repository: BalanceRepository;

  const mockBalanceRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    remove: jest.fn(),
    upsert: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BalanceService,
        {
          provide: BalanceRepository,
          useValue: mockBalanceRepository,
        },
      ],
    }).compile();

    service = module.get<BalanceService>(BalanceService);
    repository = module.get<BalanceRepository>(BalanceRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('refreshData', () => {
    it('should fetch, transform, and save data successfully', async () => {
      const apiResponse = {
        included: [
          {
            type: 'Renovable',
            id: '1',
            attributes: {
              title: 'Renovable',
              content: [
                {
                  type: 'Hidráulica',
                  id: '1.1',
                  groupId: '1',
                  attributes: {
                    title: 'Hidráulica',
                    description: 'Hidráulica description',
                    values: [
                      {
                        value: 100,
                        percentage: 0.5,
                        datetime: '2023-01-01T00:00:00Z',
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      };
      mockedAxios.get.mockResolvedValue({ data: apiResponse });
      mockBalanceRepository.create.mockImplementation((dto) => dto as any);
      mockBalanceRepository.save.mockResolvedValue([]);

      const result = await service.refreshData(
        '2023-01-01T00:00:00Z',
        '2023-01-02T00:00:00Z',
      );

      expect(result).toEqual({
        message: 'Balances saved successfully',
        count: 0,
        dateRange: {
          startDate: '2023-01-01T00:00:00Z',
          endDate: '2023-01-02T00:00:00Z',
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return an array of balances', async () => {
      const query = { 
        start_date: '2023-01-01', 
        end_date: '2023-01-31' 
      };
      const result: Balance[] = [];
      
      mockBalanceRepository.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(result),
        getRawMany: jest.fn().mockResolvedValue([]),
      });
      
      expect(await service.findAll(query as any)).toEqual(result);
    });
  });

  describe('findOne', () => {
    it('should return a single balance', async () => {
      const id = '1';
      const result: Balance = new Balance();
      mockBalanceRepository.findOne.mockResolvedValue(result);
      expect(await service.findOne(id)).toBe(result);
    });

    it('should throw a NotFoundException if balance not found', async () => {
      const id = '1';
      mockBalanceRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a balance', async () => {
      const id = '1';
      const balance = new Balance();
      mockBalanceRepository.findOne.mockResolvedValue(balance);
      mockBalanceRepository.remove.mockResolvedValue(undefined);

      const result = await service.remove(id);
      expect(result).toEqual({
        message: 'Electric balancer remove suffefuly',
        balance,
      });
      expect(mockBalanceRepository.remove).toHaveBeenCalledWith(balance);
    });

    it('should throw a NotFoundException if balance to remove is not found', async () => {
      const id = '1';
      mockBalanceRepository.findOne.mockResolvedValue(null);
      await expect(service.remove(id)).rejects.toThrow(NotFoundException);
    });
  });
});
