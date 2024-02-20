import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Composables
import { createVuetify } from 'vuetify'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#b98766',
          secondary: '#b55e4f',
          success: '#82aa8b',
          info: '#385f84',
          warning: '#eaaa21',
          error: '#a7240e',
        },
      },
    },
  },
})

