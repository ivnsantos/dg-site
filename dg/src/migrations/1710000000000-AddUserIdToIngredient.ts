import { MigrationInterface, QueryRunner } from "typeorm"

export class AddUserIdToIngredient1710000000000 implements MigrationInterface {
    name = 'AddUserIdToIngredient1710000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "ingredient" 
            ADD COLUMN "user_id" integer,
            ADD CONSTRAINT "FK_ingredient_user" 
            FOREIGN KEY ("user_id") 
            REFERENCES "users"("id") 
            ON DELETE CASCADE
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "ingredient" 
            DROP CONSTRAINT "FK_ingredient_user",
            DROP COLUMN "user_id"
        `)
    }
} 