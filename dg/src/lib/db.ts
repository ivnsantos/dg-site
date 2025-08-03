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
        max: 3, // Reduzido para evitar muitas conexões
        min: 0, // Permite que o pool seja mais flexível
        idleTimeoutMillis: 60000, // Aumentado para 1 minuto
        connectionTimeoutMillis: 15000, // Aumentado para 15 segundos
        acquireTimeoutMillis: 15000, // Aumentado para 15 segundos
        ssl: process.env.NODE_ENV === 'production' ? {
            rejectUnauthorized: false
        } : false
    },
    // Configurações adicionais para melhorar a estabilidade
    poolSize: 3,
    keepConnectionAlive: true,
    connectTimeoutMS: 15000,
    socketTimeoutMS: 30000
}

// Instância única do DataSource
let AppDataSource: DataSource | null = null
let isInitializing = false

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
            // Se o teste falhou, reseta a instância
            try {
                await AppDataSource.destroy()
            } catch (destroyError) {
                console.warn('Error destroying old connection:', destroyError)
            }
            AppDataSource = null
        }
    }

    // Se já está inicializando, aguarda
    if (isInitializing) {
        while (isInitializing) {
            await new Promise(resolve => setTimeout(resolve, 100))
        }
        if (AppDataSource && AppDataSource.isInitialized) {
            return AppDataSource
        }
    }

    // Inicia nova inicialização
    isInitializing = true
    
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
        isInitializing = false
    }
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
            console.log("Database connection closed")
        } catch (error) {
            console.error("Error closing database connection:", error)
        }
    }
} 