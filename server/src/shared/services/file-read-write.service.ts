import { createReadStream, readFileSync, writeFileSync } from 'fs';
import { Column } from 'src/column/interfaces';

export function writeFileJson(rowData: any[], columnData: Column[]) {
  writeFileSync(
    './src/jsonData/dataBase.json',
    JSON.stringify({
      settings: '',
      data: rowData,
      columns: columnData,
    }),
  );
}

export function readFileJson() {
  return JSON.parse(
    readFileSync('./src/jsonData/dataBase.json', {
      encoding: 'utf8',
      flag: 'r',
    }),
  );
}

export function readFileStream() {
  return createReadStream('./src/jsonData/dataBase.json', {
    flags: 'r',
    encoding: 'utf-8',
  });
}

export function readSettings() {
  return JSON.parse(
    readFileSync('./src/jsonData/settings.json', {
      encoding: 'utf8',
      flag: 'r',
    }),
  );
}

export function writeSettings(settings: object) {
  writeFileSync(
    './src/jsonData/settings.json',
    JSON.stringify({
      settings,
    }),
  );
}
