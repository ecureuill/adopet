import { MigrationInterface, QueryRunner } from "typeorm";

export class Update1681960067498 implements MigrationInterface {
    name = 'Update1681960067498'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Pet" DROP CONSTRAINT "FK_2f00147d85c6a3c48468b8749ba"`);
        await queryRunner.query(`CREATE TYPE "public"."User_role_enum" AS ENUM('admin', 'user')`);
        await queryRunner.query(`ALTER TABLE "User" ADD "role" "public"."User_role_enum" NOT NULL DEFAULT 'user'`);
        await queryRunner.query(`ALTER TABLE "Pet" ALTER COLUMN "shelterId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "Pet" ADD CONSTRAINT "FK_2f00147d85c6a3c48468b8749ba" FOREIGN KEY ("shelterId") REFERENCES "Shelter"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Pet" DROP CONSTRAINT "FK_2f00147d85c6a3c48468b8749ba"`);
        await queryRunner.query(`ALTER TABLE "Pet" ALTER COLUMN "shelterId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "User" DROP COLUMN "role"`);
        await queryRunner.query(`DROP TYPE "public"."User_role_enum"`);
        await queryRunner.query(`ALTER TABLE "Pet" ADD CONSTRAINT "FK_2f00147d85c6a3c48468b8749ba" FOREIGN KEY ("shelterId") REFERENCES "Shelter"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
