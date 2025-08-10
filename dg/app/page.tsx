'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import WhatsAppFloat from '@/components/WhatsAppFloat'
import CouponPopup from '@/components/CouponPopup'

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
              <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#0B7A48] mb-3 group-hover:text-[#0ea65f] transition-colors">+500</div>
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
          <h2 className="text-3xl font-bold text-white mb-12 text-center">o que oferecemos?</h2>
          
          <div className="space-y-12">

            <div className="step-card">
              <div className="text-[#0B7A48] text-4xl font-bold">1</div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-white">Precificação & Lucro</h3>
                <p className="text-gray-300">
                  Que pessoa não quer saber o como está sua taxa de receita e 
                  preço sugerido de venda, com base na sua margem de lucro desejada.
                </p>
              </div>
            </div>

            <div className="step-card">
              <div className="text-[#0B7A48] text-4xl font-bold">2</div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-white">Gestão Simplificada</h3>
                <p className="text-gray-300">
                  Gestão fácil, ágil e simples para você poder criar mais receitas 
                  e ter mais tempo para fazer o que mais gosta.
                </p>
              </div>
            </div>

            <div className="step-card">
              <div className="text-[#0B7A48] text-4xl font-bold">3</div>
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

            <div className="step-card">
              <div className="text-[#0B7A48] text-4xl font-bold">6</div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-white">LinkTree Doce Gestão</h3>
                <p className="text-gray-300">
                  Crie um LinkTree otimizado para o Instagram facilitando seu
                  compartilhamento com seus clientes.
                </p>
              </div>
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
      {/* Quem Somos Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-[#2D1810] via-[#1a0d09] to-[#2D1810] relative overflow-hidden">
        {/* Background decorativo elegante */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full opacity-50">
            <div className="absolute top-20 left-20 w-32 lg:w-64 h-32 lg:h-64 bg-gradient-to-r from-[#0B7A48]/10 to-[#0ea65f]/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-40 lg:w-80 h-40 lg:h-80 bg-gradient-to-l from-[#0B7A48]/10 to-[#0ea65f]/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/3 w-24 lg:w-48 h-24 lg:h-48 bg-gradient-to-br from-[#0B7A48]/8 to-[#0ea65f]/8 rounded-full blur-2xl"></div>
          </div>
        </div>
        
        <div className="container relative z-10">
          {/* Header elegante */}
          <div className="text-center mb-12 lg:mb-20">
            <div className="inline-block relative mb-6 lg:mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-[#0B7A48] via-[#0ea65f] to-[#0B7A48] rounded-full blur-xl opacity-60 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-[#0B7A48] via-[#0ea65f] to-[#0B7A48] p-[2px] rounded-full">
                <div className="bg-[#2D1810] px-6 lg:px-12 py-4 lg:py-6 rounded-full">
                  <h3 className="text-2xl lg:text-4xl font-bold bg-gradient-to-r from-[#0B7A48] via-[#0ea65f] to-[#0B7A48] bg-clip-text text-transparent flex items-center justify-center gap-2 lg:gap-4">
                    <span className="text-xl lg:text-3xl filter drop-shadow-lg">👑</span>
                    Nossa Embaixadora
                    <span className="text-xl lg:text-3xl filter drop-shadow-lg">👑</span>
                  </h3>
                </div>
              </div>
            </div>
            <p className="text-white/90 text-base lg:text-xl max-w-4xl mx-auto leading-relaxed font-light px-4">
              Conheça a profissional que representa nossa marca com <span className="text-[#0B7A48] font-semibold">excelência e dedicação</span>, 
              compartilhando sua expertise para transformar a vida de confeiteiros em todo o Brasil.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-12 items-start">
            {/* Card principal da Embaixadora */}
            <div className="lg:col-span-2">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-[#0B7A48]/20 via-[#0ea65f]/20 to-[#0B7A48]/20 rounded-2xl lg:rounded-[2rem] blur-2xl opacity-40 group-hover:opacity-60 transition-all duration-700"></div>
                <div className="relative overflow-hidden rounded-2xl lg:rounded-[2rem] bg-white/5 backdrop-blur-md border border-white/10 p-4 lg:p-10 hover:transform hover:scale-[1.02] transition-all duration-700 group shadow-2xl">
                  
                  <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 items-center">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#0B7A48] to-[#0ea65f] rounded-2xl lg:rounded-3xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
                      <div className="relative">
                <Image
                          src="/images/mari.jpeg"
                          alt="Mari Tolentino - Embaixadora da Doce Gestão"
                          width={240}
                          height={300}
                          className="w-[240px] h-[300px] lg:w-[320px] lg:h-[420px] object-cover rounded-2xl lg:rounded-3xl shadow-2xl group-hover:shadow-[#0B7A48]/30 transition-all duration-500"
                        />
                        <div className="absolute inset-0 rounded-2xl lg:rounded-3xl bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                      </div>
                    </div>
                    
                    <div className="flex-1 text-center lg:text-left">
                      <div className="relative mb-4">
                        <h3 className="text-2xl lg:text-4xl font-bold text-white group-hover:text-[#0B7A48] transition-colors duration-500">
                          Mari Tolentino
                        </h3>
                        <div className="absolute -top-1 lg:-top-2 -right-1 lg:-right-2 bg-gradient-to-r from-[#0B7A48] to-[#0ea65f] text-white px-2 py-1 lg:px-4 lg:py-2 rounded-full text-xs lg:text-sm font-bold shadow-xl transform rotate-2 group-hover:rotate-0 transition-transform duration-500">
                          <span className="mr-1 lg:mr-2">👑</span>
                          <span className="hidden sm:inline">Embaixadora Oficial</span>
                          <span className="sm:hidden">Oficial</span>
                        </div>
                      </div>
                      <p className="text-[#0B7A48] font-bold text-base lg:text-xl mb-4 lg:mb-6 flex items-center justify-center lg:justify-start gap-2 lg:gap-3">
                        <span className="text-lg lg:text-2xl">🌟</span>
                        <span className="text-sm lg:text-base">Embaixadora da Doce Gestão</span>
                        <span className="text-lg lg:text-2xl">🌟</span>
                      </p>
                      
                      <p className="text-white/80 text-sm lg:text-lg leading-relaxed mb-4 lg:mb-8 font-light">
                        Chef confeiteira apaixonada por doces e tecnologia, com vasta experiência em gestão de negócios e desenvolvimento de receitas exclusivas. 
                        Nossa embaixadora oficial que representa a marca com <span className="text-[#0B7A48] font-semibold">excelência</span> e compartilha conhecimento 
                        valioso com a comunidade de confeiteiros.
                      </p>
                      
                      {/* Especialidades elegantes */}
                      <div className="grid grid-cols-2 gap-3 lg:gap-6 mb-4 lg:mb-8">
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg lg:rounded-2xl p-3 lg:p-6 text-center border border-white/5 hover:bg-white/15 transition-all duration-300 group">
                          <span className="text-xl lg:text-3xl mb-2 lg:mb-3 block group-hover:scale-110 transition-transform duration-300">🎂</span>
                          <p className="text-white font-semibold text-xs lg:text-base">Confeitaria</p>
                          <p className="text-white/60 text-xs lg:text-sm mt-1">Especialista</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg lg:rounded-2xl p-3 lg:p-6 text-center border border-white/5 hover:bg-white/15 transition-all duration-300 group">
                          <span className="text-xl lg:text-3xl mb-2 lg:mb-3 block group-hover:scale-110 transition-transform duration-300">💼</span>
                          <p className="text-white font-semibold text-xs lg:text-base">Gestão</p>
                          <p className="text-white/60 text-xs lg:text-sm mt-1">Estratégica</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg lg:rounded-2xl p-3 lg:p-6 text-center border border-white/5 hover:bg-white/15 transition-all duration-300 group">
                          <span className="text-xl lg:text-3xl mb-2 lg:mb-3 block group-hover:scale-110 transition-transform duration-300">📱</span>
                          <p className="text-white font-semibold text-xs lg:text-base">Tecnologia</p>
                          <p className="text-white/60 text-xs lg:text-sm mt-1">Inovação</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg lg:rounded-2xl p-3 lg:p-6 text-center border border-white/5 hover:bg-white/15 transition-all duration-300 group">
                          <span className="text-xl lg:text-3xl mb-2 lg:mb-3 block group-hover:scale-110 transition-transform duration-300">🎓</span>
                          <p className="text-white font-semibold text-xs lg:text-base">Mentoria</p>
                          <p className="text-white/60 text-xs lg:text-sm mt-1">Compartilhamento</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card de Destaque elegante */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-[#0B7A48]/10 via-[#0ea65f]/10 to-[#0B7A48]/10 backdrop-blur-md rounded-2xl lg:rounded-3xl border border-[#0B7A48]/20 p-4 lg:p-8 h-full shadow-xl">
                <div className="text-center mb-4 lg:mb-8">
                  <div className="text-4xl lg:text-7xl mb-3 lg:mb-6 filter drop-shadow-lg">🏆</div>
                  <h4 className="text-lg lg:text-2xl font-bold text-white mb-2">Por que a Mari?</h4>
                  <p className="text-white/70 text-xs lg:text-sm">Conheça os diferenciais que fazem dela nossa embaixadora oficial</p>
                </div>
                <ul className="space-y-2 lg:space-y-4">
                  <li className="flex items-start text-white group">
                    <span className="text-[#0B7A48] mr-2 lg:mr-3 flex-shrink-0 mt-1 text-base lg:text-xl group-hover:scale-110 transition-transform duration-300">✨</span>
                    <div>
                      <span className="font-semibold text-xs lg:text-base">Experiência Comprovada</span>
                      <p className="text-white/70 text-xs lg:text-sm mt-1">Anos de prática em confeitaria profissional</p>
                    </div>
                  </li>
                  <li className="flex items-start text-white group">
                    <span className="text-[#0B7A48] mr-2 lg:mr-3 flex-shrink-0 mt-1 text-base lg:text-xl group-hover:scale-110 transition-transform duration-300">✨</span>
                    <div>
                      <span className="font-semibold text-xs lg:text-base">Especialista em Gestão</span>
                      <p className="text-white/70 text-xs lg:text-sm mt-1">Conhecimento profundo em negócios</p>
                    </div>
                  </li>
                  <li className="flex items-start text-white group">
                    <span className="text-[#0B7A48] mr-2 lg:mr-3 flex-shrink-0 mt-1 text-base lg:text-xl group-hover:scale-110 transition-transform duration-300">✨</span>
                    <div>
                      <span className="font-semibold text-xs lg:text-base">Passion por Tecnologia</span>
                      <p className="text-white/70 text-xs lg:text-sm mt-1">Inovação e transformação digital</p>
                    </div>
                  </li>
                  <li className="flex items-start text-white group">
                    <span className="text-[#0B7A48] mr-2 lg:mr-3 flex-shrink-0 mt-1 text-base lg:text-xl group-hover:scale-110 transition-transform duration-300">✨</span>
                    <div>
                      <span className="font-semibold text-xs lg:text-base">Compartilhamento</span>
                      <p className="text-white/70 text-xs lg:text-sm mt-1">Dedicação à comunidade de confeiteiros</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
                  </div>
      </section>
      {/* Preços Section */}
      <section className="py-20 bg-[#2D1810]">
        <div className="container">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Escolha seu Plano
            </h2>
            <p className="text-white/70 text-lg">
              Transforme sua confeitaria em um negócio lucrativo
            </p>
          </div>
          
          {/* Cards de planos */}
          <div className="grid lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* Plano Básico */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Plano Básico</h3>
                <p className="text-white/60 text-sm">Para quem está começando</p>
              </div>
              
              <div className="text-center mb-6">
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-white">R$ 26,99</span>
                  <span className="text-white/60 ml-2">/mês</span>
                </div>
              </div>
              
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-white/80">
                  <span className="text-[#0B7A48] mr-3">✓</span>
                  <span>Controle de ingredientes</span>
                </li>
                <li className="flex items-center text-white/80">
                  <span className="text-[#0B7A48] mr-3">✓</span>
                  <span>Controle suas receitas</span>
                </li>
                <li className="flex items-center text-white/80">
                  <span className="text-[#0B7A48] mr-3">✓</span>
                  <span>Custo e precificação da receita</span>
                </li>
                <li className="flex items-center text-white/80">
                  <span className="text-[#0B7A48] mr-3">✓</span>
                  <span>Plataforma amigável, fácil de entender</span>
                </li>
                <li className="flex items-center text-white/80">
                  <span className="text-[#0B7A48] mr-3">✓</span>
                  <span>Suas receitas salvas em ambiente seguro</span>
                </li>
              </ul>
              
              <Link href="/register" className="block">
                <button className="w-full py-3 bg-white/10 text-white rounded-lg font-medium hover:bg-[#0B7A48] transition-colors">
                  Começar Agora
                </button>
              </Link>
              
              <p className="text-center text-white/50 text-xs mt-3">
                Cancele quando quiser
              </p>
            </div>
            
            {/* Plano PRO */}
            <div className="relative bg-gradient-to-br from-[#0B7A48]/10 to-[#0ea65f]/10 border-2 border-[#0B7A48]/20 rounded-xl p-6">
              {/* Badge */}
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <div className="bg-[#0B7A48] text-white px-4 py-1 rounded-full text-xs font-bold">
                  MAIS POPULAR
                </div>
              </div>
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Plano PRO</h3>
                <p className="text-white/60 text-sm">Para quem quer lucrar mais</p>
              </div>
              
              <div className="text-center mb-6">
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-white">R$ 29,89</span>
                  <span className="text-white/60 ml-2">/mês</span>
                </div>
                <p className="text-[#0B7A48] font-semibold text-sm mt-2">
                  Aumente seu faturamento em até 76%
                  </p>
                </div>
                
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-white/80">
                  <span className="text-[#0B7A48] mr-3">✓</span>
                    <span>Controle completo de ingredientes e estoque</span>
                  </li>
                <li className="flex items-center text-white/80">
                  <span className="text-[#0B7A48] mr-3">✓</span>
                    <span><strong className="text-yellow-400">TODAS</strong> as suas receitas gerenciadas</span>
                  </li>
                <li className="flex items-center text-white/80">
                  <span className="text-[#0B7A48] mr-3">✓</span>
                    <span>Calculadora avançada de preços e custos</span>
                  </li>
                <li className="flex items-center text-white/80">
                  <span className="text-[#0B7A48] mr-3">✓</span>
                    <span>Simulador de orçamentos</span>
                  </li>
                <li className="flex items-center text-white/80">
                  <span className="text-[#0B7A48] mr-3">✓</span>
                    <span>Atualização automática de preços</span>
                  </li>
                <li className="flex items-center text-white/80">
                  <span className="text-[#0B7A48] mr-3">✓</span>
                    <span>Sistema de apoio à decisão</span>
                  </li>
                <li className="flex items-center text-white/80">
                  <span className="text-[#0B7A48] mr-3">✓</span>
                    <span>Interface intuitiva e amigável</span>
                  </li>
                <li className="flex items-center text-white/80">
                  <span className="text-[#0B7A48] mr-3">✓</span>
                    <span>Menu Online completo (ilimitados)</span>
                  </li>
                <li className="flex items-center text-white/80">
                  <span className="text-[#0B7A48] mr-3">✓</span>
                    <span>Orçamentos Digitais profissionais</span>
                  </li>
                <li className="flex items-center text-white/80">
                  <span className="text-[#0B7A48] mr-3">✓</span>
                    <span>Controle seus clientes</span>
                  </li>
                <li className="flex items-center text-white/80">
                  <span className="text-[#0B7A48] mr-3">✓</span>
                  <span>Linktree Doce Gestão</span>
                </li>
                  
                {/* Seção Em Breve */}
                  <li className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-center mb-2">
                    <span className="bg-purple-500 text-white text-xs px-2 py-0.5 rounded mr-2">Em breve</span>
                    <span className="text-white font-medium text-sm">Recursos exclusivos</span>
                  </div>
                  <ul className="space-y-1 pl-4">
                    <li className="flex items-center text-white/70">
                      <span className="text-[#0B7A48] mr-2 text-xs">•</span>
                      <span className="text-xs">IA para cozinheiros</span>
                      </li>
                    <li className="flex items-center text-white/70">
                      <span className="text-[#0B7A48] mr-2 text-xs">•</span>
                      <span className="text-xs">Tendências culinárias</span>
                      </li>
                    <li className="flex items-center text-white/70">
                      <span className="text-[#0B7A48] mr-2 text-xs">•</span>
                      <span className="text-xs">Produtos em alta</span>
                      </li>
                    <li className="flex items-center text-white/70">
                      <span className="text-[#0B7A48] mr-2 text-xs">•</span>
                      <span className="text-xs">Receitas mais buscadas</span>
                      </li>
                    <li className="flex items-center text-white/70">
                      <span className="text-[#0B7A48] mr-2 text-xs">•</span>
                      <span className="text-xs">Cursos</span>
                      </li>
                    </ul>
                  </li>
                </ul>
              
              <Link href="/register" className="block">
                <button className="w-full py-3 bg-[#0B7A48] text-white rounded-lg font-medium hover:bg-[#0ea65f] transition-colors">
                  Quero Lucrar Mais
                    </button>
                  </Link>
              
              <p className="text-center text-white/50 text-xs mt-3">
                    Experimente por 7 dias com garantia de satisfação
                  </p>
            </div>
          </div>
          
          {/* CTA */}
          <div className="mt-12 text-center">
            <div className="bg-white/5 rounded-xl p-6 max-w-lg mx-auto border border-white/10">
              <h3 className="text-xl font-bold text-white mb-3">Ainda tem dúvidas?</h3>
              <p className="text-white/70 mb-4 text-sm">
                Nossos especialistas estão prontos para ajudar você
              </p>
              <Link href="/contato">
                <button className="px-6 py-2 bg-[#0B7A48] text-white rounded-lg font-medium hover:bg-[#0ea65f] transition-colors">
                  Falar com Especialista
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
      {/* <section className="py-6 md:py-16 bg-gray-100 -mt-4 md:mt-0">
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
      </section> */}


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
                Junte-se a mais de 500 confeiteiros e confeitarias
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
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/70 to-black/80" />
        </div>
        
        <div className="container relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            ENTRE EM CONTATO
          </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Estamos aqui para ajudar você a transformar sua confeitaria em um negócio de sucesso
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8 text-white">
            {/* Social Media */}
            <div className="bg-white/10 backdrop-blur-md p-6 lg:p-8 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300 group">
              <div className="flex items-center mb-4 lg:mb-6">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl flex items-center justify-center mr-3 lg:mr-4 group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 lg:w-6 lg:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
                <h3 className="text-xl lg:text-2xl font-bold">SOCIAL</h3>
              </div>
              <div className="space-y-3 lg:space-y-4">
                <a 
                  href="https://instagram.com/minha.docegestao" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors group"
                >
                  <svg className="w-4 h-4 lg:w-5 lg:h-5 mr-3 text-pink-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  <span className="font-medium text-sm lg:text-base">@minha.docegestao</span>
                  <svg className="w-3 h-3 lg:w-4 lg:h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
                <a 
                  href="https://wa.me/5511932589622" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors group"
                >
                  <svg className="w-4 h-4 lg:w-5 lg:h-5 mr-3 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                  <span className="font-medium text-sm lg:text-base">WhatsApp</span>
                  <svg className="w-3 h-3 lg:w-4 lg:h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
            
            {/* Address */}
            <div className="bg-white/10 backdrop-blur-md p-6 lg:p-8 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300 group">
              <div className="flex items-center mb-4 lg:mb-6">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mr-3 lg:mr-4 group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 lg:w-6 lg:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-xl lg:text-2xl font-bold">ENDEREÇO</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-start">
                  <svg className="w-4 h-4 lg:w-5 lg:h-5 mr-3 mt-0.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <div>
                    <p className="font-medium text-sm lg:text-base">Rua São João, 123</p>
                    <p className="text-gray-300 text-sm lg:text-base">Centro - São Paulo</p>
                    <p className="text-gray-300 text-sm lg:text-base">CEP: 01234-567</p>
                  </div>
                </div>
                <a 
                  href="https://maps.google.com/?q=Rua+São+João,+123,+São+Paulo" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors text-sm lg:text-base"
                >
                  <svg className="w-3 h-3 lg:w-4 lg:h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Ver no Google Maps
                </a>
              </div>
            </div>
            
            {/* Contact */}
            <div className="bg-white/10 backdrop-blur-md p-6 lg:p-8 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300 group md:col-span-2 lg:col-span-1">
              <div className="flex items-center mb-4 lg:mb-6">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-3 lg:mr-4 group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 lg:w-6 lg:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <h3 className="text-xl lg:text-2xl font-bold">CONTATO</h3>
              </div>
              <div className="space-y-3 lg:space-y-4">
                <a 
                  href="tel:+5511932589622"
                  className="flex items-center p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors group"
                >
                  <svg className="w-4 h-4 lg:w-5 lg:h-5 mr-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="font-medium text-sm lg:text-base">(11) 93258-9622</span>
                  <svg className="w-3 h-3 lg:w-4 lg:h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </a>
                <a 
                  href="mailto:contato@minhadocegestao.com.br"
                  className="flex items-center p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors group"
                >
                  <svg className="w-4 h-4 lg:w-5 lg:h-5 mr-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="font-medium text-sm lg:text-base break-all">contato@minhadocegestao.com.br</span>
                  <svg className="w-3 h-3 lg:w-4 lg:h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-16">
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-white mb-4">
                Pronto para alcançar o sucesso?
              </h3>
              <p className="text-gray-300 mb-6">
                Comece hoje mesmo e veja sua renda crescendo com nossas ferramentas profissionais
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/register" 
                  className="bg-gradient-to-r from-[#0B7A48] to-[#0ea65f] text-white px-8 py-3 rounded-xl font-semibold hover:from-[#0ea65f] hover:to-[#0B7A48] transition-all duration-300 transform hover:scale-105"
                >
                  Começar Agora
                </a>
                <a 
                  href="/login" 
                  className="bg-white/10 text-white px-8 py-3 rounded-xl font-semibold border border-white/20 hover:bg-white/20 transition-all duration-300"
                >
                  Já tenho conta
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp Float Button */}
      <WhatsAppFloat position="right" />

      {/* Coupon Popup */}
      {/* <CouponPopup /> */}
    </main>
  )
} 