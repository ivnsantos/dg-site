import { MigrationInterface, QueryRunner } from "typeorm"

export class AddBackgroundEffectToLinkTree1704077000000 implements MigrationInterface {
    name = 'AddBackgroundEffectToLinkTree1704077000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Verificar se a coluna já existe
        const hasColumn = await queryRunner.hasColumn('link_trees', 'background_effect');

        if (!hasColumn) {
            await queryRunner.query(`ALTER TABLE "link_trees" ADD "background_effect" character varying(20) DEFAULT 'none'`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "link_trees" DROP COLUMN "background_effect"`);
    }
} 