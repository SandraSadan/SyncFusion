import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { SocketEvents } from '../utils/socket-events-constants';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  public socket: Socket;

  constructor() {
    this.socket = io(environment.socketUrl);
  }

  rowChanges(): any {
    return new Observable(observer => {
      this.socket.on(SocketEvents.Row, message => {
        observer.next(message);
      });
      return () => {
        this.socket.disconnect();
      };
    });
  }

  columnChanges(): any {
    return new Observable(observer => {
      this.socket.on(SocketEvents.Column, message => {
        observer.next(message);
      });
      return () => {
        this.socket.disconnect();
      };
    });
  }
}
