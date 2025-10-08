import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { Balance } from "./entities/balance.entity";

@Injectable()
export class BalanceRepository extends Repository<Balance> {
  constructor(private dataSource: DataSource) {
    super(Balance, dataSource.manager);
  }

  // here we will implement the common functions uses in service
  
}
