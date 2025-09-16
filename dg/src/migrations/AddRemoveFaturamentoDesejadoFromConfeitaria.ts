import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRemoveFaturamentoDesejadoFromConfeitaria1699999999999 implements MigrationInterface {
  name = 'AddRemoveFaturamentoDesejadoFromConfeitaria1699999999999'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop column faturamentoDesejado if exists
    await queryRunner.query(`ALTER TABLE confeitarias DROP COLUMN IF EXISTS "faturamentoDesejado"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Restore column as nullable decimal
    await queryRunner.query(`ALTER TABLE confeitarias ADD COLUMN "faturamentoDesejado" decimal(10,2) NULL`);
  }
}


