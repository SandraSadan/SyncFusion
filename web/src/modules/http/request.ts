import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { get } from 'lodash';

export class Request {
  private baseUrl: string;
  private http: HttpClient;

  private static buildHeadersWithCORS() {
    return new HttpHeaders({
      "Access-Control-Allow-Origin": "*",
      reportProgress: "true",
    });
  }

  // tslint:disable-next-line:member-ordering
  private static buildHeaders() {
    return new HttpHeaders({
      "Content-Type": "application/json",
    });
  }

  private handleError(error: Response): any {
    return throwError(get(error, "error") || {});
  }

  constructor(http: HttpClient) {
    this.baseUrl = environment.apiEndPoint;
    this.http = http;
  }

  httpGet(path: string): Observable<any> {
    const headers = Request.buildHeaders();
    return this.http.get(this.baseUrl.concat(path), { headers }).pipe(
      map((res) => res),
      catchError(this.handleError)
    );
  }

  httpPost(path: string, data: any, formData = false): Observable<any> {
    const headers = Request.buildHeaders();
    return this.http.post(this.baseUrl.concat(path), data, { headers }).pipe(
      map((res) => res),
      catchError(this.handleError)
    );
  }

  httpDelete(path: string): Observable<any> {
    const headers = Request.buildHeaders();
    return this.http.delete(this.baseUrl.concat(path), { headers }).pipe(
      map((res) => res),
      catchError(this.handleError)
    );
  }

  httpPut(path: string, data: any, formData = false): Observable<any> {
    const headers = Request.buildHeaders();
    return this.http.put(this.baseUrl.concat(path), data, { headers }).pipe(
      map((res) => res),
      catchError(this.handleError)
    );
  }
}
