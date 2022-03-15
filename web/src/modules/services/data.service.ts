import { Injectable } from "@angular/core";
import { Request } from "../http/request";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

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
}
