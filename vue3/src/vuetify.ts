import '@fortawesome/fontawesome-free/css/all.css'
import 'vuetify/styles'
import {aliases, fa} from 'vuetify/iconsets/fa'

// Composables
import {createVuetify} from 'vuetify'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
    defaults: {
        // disabled as this leads to cards overflowing if not careful, manually set on cards containing a multiselect until proper solution is found
        // VCard: {
        //     class: 'overflow-visible' // this is needed so that vue-multiselect options show above a card, vuetify uses overlay container to avoid this
        // }
    },
    theme: {
        defaultTheme: 'light',
        themes: {
            light: {
                colors: {
                    background: '#f5efea',
                    tandoor: '#ddbf86',
                    primary: '#b98766',
                    secondary: '#b55e4f',
                    success: '#82aa8b',
                    info: '#385f84',
                    warning: '#eaaa21',
                    error: '#a7240e',

                    save: '#82aa8b',
                    create: '#82aa8b',
                    edit: '#385f84',
                    delete: '#a7240e',
                    cancel: '#eaaa21',
                },
            },
            dark: {
                colors: {
                    tandoor: '#ddbf86',
                    primary: '#b98766',
                    secondary: '#b55e4f',
                    success: '#82aa8b',
                    info: '#385f84',
                    warning: '#eaaa21',
                    error: '#a7240e',

                    save: '#82aa8b',
                    create: '#82aa8b',
                    edit: '#385f84',
                    delete: '#a7240e',
                    cancel: '#eaaa21',
                },
            },
        },
    },
    icons: {
        defaultSet: 'fa',
        aliases : {
            ...aliases,
            save: 'fa-solid fa-floppy-disk',
            delete: 'fa-solid fa-trash-can',
            edit: 'fa-solid fa-pencil',
            create: 'fa-solid fa-circle-plus',
            search: 'fa-solid fa-magnifying-glass',
            copy: 'fa-solid fa-copy',
            settings: 'fa-solid fa-sliders',
            spaces: 'fa-solid fa-database',
            shopping: 'fa-solid fa-cart-shopping',
            mealplan: 'fa-solid fa-calendar-days',
            recipes: 'fa-solid fa-book',
            books: 'fa-solid fa-book-open',
        },
        sets: {
            fa,
        },
    },
})

