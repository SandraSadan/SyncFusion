import { Module } from '@nestjs/common';
import { GatewayModule } from 'src/gateway/gateway.module';
import { DataController } from './data.controller';
import { DataService } from './data.service';

@Module({
  imports: [GatewayModule],
  controllers: [DataController],
  providers: [DataService],
  exports: [DataService],
})
export class DataModule {}
