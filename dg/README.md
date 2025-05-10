# Docinho - Sistema de Gestão para Confeitaria

Sistema de gestão financeira desenvolvido especialmente para confeiteiros e doceiros.

## Tecnologias Utilizadas

- Next.js 14
- TypeScript
- Tailwind CSS
- React Icons

## Pré-requisitos

- Node.js 18+
- npm ou yarn

## Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd dg
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

O sistema estará disponível em `http://localhost:3000`

## Imagens Necessárias

Para o site funcionar corretamente, você precisa adicionar as seguintes imagens na pasta `public/images`:

1. `hero-bg.jpg` - Imagem de fundo da seção hero (1920x1080px)
2. `confeitaria-trabalho.jpg` - Imagem de confeiteiro trabalhando (500x300px)
3. `bolo-casamento.jpg` - Imagem de bolo de casamento (400x300px)
4. `cupcake.jpg` - Imagem de cupcake (400x300px)
5. `confeiteiros.jpg` - Imagem de confeiteiros trabalhando (500x300px)
6. `chef1.jpg` - Foto do primeiro chef (60x60px)
7. `chef2.jpg` - Foto do segundo chef (60x60px)

Todas as imagens devem estar em formato JPG e nas dimensões especificadas para melhor resultado visual.

## Cores do Tema

- Verde Principal: `#0B7A48`
- Marrom Escuro: `#2D1810`
- Texto: `#333333`
- Fundo: `#FFFFFF`
- Verde Claro (Accent): `#4CAF50`

## Estrutura do Projeto

```
dg/
├── app/                    # Diretório principal da aplicação
│   ├── components/        # Componentes React
│   ├── login/            # Página de login
│   └── register/         # Página de registro
├── public/               # Arquivos estáticos
│   └── images/          # Imagens do site
```

## Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria a build de produção
- `npm run start` - Inicia o servidor de produção
- `npm run lint` - Executa o linter
