import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateInitialTables1709747000000 implements MigrationInterface {
    name = 'CreateInitialTables1709747000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "user" (
                "id" SERIAL PRIMARY KEY,
                "name" character varying NOT NULL,
                "email" character varying NOT NULL UNIQUE,
                "password" character varying NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now()
            )
        `)

        await queryRunner.query(`
            CREATE TABLE "product" (
                "id" SERIAL PRIMARY KEY,
                "name" character varying NOT NULL,
                "quantity" integer NOT NULL,
                "price" decimal(10,2) NOT NULL,
                "category" character varying NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now()
            )
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "product"`)
        await queryRunner.query(`DROP TABLE "user"`)
    }
} 