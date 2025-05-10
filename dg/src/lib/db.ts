export const runtime = 'nodejs'

import 'reflect-metadata'
import { DataSource } from 'typeorm'
import {
    User,
    Cupom,
    Orcamento,
    Product,
    Ingredient,
    Confeitaria,
    Menu,
    MenuSection,
    MenuItem,
    Cliente,
    ItemOrcamento,
    HeaderOrcamento,
    FooterOrcamento,
    FichaTecnica
} from '../entities'

// Garantir que as variáveis de ambiente existam
const DB_HOST = '34.95.241.82'
const DB_PORT = 5432
const DB_USER = 'postgres'
const DB_PASSWORD = 'dg77pyuio'
const DB_NAME = 'postgres'

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: DB_HOST,
    port: DB_PORT,
    username: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    entities: [__dirname + '/../entities/*.{ts,js}'],
    synchronize: process.env.NODE_ENV === 'development',
    logging: process.env.NODE_ENV === 'development',
    extra: {
        max: 20,
        min: 5,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000
    }
})

export async function initializeDB() {
    if (!AppDataSource.isInitialized) {
        try {
            await AppDataSource.initialize()
            console.log("Database connection initialized successfully")
        } catch (error) {
            console.error("Error during database initialization:", error)
            throw error
        }
    }
    return AppDataSource
}

export async function closeDB() {
    if (AppDataSource.isInitialized) {
        await AppDataSource.destroy()
        console.log("Database connection closed")
    }
} 