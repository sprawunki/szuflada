import adapter from '@sveltejs/adapter-static';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess(),

	kit: {
		paths: {
			base: '/szuflada',
			relative: false
		},
		adapter: adapter({
			pages: 'build',
			assets: 'build'
		})
	}
};

export default config;
