import { Controller, Get } from '@nestjs/common';
import { ColumnService } from './column.service';
import { Response } from './interfaces';

@Controller('column')
export class ColumnController {
    constructor(private columnService: ColumnService) { }

    @Get()
    async getColumn(): Promise<Response> {
        const column = await this.columnService.getColumns();
        return { column };
    }
}
