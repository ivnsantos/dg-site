-- Script para criar a tabela de assinaturas
-- Execute este script no seu banco de dados PostgreSQL

-- Verificar se a tabela já existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_name = 'subscriptions'
    ) THEN
        -- Criar a tabela subscriptions
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
        );

        -- Criar índices
        CREATE INDEX "IDX_subscriptions_status" ON "subscriptions" ("status");
        CREATE INDEX "IDX_subscriptions_nextDueDate" ON "subscriptions" ("nextDueDate");

        -- Adicionar foreign key
        ALTER TABLE "subscriptions" 
        ADD CONSTRAINT "FK_subscriptions_userId" 
        FOREIGN KEY ("userId") 
        REFERENCES "users"("id") 
        ON DELETE CASCADE 
        ON UPDATE NO ACTION;

        RAISE NOTICE 'Tabela subscriptions criada com sucesso';
    ELSE
        RAISE NOTICE 'Tabela subscriptions já existe';
    END IF;
END $$; 