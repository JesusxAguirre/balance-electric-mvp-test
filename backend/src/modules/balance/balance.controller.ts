import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { BalanceService } from './balance.service';
import { CreateBalanceDto } from './dto/create-balance.dto';
import { UpdateBalanceDto } from './dto/update-balance.dto';
import { GetRefreshDto } from './dto/get-refresh.dto';

@Controller('balance')
export class BalanceController {
  constructor(private readonly balanceService: BalanceService) {}

  @Get('refresh')
  refresh(@Query() q: GetRefreshDto) {
    return this.balanceService.refreshData(q.start_date, q.end_date);
  }

  @Get()
  findAll() {
    return this.balanceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.balanceService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.balanceService.remove(id);
  }
}
