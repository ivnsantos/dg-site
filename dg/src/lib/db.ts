export const runtime = 'nodejs'

import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { User } from './../entities/User'
import { Cupom } from './../entities/Cupom'
import { Orcamento } from './../entities/Orcamento'
import { Product } from './../entities/Product'
import { Ingredient } from './../entities/Ingredient'
import { Confeitaria } from './../entities/Confeitaria'
import { Menu } from './../entities/Menu'
import { MenuSection } from './../entities/MenuSection'
import { MenuItem } from './../entities/MenuItem'
import { Cliente } from './../entities/Cliente'
import { ItemOrcamento } from './../entities/ItemOrcamento'
import { HeaderOrcamento } from './../entities/HeaderOrcamento'
import { FooterOrcamento } from './../entities/FooterOrcamento'
import { FichaTecnica } from './../entities/FichaTecnica'

// Configuração do DataSource
const dataSourceConfig = {
    type: 'postgres' as const,
    url: process.env.DATABASE_URL,
    entities: [
        User,
        Cupom,
        Orcamento,
        Product,
        Confeitaria,
        Menu,
        MenuSection,
        MenuItem,
        Cliente,
        ItemOrcamento,
        HeaderOrcamento,
        FooterOrcamento,
        Ingredient,
        FichaTecnica
    ],
    synchronize: false,
    logging: true,
    extra: {
        max: 20,
        min: 5,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
        ssl: {
            rejectUnauthorized: false
        }
    }
}

// Criar uma instância única do DataSource
let AppDataSource: DataSource | null = null

// Função para obter a instância do DataSource
export function getDataSource() {
    if (!AppDataSource) {
        AppDataSource = new DataSource(dataSourceConfig)
    }
    return AppDataSource
}

// Função para inicializar o banco de dados
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

// Função para fechar a conexão
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