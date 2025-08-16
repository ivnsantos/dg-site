'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { TipoPlano, UserStatus } from '../../../src/entities/User'
import { 
  HomeIcon, 
  CubeIcon,
  ChartBarIcon,
  UserIcon,
  CreditCardIcon,
  Bars3Icon,
  XMarkIcon,
  BeakerIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  LockClosedIcon,
  LinkIcon,
  ClipboardDocumentListIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'
import { Button } from '../../../components/ui/button'
import DoceGestaoLoading from '@/components/ui/DoceGestaoLoading'
import { link } from 'fs'

// Define interface para os itens de navegação
interface NavigationItem {
  name: string;
  href: string;
  icon: React.ForwardRefExoticComponent<any>;
  restrictedTo: TipoPlano[];
  comingSoon?: boolean;
  highlight?: boolean;
}

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, restrictedTo: [] },
  { name: 'Agenda', href: '/dashboard/agenda', icon: CalendarIcon, restrictedTo: [] },
  { name: 'Produtos', href: '/dashboard/produtos', icon: CubeIcon, restrictedTo: [] },
  { name: 'Ingredientes', href: '/dashboard/ingredientes', icon: BeakerIcon, restrictedTo: [] },
  { name: 'Linktree', href: '/dashboard/linktree', icon: LinkIcon, restrictedTo: [] },
  { name: 'Menu Online', href: '/dashboard/menu-online', icon: Bars3Icon, restrictedTo: [TipoPlano.BASICO] },
  { name: 'Orçamentos', href: '/dashboard/orcamentos', icon: DocumentTextIcon, restrictedTo: [TipoPlano.BASICO] },
  { name: 'Questionários', href: '/dashboard/feedback', icon: ClipboardDocumentListIcon, restrictedTo: [TipoPlano.BASICO] },
  { name: 'Usuários', href: '/dashboard/usuarios', icon: UserIcon, restrictedTo: [] },
  { 
    name: 'IA para Cozinheiros', 
    href: '/dashboard/ia-para-cozinheiros', 
    icon: ChatBubbleLeftRightIcon, 
    comingSoon: true, 
    highlight: true,
    restrictedTo: [TipoPlano.BASICO]
  },
]

const LogoFull = () => (
  <Link href="/dashboard" className="flex items-center">
    <Image
      src="/images/logo.png"
      alt="Doce Gestão"
      width={40}
      height={40}
      className="rounded-lg"
      priority
    />
    <span className="ml-2 text-lg font-semibold">Doce Gestão</span>
  </Link>
)

const LogoMobile = () => (
  <Link href="/dashboard" className="flex items-center">
    <Image
      src="/images/logo.png"
      alt="Doce Gestão"
      width={42}
      height={42}
      className="rounded-lg"
      priority
    />
    <span className="ml-2 text-base font-semibold">Doce Gestão</span>
  </Link>
)

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const userPlano = session?.user?.plano || TipoPlano.BASICO
  const isInactive = session?.user?.status === UserStatus.INATIVO || !session?.user?.plano
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentPath, setCurrentPath] = useState('')

  useEffect(() => {
    // Quando o pathname mudar, significa que a navegação foi concluída
    if (isLoading && pathname !== currentPath) {
      setIsLoading(false)
    }
  }, [pathname, isLoading, currentPath])

  const toggleSidebar = () => setIsOpen(!isOpen)

  const handleNavigation = (href: string, isRestricted: boolean) => {
    // Se for restrito e não estiver na página de planos, redireciona para planos
    if (isRestricted) {
      setCurrentPath('/dashboard/planos')
      setIsLoading(true)
      setIsOpen(false)
      router.push('/dashboard/planos')
      return
    }
    
    // Se já estiver na mesma página, não faz nada
    if (href === pathname) return
    
    // Salva o caminho atual para comparação e ativa o loading
    setCurrentPath(href)
    setIsLoading(true)
    
    // Fecha o sidebar em dispositivos móveis
    setIsOpen(false)
    
    // Navega para a nova página
    router.push(href)
  }

  const NavigationLinks = () => (
    <nav className="space-y-1 p-4">
      {isInactive ? (
        <button
          onClick={() => handleNavigation('/dashboard/planos', false)}
          className={`flex items-center w-full gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            pathname === '/dashboard/planos'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          }`}
        >
          <CreditCardIcon className="h-5 w-5" />
          Planos
        </button>
      ) : (
        navigation.map((item) => {
          // Verifica se o item está restrito para o plano atual do usuário
          const isRestricted = item.restrictedTo.includes(userPlano);
          
          return (
            <div key={item.name} className="relative group">
              <button
                onClick={() => handleNavigation(item.href, isRestricted)}
                className={`flex items-center w-full gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? 'bg-primary text-primary-foreground'
                    : isRestricted
                      ? 'text-muted-foreground/50 bg-gray-100 cursor-not-allowed'
                      : item.highlight 
                        ? 'text-pink-700 bg-pink-50 hover:bg-pink-100 border border-pink-200'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
                disabled={isRestricted}
              >
                {isRestricted ? (
                  <LockClosedIcon className="h-5 w-5 text-muted-foreground/50" />
                ) : (
                  <item.icon className={`h-5 w-5 ${item.highlight ? 'text-pink-500' : ''}`} />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className={`${item.highlight && !isRestricted ? 'font-semibold flex items-center gap-1' : ''} ${isRestricted ? 'text-muted-foreground/50' : ''}`}>
                      {item.name}
                      {item.highlight && !isRestricted && <SparklesIcon className="h-3.5 w-3.5 text-yellow-400" />}
                    </span>
                    {item.comingSoon && !isRestricted && (
                      <span className="text-xs px-2 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-sm animate-[pulse_3s_ease-in-out_infinite] relative overflow-hidden">
                        <span className="relative z-10">Em breve</span>
                        <span className="absolute inset-0 bg-white opacity-20 blur-sm"></span>
                      </span>
                    )}
                  </div>
                </div>
              </button>
              
              {/* Mensagem de recurso PRO - mostra apenas quando hover e para itens restritos */}
              {isRestricted && (
                <div className="hidden group-hover:block absolute z-50 left-full top-1/2 transform -translate-y-1/2 ml-2 bg-black text-white text-xs p-2 rounded whitespace-nowrap pointer-events-none">
                  Disponível apenas no plano PRO
                </div>
              )}
            </div>
          );
        })
      )}

      {/* Botão para upgrade do plano - apenas para usuários do plano BÁSICO */}
      {userPlano === TipoPlano.BASICO && !isInactive && (
        <div className="mt-6 p-3 bg-gradient-to-r from-[#0B7A48]/10 to-[#0ea65f]/10 rounded-lg border border-[#0B7A48]/20">
          <h3 className="text-sm font-medium text-[#0B7A48]">Plano Básico</h3>
          <p className="text-xs text-muted-foreground mt-1 mb-3">
            Atualize para o plano PRO para desbloquear todos os recursos.
          </p>
          <Button 
            className="w-full bg-[#0B7A48] hover:bg-[#0ea65f] text-white text-xs"
            onClick={() => handleNavigation('/dashboard/planos', false)}
          >
            Atualizar Plano
          </Button>
        </div>
      )}
    </nav>
  )

  if (isLoading) {
    return <DoceGestaoLoading />
  }

  return (
    <>
      {/* Botão do menu mobile */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b px-4 flex items-center justify-between z-50">
        <LogoMobile />
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="lg:hidden"
        >
          {isOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </Button>
      </div>

      {/* Overlay para mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 lg:hidden z-40"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar para desktop */}
      <div className="hidden lg:block fixed top-0 left-0 h-screen w-64 border-r bg-card">
        <div className="flex h-16 items-center border-b px-6">
          <LogoFull />
        </div>
        <NavigationLinks />
      </div>

      {/* Sidebar mobile */}
      <div className={`
        lg:hidden fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 
        bg-card z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <NavigationLinks />
      </div>

      {/* Espaçamento para o conteúdo */}
      <div className="lg:pl-64 pt-16 lg:pt-0" />
    </>
  )
} 