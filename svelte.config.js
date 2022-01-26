import adapter from "@sveltejs/adapter-auto";
import preprocess from "svelte-preprocess";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: [preprocess({})],
  
  kit:
  {
    adapter: adapter(),

    // hydrate the <div id="svelte"> element in src/public/app.html
    target: "#svelte",

    files:{
      assets: 'src/public/static',
      lib: 'src/lib',
      routes: 'src/routes',
      template: 'src/public/app.html',
    },
  }
}

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ request, resolve }) {
	const response = await resolve(request, {
		ssr: false
	});

	return response;
}

export default config;
