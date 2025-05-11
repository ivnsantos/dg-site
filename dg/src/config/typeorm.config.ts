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
import { AddUserIdToIngredient1710000000000 } from '../migrations/1710000000000-AddUserIdToIngredient'

// Garantir que as variáveis de ambiente existam
const DB_HOST = '34.95.241.82'
const DB_PORT = 5432
const DB_USER = 'postgres'
const DB_PASSWORD = 'dg77pyuio'
const DB_NAME = 'postgres'

const AppDataSource = new DataSource({
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
    migrations: [AddUserIdToIngredient1710000000000],
    migrationsRun: true,
    synchronize: false,
    logging: true
})

export default AppDataSource 