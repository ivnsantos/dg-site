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
import { LinkTree } from '../entities/LinkTree'
import { LinkTreeLink } from '../entities/LinkTreeLink'
import { Subscription } from '../entities/Subscription'
import { Feedback } from '../entities/Feedback'
import { FeedbackResponse } from '../entities/FeedbackResponse'

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
        FichaTecnica,
        LinkTree,
        LinkTreeLink,
        Subscription,
        Feedback,
        FeedbackResponse
    ],
    synchronize: true,
    logging: false,
    extra: {
        max: 5,
        min: 0,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
        acquireTimeoutMillis: 10000,
        ssl: process.env.NODE_ENV === 'production' ? {
            rejectUnauthorized: false
        } : false
    }
}

// Instância única do DataSource
let AppDataSource: DataSource | null = null
let initializationPromise: Promise<DataSource> | null = null

// Função para inicializar o banco de dados
export async function initializeDB(): Promise<DataSource> {
    // Se já está inicializado e funcionando, retorna
    if (AppDataSource && AppDataSource.isInitialized) {
        try {
            // Testa se a conexão ainda está ativa
            await AppDataSource.query('SELECT 1')
            return AppDataSource
        } catch (error) {
            console.warn('Connection test failed, reinitializing...')
            AppDataSource = null
            initializationPromise = null
        }
    }

    // Se já está inicializando, aguarda
    if (initializationPromise) {
        return initializationPromise
    }

    // Inicia nova inicialização
    initializationPromise = (async () => {
        try {
            console.log("Initializing database connection...")
            
            // Cria nova instância
            AppDataSource = new DataSource(dataSourceConfig)
            await AppDataSource.initialize()
            
            console.log("Database connection initialized successfully")
            return AppDataSource
            
        } catch (error) {
            console.error("Database initialization failed:", error)
            AppDataSource = null
            throw error
        } finally {
            initializationPromise = null
        }
    })()

    return initializationPromise
}

// Função para obter o DataSource (inicializa se necessário)
export async function getDataSource(): Promise<DataSource> {
    if (!AppDataSource || !AppDataSource.isInitialized) {
        return initializeDB()
    }
    return AppDataSource
}

// Função para fechar a conexão (apenas quando necessário)
export async function closeDB() {
    if (AppDataSource && AppDataSource.isInitialized) {
        try {
            await AppDataSource.destroy()
            AppDataSource = null
            initializationPromise = null
            console.log("Database connection closed")
        } catch (error) {
            console.error("Error closing database connection:", error)
        }
    }
} 