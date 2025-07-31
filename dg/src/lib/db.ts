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

// Configuração do DataSource com configurações mais robustas
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
    logging: false, // Reduz logs para melhor performance
    extra: {
        max: 20,
        min: 5,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000, // Aumentado para 10s
        ssl: process.env.NODE_ENV === 'production' ? {
            rejectUnauthorized: false
        } : false
    },
    acquireTimeout: 10000, // Timeout para adquirir conexão
    timeout: 10000, // Timeout geral
    pool: {
        max: 20,
        min: 5,
        acquire: 10000,
        idle: 30000
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

// Função para testar se a conexão está ativa
async function testConnection(dataSource: DataSource): Promise<boolean> {
    try {
        await dataSource.query('SELECT 1')
        return true
    } catch (error) {
        console.warn('Connection test failed:', error)
        return false
    }
}

// Função para inicializar o banco de dados com retry
export async function initializeDB(retryCount = 0): Promise<DataSource> {
    const maxRetries = 3
    
    try {
        const dataSource = getDataSource()
        
        // Se já está inicializado, testa a conexão
        if (dataSource.isInitialized) {
            const isConnected = await testConnection(dataSource)
            if (isConnected) {
                return dataSource
            } else {
                console.warn("Database connection lost, reinitializing...")
                try {
                    await dataSource.destroy()
                } catch (destroyError) {
                    console.warn("Error destroying old connection:", destroyError)
                }
                AppDataSource = null
            }
        }
        
        console.log("Initializing database connection...")
        const newDataSource = getDataSource()
        await newDataSource.initialize()
        
        // Testa a conexão após inicializar
        const isConnected = await testConnection(newDataSource)
        if (!isConnected) {
            throw new Error('Connection test failed after initialization')
        }
        
        console.log("Database connection initialized successfully")
        return newDataSource
        
    } catch (error) {
        console.error(`Database initialization attempt ${retryCount + 1} failed:`, error)
        
        // Tenta novamente se ainda não atingiu o limite
        if (retryCount < maxRetries) {
            console.log(`Retrying database connection in 2 seconds... (${retryCount + 1}/${maxRetries})`)
            await new Promise(resolve => setTimeout(resolve, 2000))
            return initializeDB(retryCount + 1)
        }
        
        throw new Error(`Failed to initialize database after ${maxRetries + 1} attempts: ${error}`)
    }
}

// Função para fechar a conexão
export async function closeDB() {
    try {
        const dataSource = getDataSource()
        if (dataSource.isInitialized) {
            await dataSource.destroy()
            AppDataSource = null
            console.log("Database connection closed")
        }
    } catch (error) {
        console.error("Error closing database connection:", error)
        throw error
    }
} 