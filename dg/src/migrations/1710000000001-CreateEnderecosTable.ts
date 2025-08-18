import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateEnderecosTable1710000000001 implements MigrationInterface {
    name = 'CreateEnderecosTable1710000000001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Criar tabela de endereços
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "enderecos_dg" (
                "id" SERIAL PRIMARY KEY,
                "cliente_id" INTEGER NOT NULL,
                "cep" VARCHAR(9),
                "endereco" VARCHAR(200) NOT NULL,
                "bairro" VARCHAR(100) NOT NULL,
                "cidade" VARCHAR(100) NOT NULL,
                "estado" VARCHAR(2) NOT NULL,
                "complemento" VARCHAR(100),
                "referencia" VARCHAR(100),
                "ativo" BOOLEAN DEFAULT true,
                "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `)

        // Criar índices
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_enderecos_cliente_id" ON "enderecos_dg"("cliente_id")
        `)
        
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_enderecos_ativo" ON "enderecos_dg"("ativo")
        `)

        // Adicionar chave estrangeira
        await queryRunner.query(`
            ALTER TABLE "enderecos_dg" 
            ADD CONSTRAINT "fk_enderecos_cliente" 
            FOREIGN KEY ("cliente_id") REFERENCES "clientes_dg"("id") ON DELETE CASCADE
        `)

        // Adicionar coluna ativo na tabela de clientes se não existir
        await queryRunner.query(`
            ALTER TABLE "clientes_dg" 
            ADD COLUMN IF NOT EXISTS "ativo" BOOLEAN DEFAULT true
        `)

        // Criar índice para a coluna ativo na tabela de clientes
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_clientes_ativo" ON "clientes_dg"("ativo")
        `)

        // Remover colunas de endereço da tabela de clientes se existirem
        await queryRunner.query(`
            ALTER TABLE "clientes_dg" DROP COLUMN IF EXISTS "cep"
        `)
        
        await queryRunner.query(`
            ALTER TABLE "clientes_dg" DROP COLUMN IF EXISTS "endereco"
        `)
        
        await queryRunner.query(`
            ALTER TABLE "clientes_dg" DROP COLUMN IF EXISTS "bairro"
        `)
        
        await queryRunner.query(`
            ALTER TABLE "clientes_dg" DROP COLUMN IF EXISTS "cidade"
        `)
        
        await queryRunner.query(`
            ALTER TABLE "clientes_dg" DROP COLUMN IF EXISTS "estado"
        `)
        
        await queryRunner.query(`
            ALTER TABLE "clientes_dg" DROP COLUMN IF EXISTS "complemento"
        `)
        
        await queryRunner.query(`
            ALTER TABLE "clientes_dg" DROP COLUMN IF EXISTS "referencia"
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remover chave estrangeira
        await queryRunner.query(`
            ALTER TABLE "enderecos_dg" DROP CONSTRAINT IF EXISTS "fk_enderecos_cliente"
        `)

        // Remover índices
        await queryRunner.query(`
            DROP INDEX IF EXISTS "idx_enderecos_ativo"
        `)
        
        await queryRunner.query(`
            DROP INDEX IF EXISTS "idx_enderecos_cliente_id"
        `)

        // Remover tabela de endereços
        await queryRunner.query(`
            DROP TABLE IF EXISTS "enderecos_dg"
        `)

        // Remover índice da tabela de clientes
        await queryRunner.query(`
            DROP INDEX IF EXISTS "idx_clientes_ativo"
        `)

        // Remover coluna ativo da tabela de clientes
        await queryRunner.query(`
            ALTER TABLE "clientes_dg" DROP COLUMN IF EXISTS "ativo"
        `)
    }
}
