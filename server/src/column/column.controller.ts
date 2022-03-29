import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { FileData } from 'src/data/interfaces';
import { ColumnService } from './column.service';
import { Column, Response } from './interfaces';

@Controller('column')
export class ColumnController {
  constructor(private columnService: ColumnService) {}

  @Get()
  async getColumn(): Promise<Response> {
    const column = await this.columnService.getColumns();
    return { column };
  }

  @Put('/delete')
  async deleteColumn(
    @Body('columnName') columnName: string,
  ): Promise<FileData> {
    return this.columnService.deleteColumn(columnName);
  }

  @Post('')
  async addColumn(@Body() column: Column): Promise<FileData> {
    return this.columnService.createColumn(column);
  }

  @Put('')
  async updateColum(@Body() column: Column): Promise<FileData> {
    return this.columnService.updateColumn(column);
  }

  @Get('/settings')
  async getSettings(): Promise<object> {
    return this.columnService.getSettings();
  }

  @Put('/settings')
  async updateSettings(@Body() bodyData: object): Promise<object> {
    return this.columnService.updateSettings(bodyData);
  }
}
