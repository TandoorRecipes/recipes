import en from '@vueform/vueform/locales/en'
import material from '@vueform/vueform/dist/material'
import { defineConfig } from '@vueform/vueform'

// You might place these anywhere else in your project
import '@vueform/vueform/dist/material.css';

export default defineConfig({
  theme: material,
  locales: { en },
  locale: 'en',
  overrideClasses: {
    // ElementAddon: {
    //   container: 'vf-addon ps-0 pe-0',
    // }
  },

})
