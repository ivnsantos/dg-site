import { MigrationInterface, QueryRunner } from "typeorm"

export class AddImageUrlToLinkTree1704076000000 implements MigrationInterface {
    name = 'AddImageUrlToLinkTree1704076000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Verificar se a coluna já existe
        const hasColumn = await queryRunner.hasColumn('link_trees', 'image_url');
        
        if (!hasColumn) {
            await queryRunner.query(`ALTER TABLE "link_trees" ADD "image_url" character varying(500)`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "link_trees" DROP COLUMN "image_url"`);
    }
} 