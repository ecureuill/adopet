import { MigrationInterface, QueryRunner } from "typeorm";

export class initial1681240385100 implements MigrationInterface {
    name = 'initial1681240385100'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "Shelter" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password" character varying NOT NULL, "name" character varying NOT NULL, "phone" character varying, "city" character varying, "state" character varying, CONSTRAINT "UQ_ed6fce1b7a725005c3cd2f9d84e" UNIQUE ("email"), CONSTRAINT "PK_c57456c9209d25e8371aab9905e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."Pet_age_unit_enum" AS ENUM('d', 'm', 'y')`);
        await queryRunner.query(`CREATE TYPE "public"."Pet_size_variety_enum" AS ENUM('xxs', 'xs', 's', 'm', 'l', 'xl')`);
        await queryRunner.query(`CREATE TYPE "public"."Pet_type_enum" AS ENUM('dog', 'cat')`);
        await queryRunner.query(`CREATE TABLE "Pet" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "age" integer NOT NULL, "age_unit" "public"."Pet_age_unit_enum" NOT NULL DEFAULT 'y', "size_variety" "public"."Pet_size_variety_enum" NOT NULL DEFAULT 'm', "type" "public"."Pet_type_enum" NOT NULL DEFAULT 'cat', "adopted" boolean NOT NULL, "photo" bytea, "create_date" TIMESTAMP NOT NULL DEFAULT now(), "update_date" TIMESTAMP NOT NULL DEFAULT now(), "shelterId" uuid, CONSTRAINT "PK_f3a87a15b3b82516f66f1fd2d6a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Tutor" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password" character varying NOT NULL, "name" character varying NOT NULL, "phone" character varying, "city" character varying, "state" character varying, "photo" bytea, "about" text, CONSTRAINT "UQ_883ad81f69495d90c5eb2a611da" UNIQUE ("email"), CONSTRAINT "PK_26afb6131ef3b2c14aa7c70680f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "FavoriteList" ("tutorId" uuid NOT NULL, "petId" uuid NOT NULL, CONSTRAINT "PK_f6ca2d65ec5746ec2945b2de5c0" PRIMARY KEY ("tutorId", "petId"))`);
        await queryRunner.query(`ALTER TABLE "Pet" ADD CONSTRAINT "FK_2f00147d85c6a3c48468b8749ba" FOREIGN KEY ("shelterId") REFERENCES "Shelter"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "FavoriteList" ADD CONSTRAINT "FK_ad5186a13389f94195efff1499d" FOREIGN KEY ("tutorId") REFERENCES "Tutor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "FavoriteList" ADD CONSTRAINT "FK_59f5da334d1a6ba7925c9004939" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "FavoriteList" DROP CONSTRAINT "FK_59f5da334d1a6ba7925c9004939"`);
        await queryRunner.query(`ALTER TABLE "FavoriteList" DROP CONSTRAINT "FK_ad5186a13389f94195efff1499d"`);
        await queryRunner.query(`ALTER TABLE "Pet" DROP CONSTRAINT "FK_2f00147d85c6a3c48468b8749ba"`);
        await queryRunner.query(`DROP TABLE "FavoriteList"`);
        await queryRunner.query(`DROP TABLE "Tutor"`);
        await queryRunner.query(`DROP TABLE "Pet"`);
        await queryRunner.query(`DROP TYPE "public"."Pet_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."Pet_size_variety_enum"`);
        await queryRunner.query(`DROP TYPE "public"."Pet_age_unit_enum"`);
        await queryRunner.query(`DROP TABLE "Shelter"`);
    }

}
