export const runtime = 'nodejs'

import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "../entities/User"
import { Product } from "../entities/Product"
import { Confeitaria } from "../entities/Confeitaria"
import { Cupom } from "../entities/Cupom"
import { Ingredient } from "../entities/Ingredient"
import { FichaTecnica } from "../entities/FichaTecnica"
import { Menu } from "../entities/Menu"
import { MenuSection } from "../entities/MenuSection"
import { MenuItem } from "../entities/MenuItem"
import { Orcamento } from "../entities/Orcamento"
import { Cliente } from "../entities/Cliente"
import { ItemOrcamento } from "../entities/ItemOrcamento"
import { HeaderOrcamento } from "../entities/HeaderOrcamento"
import { FooterOrcamento } from "../entities/FooterOrcamento"

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    synchronize: process.env.NODE_ENV !== "production",
    logging: process.env.NODE_ENV !== "production",
    entities: [User, Product, Confeitaria, Cupom, Ingredient, FichaTecnica, Menu, MenuSection, MenuItem, Cliente, Orcamento, ItemOrcamento, HeaderOrcamento, FooterOrcamento],
    migrations: [],
    subscribers: [],
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    extra: {
        // Desabilita drivers desnecessários
        driver: 'pg',
        // Otimizações para PostgreSQL
        max: 20, // Máximo de conexões no pool
        idleTimeoutMillis: 30000, // Tempo máximo que uma conexão pode ficar ociosa
        connectionTimeoutMillis: 2000 // Tempo máximo para estabelecer uma conexão
    }
});

// Função para inicializar o banco de dados
export async function initializeDB() {
    try {
        // Se já estiver inicializado, retorna a instância existente
        if (AppDataSource.isInitialized) {
            return AppDataSource
        }

        // Tenta conectar ao banco principal
        try {
            await AppDataSource.initialize()
            console.log("Banco de dados inicializado com sucesso")
            return AppDataSource
        } catch (error: any) {
            // Se o erro for que o banco não existe, tenta criar
            if (error.message.includes('database "dg" does not exist')) {
                console.log("Criando banco de dados...")
                
                // Conecta ao banco postgres para criar o banco dg
                const tempDataSource = new DataSource({
                    type: "postgres",
                    host: process.env.DB_HOST,
                    port: parseInt(process.env.DB_PORT || "5432"),
                    username: process.env.DB_USER,
                    password: process.env.DB_PASS,
                    database: "postgres" // Conecta ao banco padrão postgres
                })

                await tempDataSource.initialize()
                await tempDataSource.query('CREATE DATABASE dg')
                await tempDataSource.destroy()

                // Tenta conectar novamente ao banco dg
                await AppDataSource.initialize()
                console.log("Banco de dados criado e inicializado com sucesso")
                return AppDataSource
            }
            
            throw error
        }
    } catch (error) {
        console.error("Erro ao inicializar o banco de dados:", error)
        throw error
    }
} 