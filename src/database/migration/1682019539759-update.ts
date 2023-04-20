import { MigrationInterface, QueryRunner } from "typeorm";

export class Update1682019539759 implements MigrationInterface {
    name = 'Update1682019539759'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."User_role_enum" RENAME TO "User_role_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."User_role_enum" AS ENUM('admin', 'tutor', 'shelter')`);
        await queryRunner.query(`ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "User" ALTER COLUMN "role" TYPE "public"."User_role_enum" USING "role"::"text"::"public"."User_role_enum"`);
        await queryRunner.query(`DROP TYPE "public"."User_role_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."User_role_enum_old" AS ENUM('admin', 'user')`);
        await queryRunner.query(`ALTER TABLE "User" ALTER COLUMN "role" TYPE "public"."User_role_enum_old" USING "role"::"text"::"public"."User_role_enum_old"`);
        await queryRunner.query(`ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'user'`);
        await queryRunner.query(`DROP TYPE "public"."User_role_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."User_role_enum_old" RENAME TO "User_role_enum"`);
    }

}
