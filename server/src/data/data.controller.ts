import { Controller, Get, Put, Query, Param } from '@nestjs/common';
import { DataService } from './data.service';
import { Data } from './interfaces';

@Controller('data')
export class DataController {
  constructor(private dataService: DataService) {}

  @Get()
  async getData(
    @Query() pagination: { page: number; limit: number },
  ): Promise<Data[]> {
    return this.dataService.getAllData(pagination);
  }

  @Put('/:id')
  async updateData(@Param('id') id: number): Promise<Data[]> {
    return this.dataService.updateData(id);
  }
}
