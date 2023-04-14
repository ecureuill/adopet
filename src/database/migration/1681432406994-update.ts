import { MigrationInterface, QueryRunner } from "typeorm";

export class Update1681432406994 implements MigrationInterface {
    name = 'Update1681432406994'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Pet" ALTER COLUMN "adopted" SET DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Pet" ALTER COLUMN "adopted" DROP DEFAULT`);
    }

}
