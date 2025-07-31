import '@fortawesome/fontawesome-free/css/all.css'
import 'vuetify/styles'
import {aliases, fa} from 'vuetify/iconsets/fa'

// Composables
import {createVuetify} from 'vuetify'
import {DateTime} from "luxon";

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
    defaults: {
        // disabled as this leads to cards overflowing if not careful, manually set on cards containing a multiselect until proper solution is found
        // VCard: {
        //     class: 'overflow-visible' // this is needed so that vue-multiselect options show above a card, vuetify uses overlay container to avoid this
        // },
        // without this action buttons are left aligned in normal cards but right aligned in dialogs (I think)
        VCardActions: {
            class: 'float-right'
        },
        // limiting max width of base container so UIs dont become too wide
        VContainer: {
            maxWidth: '1400px'
        },
        // always localize the date display of DateInputs
        VDateInput: {
            displayFormat : (date: Date) => DateTime.fromJSDate(date).toLocaleString()
        },
        // always use color for switches to properly see if enabled or not
        VSwitch: {
            color: 'primary'
        }
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

                    recipeImagePlaceholderBg: '#ffffff',
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

                    recipeImagePlaceholderBg: '#212121',
                },
            },
        },
    },
    icons: {
        defaultSet: 'fa',
        aliases: {
            ...aliases,
            save: 'fa-solid fa-floppy-disk',
            delete: 'fa-solid fa-trash-can',
            edit: 'fa-solid fa-pencil',
            create: 'fa-solid fa-plus',
            upload: 'fa-solid fa-file-arrow-up',
            search: 'fa-solid fa-magnifying-glass',
            copy: 'fa-solid fa-copy',
            add: 'fa-solid fa-plus',
            close: 'fa-solid fa-xmark',
            help: 'fa-solid fa-info',
            settings: 'fa-solid fa-sliders',
            dragHandle: 'fa-solid fa-grip-vertical',
            spaces: 'fa-solid fa-database',
            shopping: 'fa-solid fa-cart-shopping',
            mealplan: 'fa-solid fa-calendar-days',
            recipes: 'fa-solid fa-book',
            books: 'fa-solid fa-book-bookmark',
            menu: 'fa-solid fa-ellipsis-vertical',
            import: 'fa-solid fa-globe',
            properties: 'fa-solid fa-database',
            automation: 'fa-solid fa-robot',
            ai: 'fa-solid fa-wand-magic-sparkles'
        },
        sets: {
            fa,
        },
    },
})

export type VDataTableUpdateOptions = {
    page: number;
    itemsPerPage: number;
    search: string;
    sortBy?: string;
    groupBy?: string;
}
