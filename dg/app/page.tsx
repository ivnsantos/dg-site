'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import WhatsAppFloat from '@/components/WhatsAppFloat'

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
                  <span className="text-4xl font-bold text-white">R$ 40,99</span>
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
                  <span className="text-4xl font-bold text-white">R$ 47,89</span>
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

      {/* WhatsApp Float Button */}
      <WhatsAppFloat position="right" />
    </main>
  )
} 