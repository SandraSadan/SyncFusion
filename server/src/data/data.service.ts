import { Injectable } from '@nestjs/common';
import { isEmpty } from 'lodash';
import { Column } from 'src/column/interfaces';
import {
  readFileJson,
  readFileStream,
  writeFileJson,
} from 'src/shared/services/file-read-write.service';
import { File } from 'src/shared/utils/constants';
import { RowData, FileData } from './interfaces';
import * as JSONStream from 'JSONStream';
@Injectable()
export class DataService {
  async getAllData(pagination?: {
    page: number;
    limit: number;
  }): Promise<{ data: RowData[] }> {
    const jsonData: RowData[] = await this.readFileStreamByRow(File.GET_ROW);
    const data: RowData[] = !isEmpty(pagination)
      ? jsonData.slice(
          ((Math.abs(pagination.page) || 1) - 1) * Math.abs(pagination.limit),
          Math.abs(pagination.limit),
        )
      : jsonData;
    return { data };
  }

  async readFileStreamByRow(
    type: string,
    id?: number,
    bodyData?: RowData | {},
  ): Promise<RowData[]> {
    const rowFileData: Array<RowData> = [];
    return new Promise((resolve, reject) => {
      const importStream = readFileStream(),
        rowDataParser = JSONStream.parse('data.*');
      importStream.pipe(rowDataParser);

      rowDataParser.on('error', (error) => {
        reject(error);
      });

      rowDataParser.on('data', (rowData: RowData) => {
        switch (type) {
          case File.UPDATE_ROW:
            if (rowData.id === Number(id)) {
              Object.assign(rowData, bodyData);
            }
            rowFileData.push(rowData);
            break;
          case File.DELETE_ROW:
            if (rowData.id !== Number(id)) {
              rowFileData.push(rowData);
            }
            break;
          default:
            rowFileData.push(rowData);
            break;
        }
      });

      rowDataParser.on('end', async () => {
        if (File.GET_ROW !== type) {
          const columnFileData = await this.readFileStreamByColumn(
            File.GET_COLUMN,
          );
          await writeFileJson(rowFileData, columnFileData);
        }
        resolve(rowFileData);
      });
    });
  }

  async readFileStreamByColumn(
    type: string,
    id?: string,
    bodyData?: Column,
  ): Promise<Column[]> {
    const columnFileData: Array<Column> = [];
    let isDataExist: boolean = false;
    return new Promise((resolve, reject) => {
      const importStream = readFileStream(),
        columnDataParser = JSONStream.parse('columns.*');
      importStream.pipe(columnDataParser);
      columnDataParser.on('error', (error) => {
        reject(error);
      });
      columnDataParser.on('data', (columnData: Column) => {
        switch (type) {
          case File.DELETE_COLUMN:
            if (columnData.name !== id) {
              columnFileData.push(columnData);
            }
            break;
          case File.CREATE_COLUMN:
            isDataExist = columnData.name === id;
            break;
          default:
            columnFileData.push(columnData);
            break;
        }
      });
      columnDataParser.on('end', async () => {
        if (type === File.CREATE_COLUMN && !isDataExist) {
          columnFileData.push(bodyData);
        }
        if (File.GET_ROW !== type) {
          const rowFileData: RowData[] = await this.readFileStreamByRow(
            File.GET_ROW,
          );
          await writeFileJson(rowFileData, columnFileData);
        }
        resolve(columnFileData);
      });
    });
  }

  async updateRow(id: number, bodyData: RowData): Promise<FileData> {
    await this.readFileStreamByRow(File.UPDATE_ROW, id, bodyData);
    return readFileJson();
  }

  async deleteRow(id: number): Promise<FileData> {
    await this.readFileStreamByRow(File.DELETE_ROW, id, {});
    return readFileJson();
  }
}
