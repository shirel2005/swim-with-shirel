/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 14: exclude native Node.js modules from webpack bundling.
  // better-sqlite3 (C++ native) and nodemailer (Node-only APIs) must NOT be bundled.
  experimental: {
    serverComponentsExternalPackages: ['better-sqlite3', 'nodemailer'],
  },
}

module.exports = nextConfig
