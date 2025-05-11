/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    config.cache = false;
    
    if (isServer) {
      config.externals = [...(config.externals || []), 
        'typeorm',
        'pg-native',
        'pg',
        'pg-query-stream',
        'reflect-metadata'
      ]
    }

    // Ignorar módulos problemáticos
    config.resolve.alias = {
      ...config.resolve.alias,
      'undici': false,
      'pg-native': false,
      'pg-cloudflare': false,
      'cloudflare:sockets': false
    }

    // Configuração para ignorar erros de módulos específicos
    config.module.rules.push({
      test: /\.js$/,
      include: /node_modules\/(undici|pg-cloudflare)/,
      use: {
        loader: 'ignore-loader'
      }
    })

    // Configuração para o TypeORM
    if (isServer) {
      config.module.rules.push({
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              compilerOptions: {
                module: 'commonjs',
                moduleResolution: 'node'
              }
            }
          }
        ]
      })
    }

    return config
  },
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  output: 'standalone',
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
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  staticPageGenerationTimeout: 120,
  experimental: {
    serverActions: true,
    serverMinification: false,
  }
}

module.exports = nextConfig 

