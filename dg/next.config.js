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
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3002/:path*'
      }
    ]
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
  }
}

module.exports = nextConfig 

