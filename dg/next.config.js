/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.cache = false;
    return config;
  },
    reactStrictMode: true,
    typescript: {
      ignoreBuildErrors: true
    },
    eslint: {
      ignoreDuringBuilds: true
    },
    experimental: {
      missingSuspenseWithCSRBailout: false
    },
  
  async rewrites() {
    return [
    
      {
        source: '/api/:path*',
        destination: 'http://localhost:3002/:path*'
      }
      // {
      //   source: '/api/:path*',
      //   destination: 'https://clipapi.vercel.app/:path*'
      // }
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Permite qualquer hostname https
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

