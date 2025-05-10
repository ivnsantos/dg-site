/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
  // Desabilita o Edge Runtime globalmente
  runtime: 'nodejs',
  // Otimizações para produção
  swcMinify: true,
  // Configurações de webpack para otimizar o build
  webpack: (config, { isServer }) => {
    // Otimizações para o TypeORM
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        path: false,
        os: false,
        // Desabilita drivers desnecessários
        'react-native-sqlite-storage': false,
        '@sap/hana-client': false,
        'mysql': false,
        'mysql2': false,
        'oracledb': false,
        'pg-native': false,
        'sqlite3': false,
        'better-sqlite3': false,
        'mssql': false,
        'mongodb': false,
        'pg-query-stream': false,
        'pg-native': false,
        // Mantém apenas o driver PostgreSQL
        'pg': require.resolve('pg'),
      };
    }

    // Otimizações para PostgreSQL
    config.optimization = {
      ...config.optimization,
      minimize: true,
      minimizer: [
        ...(config.optimization.minimizer || []),
        new (require('terser-webpack-plugin'))({
          terserOptions: {
            compress: {
              drop_console: process.env.NODE_ENV === 'production',
            },
          },
        }),
      ],
    };

    // Adiciona suporte para decoradores do TypeORM
    config.module.rules.push({
      test: /\.ts$/,
      use: [
        {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
            compilerOptions: {
              module: 'esnext',
              experimentalDecorators: true,
              emitDecoratorMetadata: true
            }
          }
        }
      ]
    });

    config.resolve.alias = {
      ...config.resolve.alias,
      typeorm: require.resolve('typeorm'),
    };

    return config;
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Configuração para lidar com páginas não encontradas
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: true,
}

module.exports = nextConfig 