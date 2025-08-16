import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm"

export class CreateAgendaTable1709747000001 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "agenda_items",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                    },
                    {
                        name: "type",
                        type: "enum",
                        enum: ["anotacao", "encomenda"],
                        default: "'anotacao'",
                    },
                    {
                        name: "title",
                        type: "varchar",
                        length: "255",
                    },
                    {
                        name: "description",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "startDate",
                        type: "date",
                    },
                    {
                        name: "endDate",
                        type: "date",
                    },
                    {
                        name: "priority",
                        type: "enum",
                        enum: ["baixa", "media", "alta"],
                        default: "'media'",
                    },
                    {
                        name: "status",
                        type: "enum",
                        enum: ["pendente", "em-andamento", "concluido"],
                        default: "'pendente'",
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

        // Criar foreign key para users
        await queryRunner.createForeignKey(
            "agenda_items",
            new TableForeignKey({
                columnNames: ["userId"],
                referencedColumnNames: ["id"],
                referencedTableName: "users",
                onDelete: "CASCADE",
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("agenda_items")
    }
} 