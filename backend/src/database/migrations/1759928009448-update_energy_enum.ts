import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateEnergyEnum1759928009448 implements MigrationInterface {
    name = 'UpdateEnergyEnum1759928009448'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."balance_sub_type_enum" RENAME TO "balance_sub_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."balance_sub_type_enum" AS ENUM('HYDRAULIC', 'WIND', 'SOLAR_PHOTOVOLTAIC', 'SOLAR_THERMAL', 'HYDROEOLIC', 'OTHER_RENEWABLES', 'RENEWABLE_WASTE', 'RENEWABLE_GENERATION', 'NUCLEAR', 'COMBINED_CYCLE', 'CARBON', 'DIESEL_ENGINE', 'GAS_TURBINE', 'STEAM_TURBINE', 'COGENERATION', 'NON_RENEWABLE_WASTE', 'NON_RENEWABLE_GENERATION', 'PUMPING_TURBINE', 'PUMPING_CONSUMPTION', 'STORAGE_BALANCE', 'INTERNATIONAL_BALANCE', 'BC_DEMAND')`);
        await queryRunner.query(`ALTER TABLE "balance" ALTER COLUMN "sub_type" TYPE "public"."balance_sub_type_enum" USING "sub_type"::"text"::"public"."balance_sub_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."balance_sub_type_enum_old"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_00d149aa3cd572b9754160bd99" ON "balance" ("type", "sub_type", "date") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_00d149aa3cd572b9754160bd99"`);
        await queryRunner.query(`CREATE TYPE "public"."balance_sub_type_enum_old" AS ENUM('HYDRAULIC', 'WIND', 'SOLAR_PHOTOVOLTAIC', 'SOLAR_THERMAL', 'HYDROEOLIC', 'OTHER_RENEWABLES', 'RENEWABLE_WASTE', 'RENEWABLE_GENERATION', 'GAS_TURBINE', 'STEAM_TURBINE', 'COGENERATION', 'PUMPING_TURBINE', 'PUMPING_CONSUMPTION', 'STORAGE_BALANCE', 'INTERNATIONAL_BALANCE')`);
        await queryRunner.query(`ALTER TABLE "balance" ALTER COLUMN "sub_type" TYPE "public"."balance_sub_type_enum_old" USING "sub_type"::"text"::"public"."balance_sub_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."balance_sub_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."balance_sub_type_enum_old" RENAME TO "balance_sub_type_enum"`);
    }

}
