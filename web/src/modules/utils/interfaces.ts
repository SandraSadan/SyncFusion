export interface TableData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  ipAddress: string;
  subtasks?: TableData[];
  parentId: number;
  address: string;
  region: string;
}

export interface ColumnData {
  name: string;
  fieldName: string;
  dataType: string;
  defaultValue: any;
  minimumWidth: number;
  fontSize: number;
  fontColor: string;
  backgroundColor: string;
  alignment: string;
  textWrap: boolean;
  dropdownValues?: Array<any>;
  isPrimaryKey: boolean;
  customAttributes?: object;
}

