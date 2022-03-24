import { Injectable } from '@nestjs/common';
import { isEmpty } from 'lodash';
import { Column } from 'src/column/interfaces';
import {
  readFileJson,
  readFileStream,
  writeFileJson,
} from 'src/shared/services/file-read-write.service';
import { File } from 'src/shared/utils/constants';
import { FileData } from './interfaces';
import * as JSONStream from 'JSONStream';
import { GatewayService } from 'src/gateway/gateway.service';

@Injectable()
export class DataService {
  constructor(private readonly gatewayService: GatewayService) {}
  async getAllData(pagination?: {
    page: number;
    limit: number;
  }): Promise<{ data: any[] }> {
    const jsonData: any[] = await this.readFileStreamByRow(File.GET_ROW);
    const data: any[] = await this.treeGridResponse(jsonData);
    return { data };

    // commented pagination for future use

    /*
    !isEmpty(pagination)
      ? jsonData.slice(
          ((Math.abs(pagination.page) || 1) - 1) * Math.abs(pagination.limit),
          Math.abs(pagination.limit),
        )
      : jsonData; */
  }

  async treeGridResponse(data: any[]): Promise<any> {
    const createDataTree = (dataset) => {
      const hashTable = Object.create(null),
        dataTree = [];
      dataset.forEach(
        (aData) => (hashTable[aData.id] = { ...aData, subtasks: [] }),
      );
      dataset.forEach((aData) => {
        if (aData.parentId !== 0)
          hashTable[aData.parentId].subtasks.push(hashTable[aData.id]);
        else dataTree.push(hashTable[aData.id]);
      });
      return dataTree;
    };
    return createDataTree(data);
  }

  async readFileStreamByRow(
    type: string,
    id?: number,
    bodyData?: any,
    rowList?: any[],
    property?: { fieldName: string; defaultValue: any },
  ): Promise<any[]> {
    const rowFileData: Array<any> = [];
    return new Promise((resolve, reject) => {
      const importStream = readFileStream(),
        rowDataParser = JSONStream.parse('data.*');
      importStream.pipe(rowDataParser);

      rowDataParser.on('error', (error) => {
        reject(error);
      });
      let rowCount = 0;

      rowDataParser.on('data', (rowData: any) => {
        rowCount++;
        switch (type) {
          case File.ADD_ROW:
            rowFileData.push(rowData);
            break;
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
          case File.DELETE_COLUMN:
            delete rowData[property.fieldName];
            rowFileData.push(rowData);
            break;
          case File.CREATE_COLUMN:
            const createColumn = {};
            createColumn[property.fieldName] = property.defaultValue;
            Object.assign(rowData, createColumn);
            rowFileData.push(rowData);
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
          if (type === File.ADD_ROW) {
            Object.assign(bodyData, { id: rowCount });
            rowFileData.push(bodyData);
          }
          await writeFileJson(rowFileData, columnFileData);
        }

        resolve(rowFileData);
      });
    });
  }

  async readFileStreamByColumn(
    type: string,
    fieldName?: string,
    bodyData?: Column,
  ): Promise<Column[]> {
    const columnFileData: Array<Column> = [];
    let isDataExist = false;
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
            if (columnData.fieldName !== fieldName) {
              columnFileData.push(columnData);
            }
            break;
          case File.CREATE_COLUMN:
            columnFileData.push(columnData);
            isDataExist = columnData.fieldName === fieldName;
            break;
          case File.UPDATE_COLUMN:
            if (columnData.fieldName === fieldName) {
              columnData = bodyData;
            }
          default:
            columnFileData.push(columnData);
            break;
        }
      });
      columnDataParser.on('end', async () => {
        if (type === File.CREATE_COLUMN && !isDataExist) {
          columnFileData.push(bodyData);
        }

        if (File.GET_COLUMN !== type) {
          const rowFileData: any[] = await this.readFileStreamByRow(
            type,
            0,
            null,
            null,
            {
              fieldName,
              defaultValue: isEmpty(bodyData) ? null : bodyData.defaultValue,
            },
          );
          await writeFileJson(rowFileData, columnFileData);
        }
        resolve(columnFileData);
      });
    });
  }

  async addRow(bodyData: any): Promise<FileData> {
    await this.readFileStreamByRow(File.ADD_ROW, 0, bodyData);
    return readFileJson();
  }

  async updateRow(id: number, bodyData: any): Promise<FileData> {
    await this.readFileStreamByRow(File.UPDATE_ROW, id, bodyData);
    return readFileJson();
  }

  async pasteRow(parentId: number, bodyData: any[]): Promise<FileData> {
    await this.readFileStreamByRow(File.PASTE_ROW, parentId, null, bodyData);
    return readFileJson();
  }

  async deleteRow(id: number): Promise<FileData> {
    await this.readFileStreamByRow(File.DELETE_ROW, id);
    return readFileJson();
  }
}
