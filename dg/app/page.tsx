'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="relative">
      {/* Hero Section */}
      <section className="relative h-screen">
        <div className="absolute inset-0">
          <Image
            src="/images/hero-bg.jpg"
            alt="Confeitaria background"
            fill
            className="object-cover brightness-[0.3] transition-all duration-700"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-[#2D1810]/90" />
        </div>
        
        <div className="relative container h-full flex flex-col items-center justify-center text-white px-6 sm:px-8">
          {/* Logo com efeito de entrada */}
          <div className="mb-6 md:mb-8 transform hover:scale-105 transition-transform duration-300">
            <Image
              src="/images/logo.png"
              alt="Doce Gestão Logo"
              width={150}
              height={150}
              className="animate-fade-in drop-shadow-2xl w-[150px] h-[150px] md:w-[200px] md:h-[200px]"
              priority
            />
          </div>

          <h1 className="text-center mb-8 md:mb-12 animate-fade-in">
            <span className="block text-5xl md:text-8xl font-bold text-white mb-4 md:mb-6 drop-shadow-2xl tracking-tight">
              Doce
              <span className="bg-gradient-to-r from-[#0B7A48] to-[#0ea65f] text-transparent bg-clip-text"> Gestão</span>
            </span>
            <span className="block text-2xl md:text-5xl font-medium text-white/90 mt-4 md:mt-6">
              para
              <span className="text-[#0B7A48] font-bold hover:text-[#0ea65f] transition-colors duration-300"> confeiteiros</span>
              <span className="mx-2 md:mx-3 text-[#0B7A48]">&</span>
              <span className="text-[#0B7A48] font-bold hover:text-[#0ea65f] transition-colors duration-300">cozinheiros</span>
            </span>
          </h1>

          {/* Botões de ação */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mt-6 md:mt-8 animate-fade-in w-full max-w-md mx-auto">
            <Link href="/register" className="group w-full">
              <button className="w-full px-6 md:px-8 py-3 md:py-4 bg-[#0B7A48] text-white rounded-full font-semibold text-base md:text-lg hover:bg-[#0ea65f] transition-all duration-300 transform hover:scale-105 flex items-center justify-center">
                Começar Agora
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </Link>
            <Link href="/login" className="group w-full">
              <button className="w-full px-6 md:px-8 py-3 md:py-4 bg-white/10 backdrop-blur-sm text-white rounded-full font-semibold text-base md:text-lg hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                Fazer Login
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Seção de Estatísticas */}
      <section className="py-8 -mt-20 relative z-10 bg-gradient-to-b from-[#2D1810]/95 to-[#1a0d09]">
        <div className="container px-4 md:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="bg-black/40 backdrop-blur-sm p-6 md:p-8 rounded-2xl border border-[#0B7A48]/20 transform hover:scale-105 transition-all duration-300 text-center group hover:border-[#0B7A48]/40">
              <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#0B7A48] mb-3 group-hover:text-[#0ea65f] transition-colors">+1000</div>
              <div className="text-white/90 text-lg md:text-xl font-medium">Confeiteiros Ativos</div>
              <p className="text-white/60 text-sm md:text-base mt-2">Profissionais transformando suas receitas em negócios</p>
            </div>
            <div className="bg-black/40 backdrop-blur-sm p-6 md:p-8 rounded-2xl border border-[#0B7A48]/20 transform hover:scale-105 transition-all duration-300 text-center group hover:border-[#0B7A48]/40">
              <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#0B7A48] mb-3 group-hover:text-[#0ea65f] transition-colors">+5000</div>
              <div className="text-white/90 text-lg md:text-xl font-medium">Receitas Gerenciadas</div>
              <p className="text-white/60 text-sm md:text-base mt-2">Doces e salgados com custos controlados</p>
            </div>
            <div className="bg-black/40 backdrop-blur-sm p-6 md:p-8 rounded-2xl border border-[#0B7A48]/20 transform hover:scale-105 transition-all duration-300 text-center group hover:border-[#0B7A48]/40">
              <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#0B7A48] mb-3 group-hover:text-[#0ea65f] transition-colors">97%</div>
              <div className="text-white/90 text-lg md:text-xl font-medium">Clientes Satisfeitos</div>
              <p className="text-white/60 text-sm md:text-base mt-2">Avaliações positivas dos nossos usuários</p>
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona Section */}
      <section className="py-16 bg-[#2D1810]">
        <div className="container">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">COMO FUNCIONA ?</h2>
          
          <div className="space-y-12">
            <div className="step-card">
              <div className="text-[#0B7A48] text-4xl font-bold">1</div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-white">Custo</h3>
                <p className="text-gray-300">
                  Um futuro não está só na sua mão de fazer. Portanto, 
                  com a DoceGestão, você terá todo o controle dos seus custos 
                  com valor no seu bolso na sua margem.
                </p>
              </div>
            </div>

            <div className="step-card">
              <div className="text-[#0B7A48] text-4xl font-bold">2</div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-white">Precificação & Lucro</h3>
                <p className="text-gray-300">
                  Que pessoa não quer saber o como está sua taxa de receita e 
                  preço sugerido de venda, com base na sua margem de lucro desejada.
                </p>
              </div>
            </div>

            <div className="step-card">
              <div className="text-[#0B7A48] text-4xl font-bold">3</div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-white">Gestão Simplificada</h3>
                <p className="text-gray-300">
                  Gestão fácil, ágil e simples para você poder criar mais receitas 
                  e ter mais tempo para fazer o que mais gosta.
                </p>
              </div>
            </div>

            <div className="step-card">
              <div className="text-[#0B7A48] text-4xl font-bold">4</div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-white">Menu Online</h3>
                <p className="text-gray-300">
                  Crie um cardápio digital profissional para compartilhar com seus clientes.
                  Personalize com suas fotos, preços e detalhes dos seus produtos.
                </p>
              </div>
            </div>

            <div className="step-card">
              <div className="text-[#0B7A48] text-4xl font-bold">5</div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-white">Orçamentos Digitais</h3>
                <p className="text-gray-300">
                  Gere orçamentos profissionais para enviar aos clientes com todos os detalhes
                  dos produtos, preços e condições de pagamento.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recursos Section - NOVA SEÇÃO */}
      <section className="py-16 bg-[#085c36]">
        <div className="container">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">RECURSOS EXCLUSIVOS</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-black/20 backdrop-blur-sm p-8 rounded-2xl border border-white/10 hover:transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-[#0B7A48] rounded-full mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white">Menu Online</h3>
              </div>
              <p className="text-gray-200 mb-6">
                Crie cardápios digitais elegantes e compartilhe facilmente com seus clientes através de um link ou QR Code.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#0B7A48] mr-2 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-white">Layout moderno e personalizável</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#0B7A48] mr-2 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-white">Adicione fotos dos seus produtos</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#0B7A48] mr-2 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-white">Organize itens em categorias</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#0B7A48] mr-2 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-white">Links diretos para WhatsApp e Instagram</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-black/20 backdrop-blur-sm p-8 rounded-2xl border border-white/10 hover:transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-[#0B7A48] rounded-full mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white">Orçamentos Digitais</h3>
              </div>
              <p className="text-gray-200 mb-6">
                Crie orçamentos profissionais com sua marca e envie para seus clientes de forma rápida e prática.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#0B7A48] mr-2 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-white">Design profissional com sua logomarca</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#0B7A48] mr-2 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-white">Cadastro de clientes e produtos</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#0B7A48] mr-2 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-white">Links diretos para WhatsApp e Instagram</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#0B7A48] mr-2 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-white">Acompanhamento de status (pendente, aprovado)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Nosso Desafio Section */}
      <section className="bg-[#0B7A48] py-16">
        <div className="container">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="md:w-1/2">
              <Image
                src="/images/confeitaria-trabalho.jpg"
                alt="Confeiteiro trabalhando"
                width={500}
                height={300}
                className="feature-image"
              />
            </div>
            <div className="md:w-1/2 text-white">
              <h2 className="text-3xl font-bold mb-4">NOSSO DESAFIO É O SEU DESAFIO</h2>
              <p className="text-lg">
                Ajudar cozinheiros e confeiteiros a transformarem sua arte em um negócio de 
                verdade - lucrativo, organizado e sustentável.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Preços Section */}
      <section className="py-24 bg-gradient-to-b from-[#2D1810] to-[#1a0d09]">
        <div className="container">
          <h2 className="text-4xl font-bold text-white mb-4 text-center">TENHA CONTROLE TOTAL DA SUA COZINHA</h2>
          <p className="text-gray-300 text-center mb-8 text-lg max-w-3xl mx-auto">
            Pare de perder dinheiro e tempo com cálculos imprecisos. Mais de 1000 confeiteiros já transformaram seus negócios com nossos planos.
          </p>
          
          <div className="bg-[#0B7A48]/30 backdrop-blur-sm rounded-xl p-6 mb-12 max-w-3xl mx-auto border border-[#0B7A48]/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-[#0B7A48] p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-white animate-pulse">SAIA DO APERTO e DO AMADORISMO</span>
            </div>
            <p className="text-white/90 text-lg">
             Nossa comunidade é focada em ajudar você a lucrar mais na cozinha, com dicas e estratégias para aumentar seu faturamento.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 md:gap-12">
            <div className="price-card relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-4 md:p-8 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.03] group">
              <div className="absolute inset-0">
                <Image
                  src="/images/cupcake.jpg"
                  alt="Cupcake"
                  fill
                  className="object-cover opacity-30 group-hover:opacity-40 transition-opacity duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2D1810]/95 to-transparent"></div>
              </div>
              <div className="relative z-10">
                <div className="bg-white/10 inline-block rounded-full px-3 py-1 mb-3">
                  <span className="text-sm text-white">Para quem está começando</span>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-white mb-2">Plano Básico</h3>
                <ul className="space-y-3 my-6">
                  <li className="flex items-start text-white">
                    <span className="text-[#0B7A48] mr-2 flex-shrink-0 mt-1">✓</span>
                    <span>Controle de ingredientes</span>
                  </li>
                  <li className="flex items-start text-white">
                    <span className="text-[#0B7A48] mr-2 flex-shrink-0 mt-1">✓</span>
                    <span>Controle suas receitas</span>
                  </li>
                  <li className="flex items-start text-white">
                    <span className="text-[#0B7A48] mr-2 flex-shrink-0 mt-1">✓</span>
                    <span>Custo e precificação da receita</span>
                  </li>
                  <li className="flex items-start text-white">
                    <span className="text-[#0B7A48] mr-2 flex-shrink-0 mt-1">✓</span>
                    <span>Plataforma amigável, fácil de entender</span>
                  </li>
                  <li className="flex items-start text-white">
                    <span className="text-[#0B7A48] mr-2 flex-shrink-0 mt-1">✓</span>
                    <span>Suas receitas salvas em ambiente seguro</span>
                  </li>
                </ul>
                <div className="mt-8 pt-6 border-t border-white/10">
                  <div className="flex items-center justify-center mb-4">
                    <span className="text-3xl md:text-4xl font-bold text-white">R$ 40,99</span>
                    <span className="text-gray-300 ml-2">/mês</span>
                  </div>
                  <p className="text-center text-white/60 mb-4">
                    Ideal para quem está iniciando sozinha na cozinha
                  </p>
                  <Link href="/register" className="w-full">
                    <button className="button-primary w-full py-3 md:py-4 text-lg font-semibold rounded-xl hover:bg-[#0B7A48]/90 transition-colors">
                      Começar Agora
                    </button>
                  </Link>
                  <p className="text-center text-white/70 mt-3 text-sm">
                    Comece hoje sem compromisso. Cancele quando quiser.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="price-card relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border-2 border-[#0B7A48] p-4 md:p-8 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.03] group">
              <div className="absolute -top-2 -right-2 bg-[#0B7A48] text-white px-4 py-1 rounded-lg transform rotate-6 shadow-lg z-20">
                <span className="text-sm font-bold">MAIS ASSINADO</span>
              </div>
              <div className="absolute inset-0">
                <Image
                  src="/images/bolo-casamento.jpg"
                  alt="Bolo de Casamento"
                  fill
                  className="object-cover opacity-30 group-hover:opacity-40 transition-opacity duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2D1810]/95 to-transparent"></div>
              </div>
              <div className="relative z-10">
                <div className="bg-[#0B7A48]/50 inline-block rounded-full px-3 py-1 mb-3">
                  <span className="text-sm text-white">Escolha dos profissionais</span>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-white mb-2 flex items-center">
                  Plano PRO
                  <span className="ml-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-xs py-1 px-2 rounded-full font-bold">PRO</span>
                </h3>
                <p className="text-[#0B7A48] font-semibold mb-4">Para quem quer Lucrar na cozinha</p>
                
                <div className="bg-[#0B7A48]/40 rounded-lg p-3 mb-6 border border-[#0B7A48]/50">
                  <p className="text-white text-sm font-medium flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Aumente seu faturamento em até  76% com precificação correta
                  </p>
                </div>
                
                <ul className="space-y-3 my-6">
                  <li className="flex items-start text-white">
                    <span className="text-[#0B7A48] mr-2 flex-shrink-0 mt-1">✓</span>
                    <span>Controle completo de ingredientes e estoque</span>
                  </li>
                  <li className="flex items-start text-white">
                    <span className="text-[#0B7A48] mr-2 flex-shrink-0 mt-1">✓</span>
                    <span><strong className="text-yellow-400">TODAS</strong> as suas receitas gerenciadas</span>
                  </li>
                  <li className="flex items-start text-white">
                    <span className="text-[#0B7A48] mr-2 flex-shrink-0 mt-1">✓</span>
                    <span>Calculadora avançada de preços e custos</span>
                  </li>
                  <li className="flex items-start text-white">
                    <span className="text-[#0B7A48] mr-2 flex-shrink-0 mt-1">✓</span>
                    <span>Simulador de orçamentos</span>
                  </li>
                  <li className="flex items-start text-white">
                    <span className="text-[#0B7A48] mr-2 flex-shrink-0 mt-1">✓</span>
                    <span>Atualização automática de preços</span>
                  </li>
                  <li className="flex items-start text-white">
                    <span className="text-[#0B7A48] mr-2 flex-shrink-0 mt-1">✓</span>
                    <span>Sistema de apoio à decisão</span>
                  </li>
                  <li className="flex items-start text-white">
                    <span className="text-[#0B7A48] mr-2 flex-shrink-0 mt-1">✓</span>
                    <span>Interface intuitiva e amigável</span>
                  </li>
                  <li className="flex items-start text-white">
                    <span className="text-[#0B7A48] mr-2 flex-shrink-0 mt-1">✓</span>
                    <span>Menu Online completo (ilimitados)</span>
                  </li>
                  <li className="flex items-start text-white">
                    <span className="text-[#0B7A48] mr-2 flex-shrink-0 mt-1">✓</span>
                    <span>Orçamentos Digitais profissionais</span>
                  </li>
                  <li className="flex items-start text-white">
                    <span className="text-[#0B7A48] mr-2 flex-shrink-0 mt-1">✓</span>
                    <span>Controle seus clientes</span>
                  </li>
                  
                  {/* Seção Em Breve com destaque visual */}
                  <li className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-white font-medium mb-2 flex items-center">
                      <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-0.5 rounded-full mr-2">Em breve</span>
                      Recursos exclusivos
                    </p>
                    <ul className="space-y-2 pl-6">
                      <li className="flex items-start text-white/90">
                        <span className="text-[#0B7A48] mr-2 flex-shrink-0">✓</span>
                        <span>IA para cozinheiros</span>
                      </li>
                      <li className="flex items-start text-white/90">
                        <span className="text-[#0B7A48] mr-2 flex-shrink-0">✓</span>
                        <span>Tendências culinárias</span>
                      </li>
                      <li className="flex items-start text-white/90">
                        <span className="text-[#0B7A48] mr-2 flex-shrink-0">✓</span>
                        <span>Produtos em alta</span>
                      </li>
                      <li className="flex items-start text-white/90">
                        <span className="text-[#0B7A48] mr-2 flex-shrink-0">✓</span>
                        <span>Receitas mais buscadas</span>
                      </li>
                      <li className="flex items-start text-white/90">
                        <span className="text-[#0B7A48] mr-2 flex-shrink-0">✓</span>
                        <span>Cursos</span>
                      </li>
                    </ul>
                  </li>
                </ul>
                <div className="mt-8 pt-6 border-t border-white/10">
                  <div className="flex items-center justify-center mb-4">
                    <div className="relative">
                      {/* <span className="text-gray-400 line-through text-2xl absolute -top-5 left-0">R$ 59,90</span> */}
                      <span className="text-3xl md:text-4xl font-bold text-white">R$ 47,89</span>
                    </div>
                    <span className="text-gray-300 ml-2">/mês</span>
                  </div>
                  {/* <div className="bg-yellow-500/20 rounded-md p-2 mb-4 text-center">
                    <p className="text-yellow-400 font-semibold text-sm">
                      Economize R$ 148,80 por ano!
                    </p>
                  </div> */}
                  <Link href="/register" className="w-full">
                    <button className="button-primary w-full py-3 md:py-4 text-lg font-semibold rounded-xl hover:bg-[#0B7A48]/90 transition-colors group relative overflow-hidden">
                      <span className="relative z-10">Quero Lucrar Mais</span>
                      <span className="absolute inset-0 bg-gradient-to-r from-[#0ea65f] to-[#0B7A48] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    </button>
                  </Link>
                  <p className="text-center text-white/70 mt-3 text-sm">
                    Experimente por 7 dias com garantia de satisfação
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-16 bg-[#0B7A48]/20 backdrop-blur-sm rounded-xl p-6 max-w-3xl mx-auto">
            <h3 className="text-xl font-bold text-white mb-4 text-center">Ainda tem dúvidas?</h3>
            <p className="text-white/80 text-center mb-6">
              Confeiteiros que usam nossa plataforma relatam aumento médio de <strong>30% na lucratividade</strong> em apenas 30 dias!
            </p>
            <div className="flex justify-center">
              <Link href="/contato">
                <button className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-full font-semibold hover:bg-white/20 transition-all duration-300 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Fale com um especialista
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-24 bg-gradient-to-b from-[#0B7A48] to-[#085c36]">
        <div className="container">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 text-center">O QUE DIZEM NOSSOS CLIENTES</h2>
          <h3 className="text-xl text-gray-200 mb-16 text-center max-w-2xl mx-auto">
            Descubra por que mais de 1000 confeiteiros já confiam em nós para gerenciar seus negócios
          </h3>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20 hover:transform hover:scale-105 transition-all duration-300">
              <div className="text-6xl text-white/20 mb-4">"</div>
              <p className="text-gray-100 text-lg mb-8 italic">
                "Depois que comecei a usar o sistema, minha organização melhorou muito! Agora sei exatamente quanto cobrar e qual é meu lucro real."
              </p>
              <div className="flex items-center">
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold text-white">
                  M
                </div>
                <div className="ml-4">
                  <h4 className="font-bold text-white text-lg">Maria Silva</h4>
                  <p className="text-gray-300">Confeiteira</p>
                  <p className="text-sm text-white/80 font-semibold">São Paulo - SP</p>
                  <div className="flex items-center mt-2">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20 hover:transform hover:scale-105 transition-all duration-300">
              <div className="text-6xl text-white/20 mb-4">"</div>
              <p className="text-gray-100 text-lg mb-8 italic">
                "O sistema me ajudou a ter mais controle sobre meus custos e a precificar melhor meus produtos. Recomendo para todos os confeiteiros!"
              </p>
              <div className="flex items-center">
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold text-white">
                  J
                </div>
                <div className="ml-4">
                  <h4 className="font-bold text-white text-lg">João Santos</h4>
                  <p className="text-gray-300">Chef Confeiteiro</p>
                  <p className="text-sm text-white/80 font-semibold">Rio de Janeiro - RJ</p>
                  <div className="flex items-center mt-2">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nós na Mídia Section */}
      <section className="py-6 md:py-16 bg-gray-100 -mt-4 md:mt-0">
        <div className="container px-3 md:px-8">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-[#2D1810] mb-4 md:mb-12 text-center">Nós na mídia</h2>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-6">
            <div className="bg-white p-3 md:p-6 rounded-xl md:rounded-3xl shadow-md hover:shadow-lg transition-all duration-300">
              <Image
                src="/images/g1-logo.svg"
                alt="Logo G1"
                width={32}
                height={16}
                className="mb-2 md:mb-4"
              />
              <h3 className="text-sm md:text-lg font-bold text-[#2D1810] mb-1 md:mb-2 line-clamp-3 md:line-clamp-none">
                Startup paulista revoluciona a gestão financeira para confeiteiros
              </h3>
            </div>

            <div className="bg-white p-3 md:p-6 rounded-xl md:rounded-3xl shadow-md hover:shadow-lg transition-all duration-300">
              <Image
                src="/images/g1-logo.svg"
                alt="Logo G1"
                width={32}
                height={16}
                className="mb-2 md:mb-4"
              />
              <h3 className="text-sm md:text-lg font-bold text-[#2D1810] mb-1 md:mb-2 line-clamp-3 md:line-clamp-none">
                Nova solução para confeiteiros fatura R$50 milhões em primeiro ano
              </h3>
            </div>

            <div className="bg-white p-3 md:p-6 rounded-xl md:rounded-3xl shadow-md hover:shadow-lg transition-all duration-300">
              <Image
                src="/images/g1-logo.svg"
                alt="Logo G1"
                width={32}
                height={16}
                className="mb-2 md:mb-4"
              />
              <h3 className="text-sm md:text-lg font-bold text-[#2D1810] mb-1 md:mb-2 line-clamp-3 md:line-clamp-none">
                Como a Doce Gestão transforma a vida dos confeiteiros brasileiros
              </h3>
            </div>

            <div className="bg-white p-3 md:p-6 rounded-xl md:rounded-3xl shadow-md hover:shadow-lg transition-all duration-300">
              <Image
                src="/images/g1-logo.svg"
                alt="Logo G1"
                width={32}
                height={16}
                className="mb-2 md:mb-4"
              />
              <h3 className="text-sm md:text-lg font-bold text-[#2D1810] mb-1 md:mb-2 line-clamp-3 md:line-clamp-none">
                Plataforma ajuda confeiteiros a aumentar lucros em até 76%
              </h3>
            </div>
          </div>
        </div>
      </section>

      {/* Quem Somos Section */}
      <section className="py-16 bg-[#2D1810]">
        <div className="container">
          <h2 className="text-6xl font-bold text-[#0B7A48] mb-6 text-center">Quem somos</h2>
          <p className="text-xl text-white mb-12 text-center max-w-3xl mx-auto">
            A Doce Gestão é composta por um time de empreendedores especialistas em tecnologia e confeitaria.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="relative group">
              <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-8 hover:transform hover:scale-105 transition-all duration-300">
                <Image
                  src="/images/mari.jpeg"
                  alt="Fundadora"
                  width={400}
                  height={400}
                  className="w-full h-[400px] object-cover rounded-xl mb-6"
                />
                <h3 className="text-2xl font-bold text-white mb-2">Mari Tolentino</h3>
                <p className="text-[#0B7A48] font-bold mb-2">Fundadora & Chef Confeiteira</p>
                <p className="text-gray-300">
                  Chef confeiteira apaixonada por doces e tecnologia, com experiência em gestão de negócios e desenvolvimento de receitas exclusivas.
                </p>
              </div>
            </div>

            <div className="relative group">
              <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-8 hover:transform hover:scale-105 transition-all duration-300">
                <Image
                  src="/images/Ivan.jpeg"
                  alt="Co-fundador"
                  width={400}
                  height={400}
                  className="w-full h-[400px] object-contain bg-white/5 rounded-xl mb-6"
                  priority
                />
                <h3 className="text-2xl font-bold text-white mb-2">Ivan Pedroso</h3>
                <p className="text-[#0B7A48] font-bold mb-2">Co-Fundador & Tech Manager</p>
                <p className="text-gray-300">
                  Especialista em desenvolvimento web e mobile, com experiência em gestão de equipes e projetos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Join Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="md:w-1/2">
              <Image
                src="/images/confeiteiros.jpg"
                alt="Confeiteiros trabalhando"
                width={500}
                height={300}
                className="feature-image"
              />
            </div>
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold text-[#2D1810] mb-4">
                Junte-se a mais de 1000 confeiteiros e confeitarias
              </h2>
              <Link href="/register">
                <button className="button-primary">Venha Conhecer</button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="relative py-32">
        <div className="absolute inset-0">
          <Image
            src="/images/footer.jpg"
            alt="Footer background"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-70" />
        </div>
        
        <div className="container relative z-10">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">
            ENTRE EM CONTATO
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 text-white">
            <div className="bg-black/50 p-6 rounded-xl backdrop-blur-sm">
              <h3 className="font-bold mb-4">SOCIAL</h3>
              <ul className="space-y-2">
                <li>Facebook</li>
                <li>Instagram</li>
                <li>LinkedIn</li>
              </ul>
            </div>
            
            <div className="bg-black/50 p-6 rounded-xl backdrop-blur-sm">
              <h3 className="font-bold mb-4">ENDEREÇO</h3>
              <p>Rua São João, 123</p>
              <p>Centro - São Paulo</p>
              <p>CEP: 01234-567</p>
            </div>
            
            <div className="bg-black/50 p-6 rounded-xl backdrop-blur-sm">
              <h3 className="font-bold mb-4">CONTATO</h3>
              <p>contato@docinho.com.br</p>
              <p>(11) 1234-5678</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
} 