/** @type {import('next').NextConfig} */
const nextConfig = {
  // Exclude native Node.js packages from webpack bundling.
  // better-sqlite3 uses C++ native bindings and must not be bundled.
  serverExternalPackages: ['better-sqlite3'],
}

module.exports = nextConfig
