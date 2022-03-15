export interface Data {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  ipAddress: string;
}

export interface File {
  settings: '';
  data: Data[];
}

export interface Response {
  data: Data[];
}
