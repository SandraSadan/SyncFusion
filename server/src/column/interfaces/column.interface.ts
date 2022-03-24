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
  dropdownValues?: Array<any>;
}

export interface Response {
  column: Column[];
}
