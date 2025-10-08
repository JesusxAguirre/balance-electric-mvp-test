import { MigrationInterface, QueryRunner } from "typeorm";

export class InitDatabase1759917582340 implements MigrationInterface {
    name = 'InitDatabase1759917582340'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."balance_type_enum" AS ENUM('RENEWABLE', 'NON_RENEWABLE', 'STORAGE', 'DEMAND')`);
        await queryRunner.query(`CREATE TYPE "public"."balance_sub_type_enum" AS ENUM('HYDRAULIC', 'WIND', 'SOLAR_PHOTOVOLTAIC', 'SOLAR_THERMAL', 'HYDROEOLIC', 'OTHER_RENEWABLES', 'RENEWABLE_WASTE', 'RENEWABLE_GENERATION', 'GAS_TURBINE', 'STEAM_TURBINE', 'COGENERATION', 'PUMPING_TURBINE', 'PUMPING_CONSUMPTION', 'STORAGE_BALANCE', 'INTERNATIONAL_BALANCE')`);
        await queryRunner.query(`CREATE TABLE "balance" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."balance_type_enum" NOT NULL, "sub_type" "public"."balance_sub_type_enum" NOT NULL, "value" numeric(10,3) NOT NULL, "percentage" numeric(10,3) NOT NULL, "description" text, "date" date NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_079dddd31a81672e8143a649ca0" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "balance"`);
        await queryRunner.query(`DROP TYPE "public"."balance_sub_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."balance_type_enum"`);
    }

}
