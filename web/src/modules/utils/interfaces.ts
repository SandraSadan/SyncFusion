export interface TableData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  ipAddress: string;
}

export interface Column {
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
}

