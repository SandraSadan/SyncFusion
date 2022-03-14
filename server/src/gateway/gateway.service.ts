import { Injectable } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayInit,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
ConfigModule.forRoot();

@Injectable()
@WebSocketGateway(Number(process.env.SOCKET_PORT), {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST'],
  },
})
export class GatewayService
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  @SubscribeMessage('message')
  handleEvent(@MessageBody() data: string): string {
    this.server.emit('message', data);
    return data;
  }

  afterInit(server: Server) {
    console.log('Init');
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  handleConnection(client: Socket, ...args: any[]) {
    console.log(`Client connected: ${client.id}`);
  }
}
