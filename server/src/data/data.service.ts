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
import { GatewayService } from 'src/gateway/gateway.service';

@Injectable()
export class DataService {
  constructor(private readonly gatewayService: GatewayService) {}
  async getAllData(pagination?: {
    page: number;
    limit: number;
  }): Promise<{ data: RowData[] }> {
    const jsonData: RowData[] = await this.readFileStreamByRow(File.GET_ROW);
    const data: RowData[] = await this.treeGridResponse(jsonData);
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

  async treeGridResponse(data: RowData[]): Promise<any> {
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
    bodyData?: RowData,
    rowDataList?: RowData[],
    property?: { fieldName: string; defaultValue: any },
  ): Promise<RowData[]> {
    const rowFileData: Array<RowData> = [];
    return new Promise((resolve, reject) => {
      const importStream = readFileStream(),
        rowDataParser = JSONStream.parse('data.*');
      importStream.pipe(rowDataParser);

      rowDataParser.on('error', (error) => {
        reject(error);
      });
      let isIdFound: boolean = false;
      let isRowAdded: boolean = false;

      rowDataParser.on('data', (rowData: RowData) => {
        switch (type) {
          case File.ADD_ROW:
            if (rowData.id + 1 === Number(bodyData.id)) {
              isRowAdded = true;
              rowFileData.push(rowData, bodyData);
            }
            if (!isIdFound && rowData.id === Number(bodyData.id))
              isIdFound = true;
            if (isIdFound) {
              isRowAdded = false;
              Object.assign(rowData, { id: rowData.id + 1 });
            }
            !isRowAdded && rowFileData.push(rowData);
            break;
          case File.UPDATE_ROW:
            if (rowData.id === Number(id)) {
              Object.assign(rowData, bodyData);
            }
            rowFileData.push(rowData);
            break;
          case File.DELETE_ROW:
            if (rowData.id !== Number(id)) {
              isIdFound && Object.assign(rowData, { id: rowData.id - 1 });
              rowFileData.push(rowData);
            } else {
              isIdFound = true;
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
            if (columnData.fieldName !== id) {
              columnFileData.push(columnData);
            }
            break;
          case File.CREATE_COLUMN:
            isDataExist = columnData.fieldName === id;
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

        if (File.GET_COLUMN !== type) {
          const rowFileData: RowData[] = await this.readFileStreamByRow(
            type,
            0,
            null,
            null,
            {
              fieldName: id,
              defaultValue: isEmpty(bodyData) ? null : bodyData.defaultValue,
            },
          );
          await writeFileJson(rowFileData, columnFileData);
        }
        resolve(columnFileData);
      });
    });
  }

  async addRow(bodyData: RowData): Promise<FileData> {
    await this.readFileStreamByRow(File.ADD_ROW, 0, bodyData);
    return readFileJson();
  }

  async updateRow(id: number, bodyData: RowData): Promise<FileData> {
    await this.readFileStreamByRow(File.UPDATE_ROW, id, bodyData);
    return readFileJson();
  }

  async pasteRow(parentId: number, bodyData: RowData[]): Promise<FileData> {
    await this.readFileStreamByRow(File.PASTE_ROW, parentId, null, bodyData);
    return readFileJson();
  }

  async deleteRow(id: number): Promise<FileData> {
    await this.readFileStreamByRow(File.DELETE_ROW, id);
    return readFileJson();
  }
}
