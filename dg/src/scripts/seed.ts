import { AppDataSource } from '../config/database'
import { User } from '../entities/User'
import { Product } from '../entities/Product'
import bcrypt from 'bcryptjs'

async function main() {
  await AppDataSource.initialize()

  try {
    const userRepository = AppDataSource.getRepository(User)
    const productRepository = AppDataSource.getRepository(Product)

    // Criar usuário padrão
    const hashedPassword = await bcrypt.hash('123456', 10)
    const user = userRepository.create({
      email: 'admin@admin.com',
      name: 'Administrador',
      password: hashedPassword,
    })
    await userRepository.save(user)

    // Criar produtos de exemplo
    const products = productRepository.create([
      {
        name: 'Produto 1',
        quantity: 10,
        price: 29.99,
        category: 'Categoria A',
      },
      {
        name: 'Produto 2',
        quantity: 15,
        price: 39.99,
        category: 'Categoria B',
      },
    ])
    await productRepository.save(products)

    console.log('Dados de exemplo criados com sucesso!')
  } catch (error) {
    console.error('Erro ao criar dados de exemplo:', error)
  } finally {
    await AppDataSource.destroy()
  }
}

main() 