<template>
    <h2>Search</h2>
    <v-combobox
        :items="flat_recipes"
        append-inner-icon="mdi-microphone"
        auto-select-first
        class="flex-full-width"
        density="comfortable"
        item-props
        menu-icon=""
        placeholder="Search Google or type a URL"
        prepend-inner-icon="mdi-magnify"
        rounded
        theme="light"
        variant="solo"
        :custom-filter="customFilter"
      ></v-combobox>

    <v-row>
        <v-col cols="12" sm="3" md="4" v-for="r in recipes" :key="r.id">
            <RecipeCardComponent :recipe="r"></RecipeCardComponent>
        </v-col>
    </v-row>

</template>

<script lang="ts">
import {defineComponent} from 'vue'
import {ApiApi, Recipe} from "@/openapi";
import KeywordsComponent from "@/components/display/KeywordsBar.vue";
import RecipeCardComponent from "@/components/display/RecipeCard.vue";

export default defineComponent({
    name: "RecipeSearchPage",
    components: {RecipeCardComponent, KeywordsComponent},
    data() {
        return {
            recipes: [] as Recipe[],
            flat_recipes: [] as Array<string>
        }
    },
    mounted() {
        const api = new ApiApi()
        api.listRecipes().then(r => {
            this.recipes = r.results
        })

        this.flat_recipes = ["Bouillon papardelle et bolognaise", "Pandoro", "torta fresca", "a\u00efoli", "Aioli senza uovo", "Anelli di calamari con ricotta e grana padano", "Arrosto al forno di manzo", "Asparagi bianchi, zabaione al passito e crumble di prosciutto", "Avocado al forno", "Baccal\u00e0 alla potentina", "Baccal\u00e0 alla vicentina", "Baccal\u00e0 Pil Pil", "Bagna cauda", "Bavarese al cioccolato bianco e lavanda", "Bavarese Al Mango", "Bavarese di ricotta con sorpresa di ribes", "Besciamella", "Besciamella senza glutine", "Beurre Blanche", "Biscotti con scaglie di cioccolato", "Biscotti dita di strega per Halloween", "Biscotti Salati", "Biscotti Sani", "Blanquette de veau \u00e0 l'ancienne", "Bocconi di rana pescatrice con verdurine", "Borsh", "BRACIOLE DI MAIALE AL CAFF\u00c8 CON CREMOSA SALSA WHISKY", "Branzino al cartoccio", "Branzino al sale: la ricetta per fare la spigola in crosta di sale", "Brodetto di pesce", "BRODO DI BUCCIA DI ZUCCA", "BRODO DI CALDARROSTE", "Brodo di carne", "Brodo di gallina (o pollo)", "BRODO DI GAMBERI ROSSI DI MAZARA", "BRODO DI MINESTRONE", "Brodo di pesce", "Brownies al cacao", "Burger di fagioli rucola e feta", "burrata e pomodori", "Caesar salad", "Calamari ripieni di ricotta e catalogna", "Calamari su vellutata di zucchine e patate", "Calamaro ripieno, ricetta classica", "Canederli kn\u00f6del", "CANNOLI DI PANDORO TIRAMISU", "Capesante con arancia e salsa di avocado", "CAPESANTE CON PUR\u00c8 DI ZUCCA ALL\u2019ARANCIA", "Caponata di melanzane, delizia agrodolce", "Caponata senza glutine", "Cappelli delle streghe", "CARAMELLO SALATO", "Carbonara di seppie", "Carpaccio di manzo", "Carpaccio di tonno", "Caviale di melanzane - Babaganoush", "Cavolfiore fritto", "Cavolo rosso in padella - Ricetta con foto il Cuore in Pentola", "Cernia in crosta di pane", "Ceviche peruviano", "Cheesecake ai mirtilli", "Cheesecake al limone", "Chicken Caesar salad", "Chicken Rub", "Chimichurri", "Chiokapic", "Chips di pecorino", "Chocolate Mousse and Cherry Gelee Spheres", "Cialde corallo", "Cialdine di Parmigiano Reggiano Dop", "Cipolla In Agrodolce", "cipolla scura al forno", "Cipolle pickle", "Cipolle ripiene al forno", "Clam Chowder", "COME FARE LA RICOTTA", "Come fare lo zabaione all\u2019arancia", "Come fare una crema al limone favolosa: solo se hai il Bimby ti viene cos\u00ec! - RicettaSprint.it", "Composta Di Mele", "Condimento per pesce crudo", "Confettura di cipolle di Tropea", "CONSOMM\u00c9", "COPPA DI CHEESECAKE AL CAFFE'", "Costolette Di Maiale", "Cotolette alla Kiev", "Cous cous", "Cozze alla marinara", "Cozze in salsa di vino bianco e panna", "Crema Al Limone", "Crema al mascarpone", "CREMA ALL\u2019ARANCIA CON LATTE DI MANDORLA", "Crema di avocado", "Crema di Parmigiano", "Crema di pesche con amaretti e gelatina di mango e Amaretto: ricetta gourmet", "Crema di zucca (Vellutata di zucca): la Ricetta perfetta, veloce e squisita!", "Crema pasticcera", "Crema pasticcera smart", "Crema pasticciera", "Crema ricotta e cannella", "Creme brul\u00e8e", "Creme Caramel", "Crepe con farina di ceci", "Crepes", "Crepes funghi e besciamella", "Crescenza di anacardi", "Crespelle di ceci con zucca, spinaci e funghi", "Crocche Di Gamberi", "Croissant", "Crostata al limone", "CROSTATA CREMA LATTE ALL'ARANCIA dolce ripieno cremoso", "Crudit\u00e8 al curry", "Crumble", "crumble salato", "Crystal bread", "Curry di ceci la ricetta indiana da preparare in meno di mezz'ora - RicettaSprint.it", "Dado Vegetale", "Dahl di lenticchie in vasocottura", "daurade marin\u00e9 \u00e0 la bi\u00e8re de monaco et zeste d'orange", "DESSERT CON SFOGLIATINE E CREMA AL MASCARPONE", "Dolce all'arancia", "dolce di fichi", "Dolcetti all'arancia", "epaule d'agneau confite aux \u00e9pices", "Banana Shape Chia-Joghurt", "Kakao-Bananen-Muffins", "Pfannkuchen mit Erdbeer-Rhabarber-Marmelade", "H\u00e4hnchenstreifen mit Salat", "Buntes Pfannen Gem\u00fcse mit H\u00e4hnchenbrust im Arizona-Pfeffer", "Curryh\u00e4hnchen", "Pfannkuchen mit Erdbeer-Rhabarber-Marmelade", "Banana Shape Chia-Joghurt", "Kakao-Bananen-Muffins", "Pfannkuchen mit Erdbeer-Rhabarber-Marmelade", "H\u00e4hnchenstreifen mit Salat", "Buntes Pfannen Gem\u00fcse mit H\u00e4hnchenbrust im Arizona-Pfeffer", "Curryh\u00e4hnchen", "Roggenbrot", "Gem\u00fcselasagne", "Gebackene Auberginen", "Zucchini-M\u00f6hren-Puffer", "Mini-Apfelstrudel mit Filoteig", "Frischer Mangosalat", "Zucchini-Paprika-M\u00f6hren-Frittata mit H\u00fcttenk\u00e4se und Tomaten", "Hasselback-Kartoffeln", "Pizzateig (Flammkuchenteig)", "Chicor\u00e9e Rollladen Auflauf", "Gem\u00fcsepfanne", "Ohne Mehl: Rezept f\u00fcr leckere Zucchini-Muffins mit Chili und Feta", "Cremige Maissuppe", "Kathis Dunkle Cookies", "Grillpizza", "Italienischer Nudelsalat", "Kathis Apfelkuchen", "Nussecken", "Stollen", "Wok", "Pancake (Mini-Spie\u00dfe)", "Kassler in Bl\u00e4tterteig", "Baklava", "Bohneneintopf", "Galette Frangipane (Franz\u00f6sischer Bl\u00e4tterteig Kuchen)", "Giotto-Torte", "Spaghetti mit Feigen und Ziegenk\u00e4se", "Ipanema", "Mai Tai", "Wikingertopf", "Tequila Sunrise", "Hurricane", "Sauerkraut-Kasseler-Pfanne mit Schupfnudeln", "Putenkeulen", "Mojito", "Apfelschichtkuchen", "Lachs in Honigglasur mit Mango-Avocado-Salsa", "Spinat-Curry mit Erdn\u00fcssen", "H\u00fcttenk\u00e4setaler", "White Russian", "Risotto mit Pfifferlingen, Zucchini, Serranoschinken und Pecorino", "Gelbe Sauce", "Tortellini-Spinat-Auflauf", "H\u00e4hnchen-Gnocchi-Pfanne mit M\u00f6hren", "Jans Linsen Curry", "Schweinefilet in Curry-Sahne", "Griechischer Salat", "Vegetarische Frikadellen", "Caipirinha", "Cannelloni mit Spinat-Ricotta", "Gnocchi-Gem\u00fcseauflauf mit Hackfleischso\u00dfe", "Rotk\u00e4ppchenkuchen", "Lachs-Spinat-Lasagne Rezept", "Lasagne mit Mozzarella und Parmaschinken", "Rote Bete Carpaccio mit Rucola und Ziegenk\u00e4se", "Ofenpfannkuchen mit Gem\u00fcse & Feta", "Vegetarische Linsen-Lasagne", "Saure Bohnen Eintopf", "Crepesteig", "Gef\u00fcllte Auberginen", "Moscow Mule", "Bunte Kichererbsenpfanne", "Vegetarischer Nudel-Spinat-Auflauf mit Rote Beten", "Raclette", "Vegetarische Spinat-Lasagne al forno", "Pina Colada", "Obazda", "Kleine R\u00f6llchen ganz gro\u00df: Zucchini-Rollen mit Ricotta-Basilikum-Creme", "Samasa Bl\u00e4tterteig Taschen", "K\u00fcrbissuppe", "Asia-Gem\u00fcse mit ger\u00f6stetem Sesam", "KERNIGER ROTE-BETE-SALAT AUS DEM THERMOMIX\u00ae", "Teigtaschen mit Spinat-Feta-F\u00fcllung", "Marzipan-Torte", "Kohlrabi in Parmesan-Kr\u00e4uter-Panade", "Avocado-Tomaten Salsa zu Red Snapper", "Spie\u00dfbraten", "Knusprige Putenr\u00f6llchen", "Ger\u00f6stete K\u00fcrbiskerne", "Magaretenpl\u00e4tzchen", "Bayerische Semmelkn\u00f6del", "Gebratene Nudeln mit Gem\u00fcse, asiatisch", "Schnelle Asia-Gem\u00fcsepfanne", "Westf\u00e4lische Quarkspeise", "Weckmann (Hefeteig)", "Helgas Wirsingeintopf", "Linsen-Mangold-Curry", "Vegane Brokkoli-K\u00e4se-Suppe mit M\u00f6hren", "Vegetarisches Linsen-Chili mit Reis", "Nudelauflauf mit H\u00e4hnchen und Spinat", "Rote-Bete-Burger - vegan mit Guacamole und R\u00f6stzwiebeln", "Spaghetti mit Bacon, Fr\u00fchlingszwiebeln, Tomaten Sahne-Sauce", "Obstboden", "Chili con Carne", "Toskanischer Filet-Topf", "Rigatoni mit Tomaten-Sahne-Sauce", "Kathis Lasagne", "Pfirsichkuchen von Petra", "Brombeerkuchen", "Lauchcremesuppe", "K\u00e4se Lauch Suppe", "Bergische Waffeln", "Cannelloni della Nonna", "Salatdressing a la Mama", "Apfel-Zimt-Kuchen", "Zucchini Hackfleischauflauf", "Helga's Kartoffelsalat", "Kalbsschnitzel gratiniert", "Sauerteig Anstellgut", "Nuss Marzipan Kranz Striezel", "Erdbeer Tiramisu", "Burger", "Roggenbrot", "Baguette", "Risotto mit gr\u00fcnem Spargel", "Zwiebelkuchen", "Pita Brot", "Goldstulle s\u00fc\u00dfes Brot", "Gyros Spie\u00df", "Rote-Linsen-Salat mit Ziegenk\u00e4se im Speckmantel", "Parmigiana di Melanzane", "Zucchini-Ricotta-Puffer mit buntem Tomatensalat", "Vegetarische Zucchini-Karotten-Puffer", "Naan Brot", "Mit Quinoa gef\u00fcllte Zucchini mit einem Walnuss-Ziegenk\u00e4se-Topping", "Indisches Rotes Linsen Dal", "Tomatenreis mit mediterranem Gem\u00fcse", "Schoko - Souffle", "Veganer Bohnenburger", "Quiche", "S\u00fc\u00dfkartoffel Taler vom Grill", "Risotto mit getrockneten Tomaten und Rucola dazu Ziegenk\u00e4se", "Maiseintopf", "Eintopf mit Lamm und Auberginen", "Schoko-Souffl\u00e9", "Nudelauflauf mit Parmesanstreuseln", "Quinoa Powersalat mit Tomaten und Avocado", "Gem\u00fcsepfanne"]

    },
    methods: {
        customFilter: function (itemTitle: string, queryText: string, item: any){
            return item
        }
    }
})
</script>

<style scoped>

</style>