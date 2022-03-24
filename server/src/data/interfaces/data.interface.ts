export interface RowData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  ipAddress: string;
  parentId?: number;
}

export interface FileData {
  settings: '';
  data: RowData[];
}

export interface Response {
  data: RowData[];
}
