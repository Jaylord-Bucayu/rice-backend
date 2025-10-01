import { Test, TestingModule } from '@nestjs/testing';
import { GrainsController } from './grains.controller';
import { GrainsService } from './grains.service';

describe('GrainsController', () => {
  let controller: GrainsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GrainsController],
      providers: [GrainsService],
    }).compile();

    controller = module.get<GrainsController>(GrainsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
