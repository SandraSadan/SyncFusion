import { config } from 'dotenv';
config(); // For injecting env variables at compile time

import { Injectable } from '@nestjs/common';
import configuration from 'src/config/configuration';
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
import { FileData } from 'src/data/interfaces';

@Injectable()
@WebSocketGateway(Number(configuration().socketPort), {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT'],
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

  @SubscribeMessage('column')
  handleColumn(@MessageBody() data: FileData): FileData {
    this.server.emit('column', data);
    return data;
  }

  @SubscribeMessage('row')
  handleRow(@MessageBody() data: FileData): FileData {
    this.server.emit('row', data);
    return data;
  }

  @SubscribeMessage('setting')
  handleSetting(@MessageBody() data: FileData): FileData {
    this.server.emit('setting', data);
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
