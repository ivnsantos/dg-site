import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateSubscriptionTable1704078000000 implements MigrationInterface {
    name = 'CreateSubscriptionTable1704078000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "subscriptions" (
                "id" SERIAL NOT NULL,
                "externalId" character varying(100) NOT NULL,
                "customerId" character varying(100),
                "value" decimal(10,2) NOT NULL,
                "cycle" character varying(10) NOT NULL,
                "description" text,
                "billingType" character varying(20) NOT NULL,
                "status" character varying(20) NOT NULL,
                "deleted" boolean NOT NULL DEFAULT false,
                "dateCreated" date,
                "nextDueDate" date,
                "endDate" date,
                "externalReference" character varying(255),
                "paymentLink" character varying(255),
                "checkoutSession" character varying(255),
                "creditCardNumber" character varying(4),
                "creditCardBrand" character varying(20),
                "creditCardToken" character varying(100),
                "userId" integer NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_subscriptions_externalId" UNIQUE ("externalId"),
                CONSTRAINT "UQ_subscriptions_userId" UNIQUE ("userId"),
                CONSTRAINT "PK_subscriptions" PRIMARY KEY ("id")
            )
        `)

        // Criar índices
        await queryRunner.query(`CREATE INDEX "IDX_subscriptions_status" ON "subscriptions" ("status")`)
        await queryRunner.query(`CREATE INDEX "IDX_subscriptions_nextDueDate" ON "subscriptions" ("nextDueDate")`)

        // Adicionar foreign key
        await queryRunner.query(`
            ALTER TABLE "subscriptions" 
            ADD CONSTRAINT "FK_subscriptions_userId" 
            FOREIGN KEY ("userId") 
            REFERENCES "users"("id") 
            ON DELETE CASCADE 
            ON UPDATE NO ACTION
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remover foreign key
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_subscriptions_userId"`)
        
        // Remover índices
        await queryRunner.query(`DROP INDEX "IDX_subscriptions_nextDueDate"`)
        await queryRunner.query(`DROP INDEX "IDX_subscriptions_status"`)
        
        // Remover tabela
        await queryRunner.query(`DROP TABLE "subscriptions"`)
    }
} 