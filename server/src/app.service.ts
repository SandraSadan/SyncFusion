import { Injectable } from '@nestjs/common';
import { GatewayService } from './gateway/gateway.service';

@Injectable()
export class AppService {

  constructor (
    private gatewayService: GatewayService
  ) {}

  getHello(): string {
    this.gatewayService.handleEvent('Socket message received');
    return 'Hello World!';
  }
}
