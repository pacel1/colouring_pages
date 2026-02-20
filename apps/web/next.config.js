/** @type {import('next').NextConfig} */
const nextConfig = {
  // Output standalone for better Docker support
  output: 'standalone',
  
  // Transpile shared package
  transpilePackages: ['@colouring-pages/shared'],
  
  // TypeScript config path
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // ESLint config path
  eslint: {
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;
