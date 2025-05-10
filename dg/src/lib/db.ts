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

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'dg',
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
        await AppDataSource.initialize()
    }
    return AppDataSource
}

export async function closeDB() {
    if (AppDataSource.isInitialized) {
        await AppDataSource.destroy()
        console.log("Database connection closed")
    }
} 