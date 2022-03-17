import { Module } from '@nestjs/common';
import { DataModule } from 'src/data/data.module';
import { ColumnController } from './column.controller';
import { ColumnService } from './column.service';

@Module({
  imports: [DataModule],
  controllers: [ColumnController],
  providers: [ColumnService],
})
export class ColumnModule {}
