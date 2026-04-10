/** @type {import('next').NextConfig} */
const nextConfig = {
  // Tell Next.js/webpack NOT to bundle these native Node.js modules.
  // better-sqlite3 has native C++ bindings and nodemailer uses Node.js-only APIs —
  // both crash the build if webpack tries to bundle them.
  serverExternalPackages: ['better-sqlite3', 'nodemailer'],
}

module.exports = nextConfig
