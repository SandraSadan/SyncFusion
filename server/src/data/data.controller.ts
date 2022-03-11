import { Controller, Get, Put, Query, Param } from '@nestjs/common';
import { DataService } from './data.service';

@Controller('data')
export class DataController {
  constructor(private dataService: DataService) {}

  @Get()
  async getData(
    @Query() pagination: { page: number; limit: number },
  ): Promise<Object> {
    return this.dataService.getAllData(pagination);
  }

  @Put('/:id')
  async updateData(@Param('id') id: number): Promise<Object> {
    return this.dataService.updateData(id);
  }
}
