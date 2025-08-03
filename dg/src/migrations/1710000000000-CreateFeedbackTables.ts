import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm"

export class CreateFeedbackTables1710000000000 implements MigrationInterface {
    name = 'CreateFeedbackTables1710000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Criar tabela de questionários de feedback
        await queryRunner.createTable(
            new Table({
                name: "feedbacks",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                    },
                    {
                        name: "title",
                        type: "varchar",
                        length: "255",
                    },
                    {
                        name: "question",
                        type: "text",
                    },
                    {
                        name: "options",
                        type: "text",
                    },
                    {
                        name: "description",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "code",
                        type: "varchar",
                        length: "50",
                        isUnique: true,
                    },
                    {
                        name: "status",
                        type: "enum",
                        enum: ["ACTIVE", "INACTIVE"],
                        default: "'ACTIVE'",
                    },
                    {
                        name: "userId",
                        type: "int",
                    },
                    {
                        name: "createdAt",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP",
                    },
                    {
                        name: "updatedAt",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP",
                        onUpdate: "CURRENT_TIMESTAMP",
                    },
                ],
            }),
            true
        )

        // Criar tabela de respostas de feedback
        await queryRunner.createTable(
            new Table({
                name: "feedback_responses",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                    },
                    {
                        name: "feedbackId",
                        type: "int",
                    },
                    {
                        name: "selectedOption",
                        type: "varchar",
                        length: "255",
                    },
                    {
                        name: "textResponse",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "clientName",
                        type: "varchar",
                        length: "255",
                        isNullable: true,
                    },
                    {
                        name: "clientEmail",
                        type: "varchar",
                        length: "255",
                        isNullable: true,
                    },
                    {
                        name: "createdAt",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP",
                    },
                ],
            }),
            true
        )

        // Adicionar foreign keys
        await queryRunner.createForeignKey(
            "feedbacks",
            new TableForeignKey({
                columnNames: ["userId"],
                referencedColumnNames: ["id"],
                referencedTableName: "users",
                onDelete: "CASCADE",
            })
        )

        await queryRunner.createForeignKey(
            "feedback_responses",
            new TableForeignKey({
                columnNames: ["feedbackId"],
                referencedColumnNames: ["id"],
                referencedTableName: "feedbacks",
                onDelete: "CASCADE",
            })
        )

        // Criar índices para melhor performance
        await queryRunner.query(`CREATE INDEX IDX_feedbacks_userId ON feedbacks (userId)`)
        await queryRunner.query(`CREATE INDEX IDX_feedbacks_code ON feedbacks (code)`)
        await queryRunner.query(`CREATE INDEX IDX_feedbacks_status ON feedbacks (status)`)
        await queryRunner.query(`CREATE INDEX IDX_feedback_responses_feedbackId ON feedback_responses (feedbackId)`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remover foreign keys
        const feedbacksTable = await queryRunner.getTable("feedbacks")
        const feedbackResponsesTable = await queryRunner.getTable("feedback_responses")
        
        if (feedbacksTable) {
            const foreignKey = feedbacksTable.foreignKeys.find(fk => fk.columnNames.indexOf("userId") !== -1)
            if (foreignKey) {
                await queryRunner.dropForeignKey("feedbacks", foreignKey)
            }
        }

        if (feedbackResponsesTable) {
            const foreignKey = feedbackResponsesTable.foreignKeys.find(fk => fk.columnNames.indexOf("feedbackId") !== -1)
            if (foreignKey) {
                await queryRunner.dropForeignKey("feedback_responses", foreignKey)
            }
        }

        // Remover tabelas
        await queryRunner.dropTable("feedback_responses")
        await queryRunner.dropTable("feedbacks")
    }
} 