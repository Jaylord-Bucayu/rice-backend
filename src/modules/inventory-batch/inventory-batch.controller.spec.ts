import { Test, TestingModule } from '@nestjs/testing';
import { InventoryBatchController } from './inventory-batch.controller';
import { InventoryBatchService } from './inventory-batch.service';

describe('InventoryBatchController', () => {
  let controller: InventoryBatchController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InventoryBatchController],
      providers: [InventoryBatchService],
    }).compile();

    controller = module.get<InventoryBatchController>(InventoryBatchController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
