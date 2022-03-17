import { Body, Controller, Get, Put } from '@nestjs/common';
import { FileData } from 'src/data/interfaces';
import { ColumnService } from './column.service';
import { Column, Response } from './interfaces';

@Controller('column')
export class ColumnController {
    constructor(private columnService: ColumnService) { }

    @Get()
    async getColumn(): Promise<Response> {
        const column = await this.columnService.getColumns();
        return { column };
    }

    @Put('/delete')
    async deleteColumn(@Body('columnName') columnName: string): Promise<File> {
      return this.columnService.deleteColumn(columnName);
    }
  
    @Put('/add')
    async addColumn(@Body() column: Column): Promise<FileData> {
      return this.columnService.createColumn(column);
    }
}
