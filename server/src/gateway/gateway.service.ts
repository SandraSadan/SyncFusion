import { Injectable } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

@Injectable()
@WebSocketGateway(Number(process.env.SOCKET_PORT), {
  cors: true,
})
export class GatewayService {
  @WebSocketServer() server;

  @SubscribeMessage('message')
  handleEvent(@MessageBody() data: string): string {
    this.server.emit('message', data);
    return data;
  }
}
