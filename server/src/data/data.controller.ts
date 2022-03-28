import {
  Controller,
  Get,
  Put,
  Query,
  Param,
  Body,
  Delete,
  Post,
} from '@nestjs/common';
import { DataService } from './data.service';
import { FileData } from './interfaces';

@Controller('data')
export class DataController {
  constructor(private dataService: DataService) {}

  @Get()
  async getData(
    @Query() pagination: { page: number; limit: number },
  ): Promise<{ data: any[] }> {
    return this.dataService.getAllData(pagination);
  }

  @Post()
  async addData(@Body() bodyData: any): Promise<{ data: any[] }> {
    return this.dataService.addRow(bodyData);
  }

  @Put('/:id')
  async updateData(
    @Param('id') id: number,
    @Body() bodyData: any,
  ): Promise<FileData> {
    return this.dataService.updateRow(id, bodyData);
  }

  @Delete('delete/row/:id')
  async deleteRows(@Param('id') id: number): Promise<FileData> {
    return this.dataService.deleteRow(id);
  }

  @Put('paste/row')
  async pasteData(@Body() bodyData: any): Promise<FileData> {
    return this.dataService.pasteRow(bodyData);
  }
}
