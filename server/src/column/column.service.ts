import { Injectable } from '@nestjs/common';
import { DataService } from 'src/data/data.service';
import { readFileJson } from 'src/shared/services/file-read-write.service';
import { File } from 'src/shared/utils/constants';
import { Column } from './interfaces';

@Injectable()
export class ColumnService {
  constructor(private readonly dataService: DataService) {}
  async getColumns(): Promise<Column[]> {
    return this.dataService.readFileStreamByColumn(File.GET_COLUMN);
  }

  async deleteColumn(column: string) {
    await this.dataService.readFileStreamByColumn(File.DELETE_COLUMN, column);
    return readFileJson();
  }

  async createColumn(columnData: Column) {
    await this.dataService.readFileStreamByColumn(
      File.CREATE_COLUMN,
      columnData.fieldName,
      columnData,
    );
    return readFileJson();
  }
}
