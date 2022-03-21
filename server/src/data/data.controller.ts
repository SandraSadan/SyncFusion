import {
  Controller,
  Get,
  Put,
  Query,
  Param,
  Body,
  Delete,
} from '@nestjs/common';
import { DataService } from './data.service';
import { RowData, FileData } from './interfaces';

@Controller('data')
export class DataController {
  constructor(private dataService: DataService) {}

  @Get()
  async getData(
    @Query() pagination: { page: number; limit: number },
  ): Promise<{ data: RowData[] }> {
    return this.dataService.getAllData(pagination);
  }

  @Put('/:id')
  async updateData(
    @Param('id') id: number,
    @Body() bodyData: RowData,
  ): Promise<FileData> {
    return this.dataService.updateRow(id, bodyData);
  }

  @Delete('delete/row/:id')
  async deleteRows(@Param('id') id: number): Promise<FileData> {
    return this.dataService.deleteRow(id);
  }
}
