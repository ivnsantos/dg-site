/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    config.cache = false;
    
    // Ignorar módulos problemáticos
    config.resolve.alias = {
      ...config.resolve.alias,
      'undici': false,
      'pg-native': false,
      'pg-cloudflare': false,
      'cloudflare:sockets': false
    };

    // Configuração para ignorar erros de módulos específicos
    config.module.rules.push({
      test: /\.js$/,
      include: /node_modules\/(undici|pg-cloudflare)/,
      use: {
        loader: 'ignore-loader'
      }
    });

    return config;
  },
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  // Configuração para páginas dinâmicas
  output: 'standalone',
  experimental: {
    serverActions: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { "key": "Access-Control-Allow-Credentials", "value": "true" },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: '*' }
        ]
      }
    ]
  },
  // Configuração para páginas dinâmicas
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  // Configuração para ignorar erros de build em páginas específicas
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Configuração para forçar renderização dinâmica
  staticPageGenerationTimeout: 120,
  // Configuração para rotas dinâmicas
  async generateStaticParams() {
    return {
      dynamicParams: true
    }
  }
}

module.exports = nextConfig 

