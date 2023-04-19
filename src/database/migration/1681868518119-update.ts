import { MigrationInterface, QueryRunner } from "typeorm";

export class Update1681868518119 implements MigrationInterface {
    name = 'Update1681868518119'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "User" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password" character varying NOT NULL, "name" character varying NOT NULL, "phone" character varying, "city" character varying, "state" character varying, CONSTRAINT "UQ_4a257d2c9837248d70640b3e36e" UNIQUE ("email"), CONSTRAINT "PK_9862f679340fb2388436a5ab3e4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "Shelter" DROP CONSTRAINT "UQ_ed6fce1b7a725005c3cd2f9d84e"`);
        await queryRunner.query(`ALTER TABLE "Shelter" DROP COLUMN "email"`);
        await queryRunner.query(`ALTER TABLE "Shelter" DROP COLUMN "password"`);
        await queryRunner.query(`ALTER TABLE "Shelter" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "Shelter" DROP COLUMN "phone"`);
        await queryRunner.query(`ALTER TABLE "Shelter" DROP COLUMN "city"`);
        await queryRunner.query(`ALTER TABLE "Shelter" DROP COLUMN "state"`);
        await queryRunner.query(`ALTER TABLE "Tutor" DROP CONSTRAINT "UQ_883ad81f69495d90c5eb2a611da"`);
        await queryRunner.query(`ALTER TABLE "Tutor" DROP COLUMN "email"`);
        await queryRunner.query(`ALTER TABLE "Tutor" DROP COLUMN "password"`);
        await queryRunner.query(`ALTER TABLE "Tutor" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "Tutor" DROP COLUMN "phone"`);
        await queryRunner.query(`ALTER TABLE "Tutor" DROP COLUMN "city"`);
        await queryRunner.query(`ALTER TABLE "Tutor" DROP COLUMN "state"`);
        await queryRunner.query(`ALTER TABLE "Shelter" ADD "userId" uuid`);
        await queryRunner.query(`ALTER TABLE "Shelter" ADD CONSTRAINT "UQ_07a99ced8e845bd9e3bdeba1308" UNIQUE ("userId")`);
        await queryRunner.query(`ALTER TABLE "Tutor" ADD "userId" uuid`);
        await queryRunner.query(`ALTER TABLE "Tutor" ADD CONSTRAINT "UQ_8e45762a7f90e743c1a0dac375c" UNIQUE ("userId")`);
        await queryRunner.query(`ALTER TABLE "Shelter" ADD CONSTRAINT "FK_07a99ced8e845bd9e3bdeba1308" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Tutor" ADD CONSTRAINT "FK_8e45762a7f90e743c1a0dac375c" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Tutor" DROP CONSTRAINT "FK_8e45762a7f90e743c1a0dac375c"`);
        await queryRunner.query(`ALTER TABLE "Shelter" DROP CONSTRAINT "FK_07a99ced8e845bd9e3bdeba1308"`);
        await queryRunner.query(`ALTER TABLE "Tutor" DROP CONSTRAINT "UQ_8e45762a7f90e743c1a0dac375c"`);
        await queryRunner.query(`ALTER TABLE "Tutor" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "Shelter" DROP CONSTRAINT "UQ_07a99ced8e845bd9e3bdeba1308"`);
        await queryRunner.query(`ALTER TABLE "Shelter" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "Tutor" ADD "state" character varying`);
        await queryRunner.query(`ALTER TABLE "Tutor" ADD "city" character varying`);
        await queryRunner.query(`ALTER TABLE "Tutor" ADD "phone" character varying`);
        await queryRunner.query(`ALTER TABLE "Tutor" ADD "name" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "Tutor" ADD "password" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "Tutor" ADD "email" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "Tutor" ADD CONSTRAINT "UQ_883ad81f69495d90c5eb2a611da" UNIQUE ("email")`);
        await queryRunner.query(`ALTER TABLE "Shelter" ADD "state" character varying`);
        await queryRunner.query(`ALTER TABLE "Shelter" ADD "city" character varying`);
        await queryRunner.query(`ALTER TABLE "Shelter" ADD "phone" character varying`);
        await queryRunner.query(`ALTER TABLE "Shelter" ADD "name" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "Shelter" ADD "password" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "Shelter" ADD "email" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "Shelter" ADD CONSTRAINT "UQ_ed6fce1b7a725005c3cd2f9d84e" UNIQUE ("email")`);
        await queryRunner.query(`DROP TABLE "User"`);
    }

}
