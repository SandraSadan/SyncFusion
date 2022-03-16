import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DataModule } from './data/data.module';

import configuration from './config/configuration';

// Imports needed to test socket
import { GatewayModule } from './gateway/gateway.module';
import { GatewayService } from './gateway/gateway.service';
import { ColumnModule } from './column/column.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      expandVariables: true,
    }),
    DataModule,
    GatewayModule,
    ColumnModule
  ],
  controllers: [AppController],
  providers: [AppService, GatewayService],
})
export class AppModule {}
