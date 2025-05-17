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

const AppDataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
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
    migrations: ['src/migrations/*.ts'],
    synchronize: false,
    logging: true,
    ssl: {
        rejectUnauthorized: false
    }
})

export default AppDataSource 