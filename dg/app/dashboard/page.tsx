import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '../api/auth/[...nextauth]/route'
import { LogoutButton } from './components/LogoutButton'
import { initializeDB } from '@/src/lib/db'
import { TipoPlano, User } from '@/src/entities/User'
import { MarkupAlert } from './components/MarkupAlert'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  CubeIcon,
  BeakerIcon,
  DocumentTextIcon,
  UserGroupIcon,
  Squares2X2Icon,
  ChartBarSquareIcon,
  AcademicCapIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline'
import { ExpandableSection } from './components/ExpandableSection'
import { ReactNode } from 'react'
import Link from 'next/link'
import { Ingredient } from '@/src/entities/Ingredient'
import { Product } from '@/src/entities/Product'
import { Menu } from '@/src/entities/Menu'
import { Orcamento } from '@/src/entities/Orcamento'
import { Cliente } from '@/src/entities/Cliente'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  // Inicializa o banco de dados
  const AppDataSource = await initializeDB()
  
  // Busca dados do usuário no banco
  const userRepository = AppDataSource.getRepository(User)
  const user = await userRepository.findOne({
    where: { email: session.user.email }
  })

  if (!user) {
    redirect('/login')
  }

  const userPlano = user.plano || TipoPlano.BASICO
  const isPlanoBasico = userPlano === TipoPlano.BASICO
  
  // // Busca dados de produtos
  // const productsCount = await AppDataSource.getRepository(Product).count({
  //   where: { user: { id: user.id } }
  // })

  // // Busca dados de ingredientes
  // const ingredientsCount = await AppDataSource.getRepository(Ingredient).count({
  //   where: { user: { id: user.id } }
  // })

  // // Busca dados de menus online
  // const menusCount = await AppDataSource.getRepository(Menu).count({
  //   where: { user: { id: user.id } }
  // })

  // // Busca dados de orçamentos
  // const orcamentosRepository = AppDataSource.getRepository(Orcamento)
  // const totalOrcamentos = await orcamentosRepository.count({
  //   where: { user: { id: user.id } }
  // })

  // // Busca orçamentos agrupados por status
  // const orcamentosStatus = await orcamentosRepository
  //   .createQueryBuilder('orcamento')
  //   .select('orcamento.status', 'status')
  //   .addSelect('COUNT(orcamento.id)', 'count')
  //   .where('orcamento.user = :userId', { userId: user.id })
  //   .groupBy('orcamento.status')
  //   .getRawMany()

  // // Converte para um objeto mais fácil de usar
  // const statusCounts = orcamentosStatus.reduce((acc, item) => {
  //   acc[item.status] = parseInt(item.count)
  //   return acc
  // }, {})

  // // Busca dados de clientes
  // const clientesCount = await AppDataSource.getRepository(Cliente).count({
  //   where: { user: { id: user.id } }
  // })

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-lg shadow">
          <h1 className="text-2xl font-bold text-[#111827]">Dashboard</h1>
          <LogoutButton />
        </div>

        {/* Alerta de Markup não configurado */}
        {!user?.markupIdeal && <MarkupAlert />}


        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <p className="text-[#374151] text-lg">
            Bem-vindo, <span className="font-semibold text-[#0F5132]">{session.user.name}</span>!
          </p>
        </div>

 
        {/* Tendências Culinárias - Em breve - visível para todos */}
        <ExpandableSection 
          title="Tendências Culinárias" 
          icon={<ChartBarSquareIcon className="h-6 w-6 text-blue-600" />}
          comingSoon={true}
          accentColor="bg-gradient-to-r from-blue-500 to-indigo-500"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="font-semibold text-lg mb-2 text-blue-700">Receitas Mais Buscadas</h3>
              <p className="text-sm text-blue-600">Descubra quais receitas estão em alta e são mais procuradas pelos clientes atualmente.</p>
              <div className="mt-4 space-y-2">
                <div className="text-xs text-blue-800">Em breve você verá aqui:</div>
                <ul className="text-xs text-blue-700 list-disc list-inside space-y-1">
                  <li>Top 10 receitas mais pesquisadas</li>
                  <li>Gráficos de popularidade por categoria</li>
                  <li>Análise de sazonalidade nas buscas</li>
                </ul>
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="font-semibold text-lg mb-2 text-blue-700">Produtos em Alta</h3>
              <p className="text-sm text-blue-600">Acompanhe os produtos com maior demanda e crie sua linha de acordo com o mercado.</p>
              <div className="mt-4 space-y-2">
                <div className="text-xs text-blue-800">Em breve você verá aqui:</div>
                <ul className="text-xs text-blue-700 list-disc list-inside space-y-1">
                  <li>Produtos mais vendidos no mercado</li>
                  <li>Tendências de precificação</li>
                  <li>Oportunidades de nichos específicos</li>
                </ul>
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="font-semibold text-lg mb-2 text-blue-700">Insights de Mercado</h3>
              <p className="text-sm text-blue-600">Análises de comportamento dos consumidores para ajudar na tomada de decisões.</p>
              <div className="mt-4 space-y-2">
                <div className="text-xs text-blue-800">Em breve você verá aqui:</div>
                <ul className="text-xs text-blue-700 list-disc list-inside space-y-1">
                  <li>Comparativo com concorrentes</li>
                  <li>Preferências regionais de sabores</li>
                  <li>Novos ingredientes em destaque</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-4 text-center text-sm text-gray-500">
            Em breve, você poderá visualizar dados em tempo real sobre as receitas e produtos mais buscados no mercado.
          </div>
        </ExpandableSection>

        {/* Cursos - Em breve - visível para todos */}
        <ExpandableSection 
          title="Cursos" 
          icon={<AcademicCapIcon className="h-6 w-6 text-green-600" />}
          comingSoon={true}
          accentColor="bg-gradient-to-r from-green-500 to-emerald-500"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-green-50 rounded-lg p-6 border border-green-200 flex gap-4">
              <div className="w-24 h-24 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                <AcademicCapIcon className="h-12 w-12 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1 text-green-700">Gestão de Negócios para Confeiteiros</h3>
                <p className="text-sm text-green-600 mb-3">Aprenda a precificar corretamente seus produtos, gerenciar finanças e expandir seu negócio.</p>
                <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">Em breve</span>
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-6 border border-green-200 flex gap-4">
              <div className="w-24 h-24 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                <AcademicCapIcon className="h-12 w-12 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1 text-green-700">Técnicas Avançadas de Confeitos</h3>
                <p className="text-sm text-green-600 mb-3">Domine técnicas profissionais para criar sobremesas e confeitaria de alta gastronomia.</p>
                <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">Em breve</span>
              </div>
            </div>
          </div>
          <div className="mt-4 text-center text-sm text-gray-500">
            Nossa plataforma de cursos está em desenvolvimento. Em breve, você terá acesso a treinamentos especializados em confeitaria e gestão de negócios.
          </div>
        </ExpandableSection>
      </div>
    </div>
  )
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  href?: string; // Tornando href opcional
}

function StatCard({ title, value, icon, href }: StatCardProps) {
  const content = (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

interface StatusCardProps {
  label: string;
  value: number;
  color: string;
}

function StatusCard({ label, value, color }: StatusCardProps) {
  return (
    <div className={`p-4 rounded-lg ${color}`}>
      <div className="text-lg font-bold">{value}</div>
      <div className="text-sm">{label}</div>
    </div>
  )
} 