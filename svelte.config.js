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
    ssr: false,

    files:{
      assets: 'src/public/static',
      lib: 'src/lib',
      routes: 'src/routes',
      template: 'src/public/app.html',
    },
  }
}

export default config;
