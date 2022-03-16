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
import { Data, File, Response } from './interfaces';

@Controller('data')
export class DataController {
  constructor(private dataService: DataService) {}

  @Get()
  async getData(
    @Query() pagination: { page: number; limit: number },
  ): Promise<Response> {
    return this.dataService.getAllData(pagination);
  }

  @Put('/:id')
  async updateData(
    @Param('id') id: number,
    @Body() bodyData: Object,
  ): Promise<File> {
    return this.dataService.updateData(id, bodyData);
  }

  @Delete('delete/row/:id')
  async deleteRows(@Param('id') id: number): Promise<File> {
    return this.dataService.deleteRow(id);
  }

  @Put('/delete/column')
  async deleteColumn(@Body('columnName') columnName: string): Promise<File> {
    return this.dataService.deleteColumn(columnName);
  }

  @Put('/add/column')
  async addColumn(@Body() column: object): Promise<File> {
    return this.dataService.createColumn(column);
  }
}
