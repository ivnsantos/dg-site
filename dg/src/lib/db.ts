export const runtime = 'nodejs'

import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { User } from '../entities/User'
import { Cupom } from '../entities/Cupom'
import { Orcamento } from '../entities/Orcamento'
import { Product } from '../entities/Product'
import { Ingredient } from '../entities/Ingredient'
import { Confeitaria } from '../entities/Confeitaria'
import { Menu } from '../entities/Menu'
import { MenuSection } from '../entities/MenuSection'
import { MenuItem } from '../entities/MenuItem'
import { Cliente } from '../entities/Cliente'
import { ItemOrcamento } from '../entities/ItemOrcamento'
import { HeaderOrcamento } from '../entities/HeaderOrcamento'
import { FooterOrcamento } from '../entities/FooterOrcamento'
import { FichaTecnica } from '../entities/FichaTecnica'

// Garantir que as variáveis de ambiente existam
const DB_HOST = '34.95.241.82'
const DB_PORT = 5432
const DB_USER = 'postgres'
const DB_PASSWORD = 'dg77pyuio'
const DB_NAME = 'postgres'

// Criar uma instância única do DataSource
let AppDataSource: DataSource | null = null

export function getDataSource() {
    if (!AppDataSource) {
        AppDataSource = new DataSource({
            type: 'postgres',
            host: DB_HOST,
            port: DB_PORT,
            username: DB_USER,
            password: DB_PASSWORD,
            database: DB_NAME,
            entities: [
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
            ],
            synchronize: false,
            logging: true, // Ativar logging para debug
            extra: {
                max: 20,
                min: 5,
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 2000
            }
        })
    }
    return AppDataSource
}

export async function initializeDB() {
    try {
        const dataSource = getDataSource()
        if (!dataSource.isInitialized) {
            console.log("Initializing database connection...")
            console.log("Entities to be loaded:", [
                'User',
                'Cupom',
                'Orcamento',
                'Product',
                'Ingredient',
                'Confeitaria',
                'Menu',
                'MenuSection',
                'MenuItem',
                'Cliente',
                'ItemOrcamento',
                'HeaderOrcamento',
                'FooterOrcamento',
                'FichaTecnica'
            ])
            
            await dataSource.initialize()
            console.log("Database connection initialized successfully")
            console.log("Loaded entities:", dataSource.entityMetadatas.map(metadata => metadata.name))
        }
        return dataSource
    } catch (error) {
        console.error("Error during database initialization:", error)
        throw error
    }
}

export async function closeDB() {
    try {
        const dataSource = getDataSource()
        if (dataSource.isInitialized) {
            await dataSource.destroy()
            console.log("Database connection closed")
        }
    } catch (error) {
        console.error("Error closing database connection:", error)
        throw error
    }
} 