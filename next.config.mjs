/** @type {import('next').NextConfig} */
const nextConfig = {
  // Önceki ayarlarınız...
  
  // CSS dosyalarını işlemek için webpack yapılandırması ekleyin
  webpack: (config) => {
    config.module.rules.push({
      test: /\.css$/,
      use: ['style-loader', 'css-loader'],
    });
    return config;
  },
  
  // Diğer ayarlarınız...
  reactStrictMode: true,
  swcMinify: true,
};

export default nextConfig;