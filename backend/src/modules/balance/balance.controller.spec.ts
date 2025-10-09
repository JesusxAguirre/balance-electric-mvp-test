import { Test, TestingModule } from '@nestjs/testing';
import { BalanceController } from './balance.controller';
import { BalanceService } from './balance.service';


describe('BalanceController', () => {
  let controller: BalanceController;
  let service: BalanceService;

  const mockBalanceService = {
    refreshData: jest.fn(),
    findAll: jest.fn(),
    findCategorized: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BalanceController],
      providers: [
        {
          provide: BalanceService,
          useValue: mockBalanceService,
        },
      ],
    }).compile();

    controller = module.get<BalanceController>(BalanceController);
    service = module.get<BalanceService>(BalanceService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('refresh', () => {
    it('should call refreshData on the service', () => {
      const query = { start_date: '2023-01-01', end_date: '2023-01-31' };
      controller.refresh(query);
      expect(service.refreshData).toHaveBeenCalledWith(query.start_date, query.end_date);
    });
  });

  describe('findAll', () => {
    it('should call findAll on the service', () => {
      const query = { start_date: '2023-01-01', end_date: '2023-01-31' };
      controller.findAll(query as any);
      expect(service.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('findCategorized', () => {
    it('should call findCategorized on the service', () => {
      const query = { start_date: '2023-01-01', end_date: '2023-01-31', time_grouping: 'month' as any };
      controller.findCategorized(query as any);
      expect(service.findCategorized).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('should call findOne on the service with the correct id', () => {
      const id = 'some-uuid';
      controller.findOne(id);
      expect(service.findOne).toHaveBeenCalledWith(id);
    });
  });

  describe('remove', () => {
    it('should call remove on the service with the correct id', () => {
      const id = 'some-uuid';
      controller.remove(id);
      expect(service.remove).toHaveBeenCalledWith(id);
    });
  });
});
