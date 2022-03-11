import { Injectable } from '@nestjs/common';
import { readFileSync, writeFileSync } from 'fs';
import { findIndex } from 'lodash';
import { Data } from './interfaces';

@Injectable()
export class DataService {
  async getAllData(pagination?: {
    page: number;
    limit: number;
  }): Promise<{}[]> {
    const jsonData = JSON.parse(
      readFileSync('./src/test.json', {
        encoding: 'utf8',
        flag: 'r',
      }),
    );
    return pagination
      ? jsonData.data.slice(
          ((Math.abs(pagination.page) || 1) - 1) * Math.abs(pagination.limit),
          Math.abs(pagination.limit),
        )
      : jsonData.data;
  }

  async findByorderId(id: number) {
    const allData = await this.getAllData();
    const singleData = allData.find((element: Data) => {
      return Number(element.id) === Number(id);
    });
    return { singleData, allData };
  }

  async updateData(id: number) {
    const { singleData, allData } = await this.findByorderId(id);
    Object.assign(singleData, {
      id: 1,
      first_name: 'Alameda',
      last_name: 'Car',
      email: 'acarr0@scribd.com',
      gender: 'Female',
      ip_address: '190.82.135.140',
    });
    const index = findIndex(allData, singleData);
    allData.splice(index, 1, singleData);
    writeFileSync(
      './src/test.json',
      JSON.stringify({
        settings: '',
        data: allData,
      }),
    );
    return this.getAllData();
  }
}
