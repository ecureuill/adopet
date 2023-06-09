import { MigrationInterface, QueryRunner } from "typeorm";

export class Update1685478704140 implements MigrationInterface {
    name = 'Update1685478704140'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Tutor" DROP COLUMN "photo"`);
        await queryRunner.query(`ALTER TABLE "User" ADD "photo" bytea`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "User" DROP COLUMN "photo"`);
        await queryRunner.query(`ALTER TABLE "Tutor" ADD "photo" bytea`);
    }

}
