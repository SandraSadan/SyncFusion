import { Injectable } from '@nestjs/common';
import { DataService } from 'src/data/data.service';
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
    const result = await this.dataService.readFileStreamByColumn(
      File.GET_COLUMN,
    );
    this.gatewayService.handleEvent(result);
    return result;
  }

  async deleteColumn(column: string) {
    await this.dataService.readFileStreamByColumn(File.DELETE_COLUMN, column);
    const result = readFileJson();
    this.gatewayService.handleEvent(result);
    return result;
  }

  async createColumn(columnData: Column) {
    await this.dataService.readFileStreamByColumn(
      File.CREATE_COLUMN,
      '',
      columnData,
    );
    const result = readFileJson();
    this.gatewayService.handleEvent(result);
    return result;
  }
}
