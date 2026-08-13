// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  base: '/',
  site: 'https://vault.sizo.dev',
  output: 'server',

  build: {
      inlineStylesheets: 'always'
  },

  integrations: [react()],

  vite: {
    plugins: [tailwindcss()]
  },

  adapter: node({
    mode: 'standalone',
  }),
  
});