import { sveltekit } from '@sveltejs/kit/vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

/** @type {import('vite').UserConfig} */
const config = {
  server: {
    host: true,
  },
	plugins: [
		nodePolyfills(),
		sveltekit(),
	],
  worker: {
    format: "es",
  },
};

export default config;
