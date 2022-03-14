import { Injectable } from '@nestjs/common';
import { readFileSync, writeFileSync } from 'fs';
import { findIndex, remove } from 'lodash';
import { Data, File } from './interfaces';

@Injectable()
export class DataService {
  async getAllData(pagination: { page: number; limit: number }): Promise<File> {
    const jsonData = await this.readFileJson();
    const data = jsonData.data.slice(
      ((Math.abs(pagination.page) || 1) - 1) * Math.abs(pagination.limit),
      Math.abs(pagination.limit),
    );
    return { settings: '', data };
  }

  async findById(id: number): Promise<{ singleData: Data; allData: Data[] }> {
    const allData = (await this.readFileJson()).data;
    let singleData: Data;
    return (
      allData.some((element: Data) => {
        if (Number(element.id) === Number(id)) singleData = element;
        return Number(element.id) === Number(id);
      }) && { singleData, allData }
    );
  }

  async updateData(id: number, bodyData: object) {
    const { singleData, allData } = await this.findById(id);
    Object.assign(singleData, bodyData);
    const index = findIndex(allData, singleData);
    allData.splice(index, 1, singleData);
    this.writeFileJson(allData);
    return this.readFileJson();
  }

  async readFileJson(): Promise<File> {
    return JSON.parse(
      readFileSync('./src/dataBase.json', {
        encoding: 'utf8',
        flag: 'r',
      }),
    );
  }

  async writeFileJson(allData: Data[]) {
    writeFileSync(
      './src/dataBase.json',
      JSON.stringify({
        settings: '',
        data: allData,
      }),
    );
  }

  async deleteRow(id: number): Promise<File> {
    const { singleData, allData } = await this.findById(id);
    remove(allData, singleData);
    this.writeFileJson(allData);
    return this.readFileJson();
  }

  async deleteColumn(column: string) {
    const { data } = await this.readFileJson();
    const updatedCloumns = data.map((element: Data) => {
      delete element[column];
      return element;
    });
    this.writeFileJson(updatedCloumns);
    return this.readFileJson();
  }

  async createColumn(column: object) {
    const { data } = await this.readFileJson();
    const updatedCloumns = data.map((element: Data) => {
      Object.assign(element, column);
      return element;
    });
    this.writeFileJson(updatedCloumns);
    return this.readFileJson();
  }
}
