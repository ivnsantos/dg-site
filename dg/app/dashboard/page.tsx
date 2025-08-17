import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '../api/auth/[...nextauth]/route'
import { LogoutButton } from './components/LogoutButton'
import { getDataSource } from '@/src/lib/db'
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
  LockClosedIcon,
  LinkIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'
import { StickyNoteIcon, PackageIcon } from 'lucide-react'
import { ExpandableSection } from './components/ExpandableSection'
import { ReactNode } from 'react'
import Link from 'next/link'
import { Ingredient } from '@/src/entities/Ingredient'
import { Product } from '@/src/entities/Product'
import { Menu } from '@/src/entities/Menu'
import { Orcamento } from '@/src/entities/Orcamento'
import { Cliente } from '@/src/entities/Cliente'
import { LinkTree } from '@/src/entities/LinkTree'
import { Feedback } from '@/src/entities/Feedback'
import { AgendaItem } from '@/src/entities/AgendaItem'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  // Inicializa o banco de dados
  const dataSource = await getDataSource()
  
  // Busca dados do usuário no banco
  const userRepository = dataSource.getRepository(User)
  const user = await userRepository.findOne({
    where: { email: session.user.email }
  })

  if (!user) {
    redirect('/login')
  }

  const userPlano = user.plano || TipoPlano.BASICO
  const isPlanoBasico = userPlano === TipoPlano.BASICO
  
  // Busca dados de produtos
  const productsCount = await dataSource.getRepository(Product).count({
    where: { user: { id: user.id } }
  })

  // Busca dados de ingredientes
  const ingredientsCount = await dataSource.getRepository(Ingredient).count({
    where: { user: { id: user.id } }
  })

  // Busca dados de menus online
  const menusCount = await dataSource.getRepository(Menu).count({
    where: { user: { id: user.id } }
  })

  // Busca dados de orçamentos
  const orcamentosRepository = dataSource.getRepository(Orcamento)
  const totalOrcamentos = await orcamentosRepository.count({
    where: { user: { id: user.id } }
  })

  // Busca orçamentos agrupados por status
  const orcamentosStatus = await orcamentosRepository
    .createQueryBuilder('orcamento')
    .select('orcamento.status', 'status')
    .addSelect('COUNT(orcamento.id)', 'count')
    .where('orcamento.user = :userId', { userId: user.id })
    .groupBy('orcamento.status')
    .getRawMany()

  // Converte para um objeto mais fácil de usar
  const statusCounts = orcamentosStatus.reduce((acc, item) => {
    acc[item.status] = parseInt(item.count)
    return acc
  }, {})

  // Busca dados de clientes
  const clientesCount = await dataSource.getRepository(Cliente).count({
    where: { user: { id: user.id } }
  })

  // Busca dados de LinkTrees
  const linkTreesCount = await dataSource.getRepository(LinkTree).count({
    where: { user: { id: user.id } }
  })

  // Busca dados de questionários de feedback
  let feedbacksCount = 0
  try {
    feedbacksCount = await dataSource.getRepository(Feedback).count({
      where: { user: { id: user.id } }
    })
  } catch (error) {
    console.error('Erro ao buscar feedbacks:', error)
    feedbacksCount = 0
  }

  // Busca dados da agenda
  const agendaRepository = dataSource.getRepository(AgendaItem)
  const agendaItems = await agendaRepository.find({
    where: { userId: user.id },
    order: { startDate: 'ASC' }
  })

  // Debug: verificar dados carregados
  console.log('Agenda items carregados:', agendaItems.length)
  console.log('Primeiros itens:', agendaItems.slice(0, 3))

  // Busca itens da agenda para os próximos 7 dias
  const today = new Date()
  const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
  
  const upcomingAgendaItems = agendaItems.filter(item => {
    const itemDate = new Date(item.startDate)
    // Normalizar datas para comparar apenas dia/mês/ano
    const normalizedItemDate = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate())
    const normalizedToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const normalizedWeekFromNow = new Date(weekFromNow.getFullYear(), weekFromNow.getMonth(), weekFromNow.getDate())
    
    return normalizedItemDate >= normalizedToday && normalizedItemDate <= normalizedWeekFromNow
  })

  // Conta itens por tipo
  const anotacoesCount = agendaItems.filter(item => item.type === 'anotacao').length
  const encomendasCount = agendaItems.filter(item => item.type === 'encomenda').length

  return (
   
      <div className="max-w-7xl mx-auto">
        {/* Alerta de Markup não configurado */}
        {!user?.markupIdeal && <MarkupAlert />}
                 {/* Calendário de 7 dias */}
        <div className="mb-8">
          <Link href="/dashboard/agenda">
            <Card className=" hover:shadow-lg transition-all cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-6 w-6 text-[#0B7A48]" />
                  <span className=" font-medium text-lg">Agenda</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mb-4">
                  {Array.from({ length: 7 }, (_, index) => {
                    const date = new Date()
                    date.setDate(date.getDate() + index)
                    const isToday = index === 0
                    const dayName = date.toLocaleDateString('pt-BR', { weekday: 'short' })
                    const dayNumber = date.getDate()
                    const month = date.toLocaleDateString('pt-BR', { month: 'short' })
                    
                    // Buscar dados reais da agenda para este dia
                    const currentDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
                    
                    // Itens que começam neste dia (data inicial)
                    const startDateItems = upcomingAgendaItems.filter(item => {
                      const itemStartDate = new Date(item.startDate)
                      const normalizedItemStartDate = new Date(itemStartDate.getFullYear(), itemStartDate.getMonth(), itemStartDate.getDate())
                      const normalizedCurrentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())
                      return normalizedItemStartDate.getTime() === normalizedCurrentDate.getTime()
                    })
                    
                    // Itens que terminam neste dia (data final)
                    const endDateItems = upcomingAgendaItems.filter(item => {
                      const itemEndDate = new Date(item.endDate)
                      const normalizedItemEndDate = new Date(itemEndDate.getFullYear(), itemEndDate.getMonth(), itemEndDate.getDate())
                      const normalizedCurrentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())
                      return normalizedItemEndDate.getTime() === normalizedCurrentDate.getTime()
                    })
                    
                    const hasStartDateItem = startDateItems.length > 0
                    const hasEndDateItem = endDateItems.length > 0
                    const hasAgendaItem = hasStartDateItem || hasEndDateItem
                    
                    return (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border text-center transition-all relative ${
                          isToday
                            ? 'bg-[#0B7A48] text-white border-[#0B7A48] shadow-lg'
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        } ${index >= 4 ? 'hidden sm:block' : ''}`}
                      >
                        <div className={`text-xs font-medium mb-1 ${
                          isToday ? 'text-white/80' : 'text-gray-500'
                        }`}>
                          {dayName}
                        </div>
                        <div className={`text-lg font-bold ${
                          isToday ? 'text-white' : 'text-gray-900'
                        }`}>
                          {dayNumber}
                        </div>
                        <div className={`text-xs ${
                          isToday ? 'text-white/80' : 'text-gray-400'
                        }`}>
                          {month}
                        </div>
                        
                        {/* Indicadores de data inicial (azul) */}
                        {hasStartDateItem && (
                          <div className="absolute -top-2 -left-2 flex flex-col gap-1">
                            {startDateItems.some(item => item.type === 'anotacao') && (
                              <div className="w-5 h-5 bg-white border border-blue-200 rounded-full flex items-center justify-center shadow-sm">
                                <StickyNoteIcon className="w-3 h-3 text-blue-600" />
                              </div>
                            )}
                            {startDateItems.some(item => item.type === 'encomenda') && (
                              <div className="w-5 h-5 bg-white border border-blue-200 rounded-full flex items-center justify-center shadow-sm">
                                <PackageIcon className="w-3 h-3 text-blue-600" />
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Indicadores de data final (vermelho) */}
                        {hasEndDateItem && (
                          <div className="absolute -top-2 -right-2 flex flex-col gap-1">
                            {endDateItems.some(item => item.type === 'anotacao') && (
                              <div className="w-5 h-5 bg-white border border-red-200 rounded-full flex items-center justify-center shadow-sm">
                                <StickyNoteIcon className="w-3 h-3 text-red-600" />
                              </div>
                            )}
                            {endDateItems.some(item => item.type === 'encomenda') && (
                              <div className="w-5 h-5 bg-white border border-red-200 rounded-full flex items-center justify-center shadow-sm">
                                <PackageIcon className="w-3 h-3 text-red-600" />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
                
                {/* Informações elegantes e minimalistas - só aparecem quando há dados */}
                {(anotacoesCount > 0 || encomendasCount > 0 || upcomingAgendaItems.length > 0) && (
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-4 text-sm">
                      {anotacoesCount > 0 && (
                        <div className="flex items-center gap-2">
                          <StickyNoteIcon className="h-4 w-4 text-amber-700" />
                          <span className="text-gray-600">{anotacoesCount}</span>
                        </div>
                      )}
                      {encomendasCount > 0 && (
                        <div className="flex items-center gap-2">
                          <PackageIcon className="h-4 w-4 text-amber-700" />
                          <span className="text-gray-600">{encomendasCount}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <div className="text-xs text-gray-500">Próxima</div>
                      <div className="text-sm font-medium text-gray-900">
                        {upcomingAgendaItems.length > 0 
                          ? `${new Date(upcomingAgendaItems[0].startDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} - ${upcomingAgendaItems[0].title}`
                          : 'Nenhuma programada'
                        }
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Cartas de resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
          <StatCard 
            title="Produtos" 
            value={productsCount} 
            icon={<CubeIcon className="h-8 w-8 text-[#0B7A48]" />} 
            href={user?.markupIdeal ? "/dashboard/produtos" : undefined}
            disabled={!user?.markupIdeal}
          />
          <StatCard 
            title="Ingredientes" 
            value={ingredientsCount} 
            icon={<BeakerIcon className="h-8 w-8 text-[#0B7A48]" />} 
            href={user?.markupIdeal ? "/dashboard/ingredientes" : undefined}
            disabled={!user?.markupIdeal}
          />
          {!isPlanoBasico && (
            <>
              <StatCard 
                title="Menus Online" 
                value={menusCount} 
                icon={<Squares2X2Icon className="h-8 w-8 text-[#0B7A48]" />} 
                href="/dashboard/menu-online"
              />
              <StatCard 
                title="LinkTrees" 
                value={linkTreesCount} 
                icon={<LinkIcon className="h-8 w-8 text-[#0B7A48]" />} 
                href="/dashboard/linktree"
              />
              <StatCard 
                title="Questionários" 
                value={feedbacksCount} 
                icon={<ChatBubbleLeftRightIcon className="h-8 w-8 text-[#0B7A48]" />} 
                href="/dashboard/feedback"
              />
              <StatCard 
                title="Clientes" 
                value={clientesCount} 
                icon={<UserGroupIcon className="h-8 w-8 text-[#0B7A48]" />} 
                href="/dashboard/usuarios"
              />
            </>
          )}
          {isPlanoBasico && (
            <>
              <div className="sm:col-span-2 lg:col-span-3 xl:col-span-2 bg-gray-50 rounded-lg p-6 flex flex-col justify-center items-center border border-gray-200">
                <div className="bg-gray-100 p-3 rounded-full mb-3">
                  <LockClosedIcon className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-500 mb-2 text-center">Recursos PRO bloqueados</h3>
                <p className="text-sm text-gray-400 text-center mb-4">
                  Acesse Menu Online, LinkTrees, Questionários de Feedback, Orçamentos, Gerenciamento de Clientes e muito mais
                </p>
                <Link href="/dashboard/planos">
                  <button className="px-4 py-2 bg-[#0B7A48] text-white rounded-lg text-sm hover:bg-[#0ea65f] transition-colors">
                    Desbloquear agora
                  </button>
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Seção de Orçamentos - visível apenas para plano PRO */}
        {!isPlanoBasico && (
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="p-6 border-b">
              <div className="flex items-center gap-3">
                <DocumentTextIcon className="h-6 w-6 text-[#0B7A48]" />
                <h2 className="text-xl font-semibold text-gray-900">Orçamentos</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <h3 className="text-lg font-medium">Total de orçamentos: {totalOrcamentos}</h3>
                <a 
                  href="/dashboard/orcamentos" 
                  className="text-[#0B7A48] hover:underline font-medium flex items-center gap-1"
                >
                  Ver todos
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
              {totalOrcamentos > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  <StatusCard label="Pendentes" value={statusCounts['PENDENTE'] || 0} color="bg-yellow-100 text-yellow-800" />
                  <StatusCard label="Aprovados" value={statusCounts['APROVADO'] || 0} color="bg-green-100 text-green-800" />
                  <StatusCard label="Recusados" value={statusCounts['RECUSADO'] || 0} color="bg-red-100 text-red-800" />
                  <StatusCard label="Finalizados" value={statusCounts['FINALIZADO'] || 0} color="bg-blue-100 text-blue-800" />
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Você ainda não possui orçamentos cadastrados.</p>
                  <Link href="/dashboard/orcamentos" className="text-[#0B7A48] hover:underline font-medium">
                    Criar seu primeiro orçamento
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Seção de Orçamentos - versão bloqueada para plano BÁSICO */}
        {isPlanoBasico && (
          <div className="bg-gray-50 rounded-lg shadow mb-8 border border-gray-200 relative overflow-hidden">
            <div className="absolute inset-0 bg-gray-200/50 backdrop-blur-[1px] flex items-center justify-center z-10">
              <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-md">
                <div className="bg-gray-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <LockClosedIcon className="h-6 w-6 text-gray-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Recurso disponível no plano PRO</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Faça orçamentos profissionais, acompanhe status e fidelize seus clientes
                </p>
                <Link href="/dashboard/planos">
                  <button className="bg-[#0B7A48] text-white px-4 py-2 rounded-lg hover:bg-[#0ea65f] transition-colors">
                    Atualizar para PRO
                  </button>
                </Link>
              </div>
            </div>
            <div className="p-6 border-b">
              <div className="flex items-center gap-3">
                <DocumentTextIcon className="h-6 w-6 text-[#0B7A48]" />
                <h2 className="text-xl font-semibold text-gray-900">Orçamentos</h2>
              </div>
            </div>
            <div className="p-6 min-h-[200px]">
              {/* Conteúdo borrado para plano básico */}
            </div>
          </div>
        )}

        {/* Tendências Culinárias - Em breve - visível para todos */}
        <ExpandableSection 
          title="Tendências Culinárias" 
          icon={<ChartBarSquareIcon className="h-6 w-6 text-blue-600" />}
          comingSoon={true}
          accentColor="bg-gradient-to-r from-blue-500 to-indigo-500"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-blue-50 rounded-lg p-4 sm:p-6 border border-blue-200">
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
            <div className="bg-blue-50 rounded-lg p-4 sm:p-6 border border-blue-200">
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
            <div className="bg-blue-50 rounded-lg p-4 sm:p-6 border border-blue-200">
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-green-50 rounded-lg p-4 sm:p-6 border border-green-200 flex flex-col sm:flex-row gap-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                <AcademicCapIcon className="h-10 w-10 sm:h-12 sm:w-12 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1 text-green-700">Gestão de Negócios para Confeiteiros</h3>
                <p className="text-sm text-green-600 mb-3">Aprenda a precificar corretamente seus produtos, gerenciar finanças e expandir seu negócio.</p>
                <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">Em breve</span>
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 sm:p-6 border border-green-200 flex flex-col sm:flex-row gap-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                <AcademicCapIcon className="h-10 w-10 sm:h-12 sm:w-12 text-green-600" />
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
   
  )
} 

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  href?: string; // Tornando href opcional
  disabled?: boolean; // Adicionando propriedade para desabilitar
}

function StatCard({ title, value, icon, href, disabled }: StatCardProps) {
  const content = (
    <Card className={`transition-all ${
      disabled 
        ? 'opacity-50 cursor-not-allowed bg-gray-50' 
        : 'hover:shadow-md cursor-pointer'
    }`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className={`text-sm font-medium ${
          disabled ? 'text-gray-400' : 'text-gray-500'
        }`}>
          <span className="block sm:inline">{title}</span>
          {disabled && (
            <span className="block sm:ml-2 text-xs text-orange-600 font-normal">
              (Markup necessário)
            </span>
          )}
        </CardTitle>
        <div className={`${disabled ? 'opacity-50' : ''} shrink-0`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${
          disabled ? 'text-gray-400' : ''
        }`}>
          {value}
        </div>
      </CardContent>
    </Card>
  );

  if (href && !disabled) {
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
    <div className={`p-3 sm:p-4 rounded-lg ${color}`}>
      <div className="text-lg sm:text-xl font-bold">{value}</div>
      <div className="text-xs sm:text-sm">{label}</div>
    </div>
  )
} 