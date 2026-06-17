/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow @react-pdf/renderer
  webpack: (config: any) => {
    config.resolve.alias.canvas = false;
    return config;
  },
  turbopack: {},
  // External packages for server components
  serverExternalPackages: [],
};

export default nextConfig;
