import { MigrationInterface, QueryRunner } from "typeorm";

export class Update1684787133096 implements MigrationInterface {
    name = 'Update1684787133096'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Tutor" ADD "delete_date" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Tutor" DROP COLUMN "delete_date"`);
    }

}
