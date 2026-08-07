import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Don't auto-generate AGENTS.md / CLAUDE.md — this project is meant to stay
  // small enough to read in one sitting.
  agentRules: false,
  // Keeps the dev-only floating badge out of the way while checking layout.
  devIndicators: false,
};

export default nextConfig;
