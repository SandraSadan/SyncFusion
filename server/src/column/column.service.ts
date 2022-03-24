import { Injectable } from '@nestjs/common';
import { DataService } from 'src/data/data.service';
import { FileData } from 'src/data/interfaces';
import { GatewayService } from 'src/gateway/gateway.service';
import { readFileJson } from 'src/shared/services/file-read-write.service';
import { File } from 'src/shared/utils/constants';
import { Column } from './interfaces';

@Injectable()
export class ColumnService {
  constructor(
    private readonly dataService: DataService,
    private readonly gatewayService: GatewayService,
  ) {}
  async getColumns(): Promise<Column[]> {
    return this.dataService.readFileStreamByColumn(File.GET_COLUMN);
  }

  async deleteColumn(column: string): Promise<FileData> {
    await this.dataService.readFileStreamByColumn(File.DELETE_COLUMN, column);
    const result: FileData = readFileJson();
    this.gatewayService.handleColumn(result);
    return result;
  }

  async createColumn(columnData: Column): Promise<FileData> {
    await this.dataService.readFileStreamByColumn(
      File.CREATE_COLUMN,
      columnData.fieldName,
      columnData,
    );
    const result: FileData = readFileJson();
    this.gatewayService.handleColumn(result);
    return result;
  }

  async updateColumn(columnData: Column): Promise<FileData> {
    await this.dataService.readFileStreamByColumn(
      File.UPDATE_COLUMN,
      columnData.fieldName,
      columnData,
    );
    const result: FileData = readFileJson();
    this.gatewayService.handleColumn(result);
    return result;
  }
}
