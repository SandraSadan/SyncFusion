import { Injectable } from '@nestjs/common';
import { isEmpty, includes, forEach, isDate, isArray, isNaN } from 'lodash';
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
        if (aData.parentId > 0)
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
    property?: { fieldName: string; defaultValue: any },
  ): Promise<any[]> {
    const rowFileData: Array<any> = [];
    return new Promise(async (resolve, reject) => {
      const importStream = readFileStream(),
        rowDataParser = JSONStream.parse('data.*');
      importStream.pipe(rowDataParser);

      rowDataParser.on('error', (error) => {
        reject(error);
      });
      let rowCount = 0,
        rowIds = [],
        bodyRowData = [],
        isIdFound: boolean = false,
        isRowAdded: boolean = false,
        minusCount = 0,
        plussCount = 0,
        currentRowId;

      let flatterArray = (data, result = []) => {
        forEach(data, (prop) => {
          rowIds.push(prop.id);
          result.push({ ...prop });
          flatterArray(prop.subtasks, result);
        });
        bodyRowData = result;
        return result;
      };
      if (type === File.PASTE_NEXT || type === File.DELETE_ROW) {
        await flatterArray(bodyData['rowData']);
      }

      rowDataParser.on('data', (rowData: any) => {
        currentRowId = rowData.id;
        rowCount = rowCount < rowData.uniqueId ? rowData.uniqueId : rowCount;
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
            if (!includes(rowIds, rowData.id)) {
              rowFileData.push(
                Object.assign(rowData, {
                  id: rowData.id - minusCount,
                }),
              );
            } else {
              minusCount++;
            }
            break;
          case File.PASTE_NEXT:
            if (!includes(rowIds, rowData.id)) {
              rowFileData.push(
                Object.assign(rowData, {
                  id: rowData.id - minusCount + plussCount,
                  parentId: rowData.parentId - minusCount,
                }),
              );
            } else {
              minusCount++;
            }
            if (currentRowId + 1 === Number(bodyData.id)) {
              forEach(bodyRowData, (ele) => {
                plussCount++;
                Object.assign(ele, {
                  id: rowFileData[rowFileData.length - 1].id + 1,
                });
                rowFileData.push(ele);
              });
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
            let dataArray = [...rowFileData];
            const selectedRowValue = rowFileData[bodyData.id - 1];
            dataArray[selectedRowValue.id] = Object.assign(selectedRowValue, {
              uniqueId: rowCount + 1,
            });
          }
          if (type === File.PASTE_NEXT) {
            let dataArray = [...rowFileData];
            let count = 0;
            forEach(bodyRowData, (ele) => {
              count++;
              const selectedRowValue = rowFileData[ele.id - 1];
              dataArray[selectedRowValue.id] = Object.assign(selectedRowValue, {
                uniqueId: rowCount + count,
              });
            });
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
          const rowFileData: any[] = await this.readFileStreamByRow(
            type,
            0,
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

  async columUpdateStream(type: string, fieldName?: string, bodyData?: Column) {
    const columnFileData: Array<Column> = [];
    let isDataTypeChanged: boolean = false;
    await new Promise((resolve, reject) => {
      const importStream = readFileStream(),
        columnDataParser = JSONStream.parse('columns.*');
      importStream.pipe(columnDataParser);
      columnDataParser.on('error', (error) => {
        reject(error);
      });
      columnDataParser.on('data', (columnData: Column) => {
        if (type === File.UPDATE_COLUMN) {
          if (
            columnData.fieldName === fieldName &&
            columnData.dataType !== bodyData.dataType
          ) {
            isDataTypeChanged = true;
          }
          if (columnData.fieldName === fieldName) {
            Object.assign(columnData, bodyData);
          }
          columnFileData.push(columnData);
        }
      });
      columnDataParser.on('end', async () => {
        if (!isDataTypeChanged) {
          const rowFileData: any[] = await this.readFileStreamByRow(
            type,
            0,
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

    const rowFileData: Array<any> = [];
    isDataTypeChanged &&
      (await new Promise((resolve, reject) => {
        const importStream = readFileStream(),
          rowDataParser = JSONStream.parse('data.*');
        importStream.pipe(rowDataParser);

        rowDataParser.on('error', (error) => {
          reject(error);
        });
        let rowCount = 0;

        rowDataParser.on('data', (rowData: any) => {
          rowCount++;
          if (
            bodyData.dataType === 'number' &&
            !isNaN(Number(rowData[bodyData.fieldName]))
          ) {
            rowData[bodyData.fieldName] = Number(rowData[bodyData.fieldName]);
          } else if (bodyData.dataType === 'string') {
            rowData[bodyData.fieldName] = String(rowData[bodyData.fieldName]);
          } else if (
            bodyData.dataType === 'boolean' &&
            !isArray(rowData[bodyData.fieldName]) &&
            !isDate(rowData[bodyData.fieldName])
          ) {
            rowData[bodyData.fieldName] =
              rowData[bodyData.fieldName] === 'true' ||
              Number(rowData[bodyData.fieldName]) > 0;
          } else {
            rowData[bodyData.fieldName] = bodyData.defaultValue;
          }
          rowFileData.push(rowData);
        });

        rowDataParser.on('end', async () => {
          writeFileJson(rowFileData, columnFileData);
          resolve(rowFileData);
        });
      }));
  }

  async addRow(bodyData: any): Promise<FileData> {
    await this.readFileStreamByRow(File.ADD_ROW, 0, bodyData);
    const result = readFileJson();
    this.gatewayService.handleRow(result);
    return result;
  }

  async updateRow(id: number, bodyData: any): Promise<FileData> {
    await this.readFileStreamByRow(File.UPDATE_ROW, id, bodyData);
    const result = readFileJson();
    this.gatewayService.handleRow(result);
    return result;
  }
  async pasteRow(bodyData: any): Promise<FileData> {
    await this.readFileStreamByRow(File.PASTE_NEXT, null, bodyData, null);
    const result = readFileJson();
    this.gatewayService.handleRow(result);
    return result;
  }

  async deleteRow(bodyData: any): Promise<FileData> {
    await this.readFileStreamByRow(File.DELETE_ROW, null, bodyData, null);
    const result = readFileJson();
    this.gatewayService.handleRow(result);
    return result;
  }
}
