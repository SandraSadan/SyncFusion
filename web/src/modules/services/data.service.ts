import { Injectable } from "@angular/core";
import { Request } from "../http/request";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { ColumnData, TableData } from "../utils/interfaces";

@Injectable({
  providedIn: "root",
})

export class DataService extends Request {
  constructor(private httpClient: HttpClient) {
    super(httpClient);
  }

  getAllLists(): Observable<any> {
    return this.httpGet('data');
  }

  getColumn(): Observable<any> {
    return this.httpGet('column');
  }

  addColumn(data: ColumnData): Observable<any> {
    return this.httpPost('column', data)
  }

  editColumn(data: ColumnData): Observable<any> {
    return this.httpPut('column', data)
  }

  deleteColumn(data: ColumnData): Observable<any> {
    return this.httpPut('column/delete', { columnName: data.fieldName })
  }

  addRow(data: TableData): Observable<any> {
    return this.httpPost('data', data);
  }

  editRow(rowId: string, data: TableData): Observable<any> {
    return this.httpPut(`data/${rowId}`, data)
  }

  deleteRow(data: TableData): Observable<any> {
    return this.httpPut(`data/delete/row`, data);
  }
}
