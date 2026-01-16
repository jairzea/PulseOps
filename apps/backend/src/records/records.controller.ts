import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RecordsService } from './records.service';
import { CreateRecordDto, QueryRecordsDto } from './dto/record.dto';
import { DemoAuthGuard } from '../auth/guards/demo-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../common/interfaces/user.interface';

@Controller('records')
@UseGuards(DemoAuthGuard)
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  @Post()
  upsert(@Body() dto: CreateRecordDto, @CurrentUser() user: User) {
    return this.recordsService.upsert(dto, user.id);
  }

  @Get()
  findMany(@Query() query: QueryRecordsDto) {
    return this.recordsService.findMany(query);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const deleted = await this.recordsService.delete(id);
    return { deleted };
  }
}
