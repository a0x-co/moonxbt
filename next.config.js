/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Avoid react-dev-overlay source-map recursion on malformed/injected stacks.
      config.devtool = false;
    }
    return config;
  },
};

module.exports = nextConfig; 