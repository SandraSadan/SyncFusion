import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { Column } from './interfaces';

@Injectable()
export class ColumnService {
    async getColumns(): Promise<Column[]> {
        const jsonData = JSON.parse(
            readFileSync('./src/dataBase.json', {
                encoding: 'utf8',
                flag: 'r',
            }),
        );
        return jsonData.columns;
    }
}
