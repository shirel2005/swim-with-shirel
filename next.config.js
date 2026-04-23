/** @type {import('next').NextConfig} */
const nextConfig = {
  // Exclude native Node.js modules from webpack bundling.
  // better-sqlite3 (C++ native) and nodemailer (Node-only APIs) must NOT be bundled.
  serverExternalPackages: ['better-sqlite3', 'nodemailer'],

  // Standalone output produces a minimal self-contained build — smaller image,
  // faster cold starts, lower runtime memory on Railway.
  output: 'standalone',
}

module.exports = nextConfig
