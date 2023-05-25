import { MigrationInterface, QueryRunner } from "typeorm";

export class Update1684985044060 implements MigrationInterface {
    name = 'Update1684985044060'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "Adoption" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "petId" uuid NOT NULL, "tutorId" uuid NOT NULL, "shelterId" uuid NOT NULL, "delete_date" TIMESTAMP, "create_date" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_bdcc07fb840b9094e8b5bb86a9" UNIQUE ("petId"), CONSTRAINT "REL_0ab790c45a1b281e9237661cfc" UNIQUE ("tutorId"), CONSTRAINT "PK_134acc9347092f87bd07a74872c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "Adoption" ADD CONSTRAINT "FK_bdcc07fb840b9094e8b5bb86a98" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Adoption" ADD CONSTRAINT "FK_0ab790c45a1b281e9237661cfc2" FOREIGN KEY ("tutorId") REFERENCES "Tutor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Adoption" DROP CONSTRAINT "FK_0ab790c45a1b281e9237661cfc2"`);
        await queryRunner.query(`ALTER TABLE "Adoption" DROP CONSTRAINT "FK_bdcc07fb840b9094e8b5bb86a98"`);
        await queryRunner.query(`DROP TABLE "Adoption"`);
    }

}
