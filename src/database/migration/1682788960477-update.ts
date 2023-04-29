import { MigrationInterface, QueryRunner } from "typeorm";

export class Update1682788960477 implements MigrationInterface {
    name = 'Update1682788960477'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "User" ADD "delete_date" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "Shelter" ADD "inactive" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "Shelter" ADD "delete_date" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "Pet" ADD "delete_date" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "Shelter" DROP CONSTRAINT "FK_07a99ced8e845bd9e3bdeba1308"`);
        await queryRunner.query(`ALTER TABLE "Shelter" ALTER COLUMN "userId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "Tutor" DROP CONSTRAINT "FK_8e45762a7f90e743c1a0dac375c"`);
        await queryRunner.query(`ALTER TABLE "Tutor" ALTER COLUMN "userId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "Shelter" ADD CONSTRAINT "FK_07a99ced8e845bd9e3bdeba1308" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Tutor" ADD CONSTRAINT "FK_8e45762a7f90e743c1a0dac375c" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Tutor" DROP CONSTRAINT "FK_8e45762a7f90e743c1a0dac375c"`);
        await queryRunner.query(`ALTER TABLE "Shelter" DROP CONSTRAINT "FK_07a99ced8e845bd9e3bdeba1308"`);
        await queryRunner.query(`ALTER TABLE "Tutor" ALTER COLUMN "userId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "Tutor" ADD CONSTRAINT "FK_8e45762a7f90e743c1a0dac375c" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Shelter" ALTER COLUMN "userId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "Shelter" ADD CONSTRAINT "FK_07a99ced8e845bd9e3bdeba1308" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Pet" DROP COLUMN "delete_date"`);
        await queryRunner.query(`ALTER TABLE "Shelter" DROP COLUMN "delete_date"`);
        await queryRunner.query(`ALTER TABLE "Shelter" DROP COLUMN "inactive"`);
        await queryRunner.query(`ALTER TABLE "User" DROP COLUMN "delete_date"`);
    }

}
