import { createReadStream, readFileSync, writeFileSync } from 'fs';
import { Column } from 'src/column/interfaces';
import { RowData } from 'src/data/interfaces';

export function writeFileJson(rowData: RowData[], columnData: Column[]) {
  writeFileSync(
    './src/dataBase.json',
    JSON.stringify({
      settings: '',
      data: rowData,
      columns: columnData,
    }),
  );
}

export function readFileJson() {
  return JSON.parse(
    readFileSync('./src/dataBase.json', {
      encoding: 'utf8',
      flag: 'r',
    }),
  );
}

export function readFileStream() {
  return createReadStream('./src/dataBase.json', {
    flags: 'r',
    encoding: 'utf-8',
  });
}
