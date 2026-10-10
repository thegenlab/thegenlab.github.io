import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://thegenlab.ai',
  output: 'static',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
});
