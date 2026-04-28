import { Test, TestingModule } from '@nestjs/testing';
import { InventoryBatchService } from './inventory-batch.service';

describe('InventoryBatchService', () => {
  let service: InventoryBatchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InventoryBatchService],
    }).compile();

    service = module.get<InventoryBatchService>(InventoryBatchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
