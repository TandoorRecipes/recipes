from json import JSONDecodeError

from bs4 import BeautifulSoup
from recipe_scrapers import SCRAPERS, get_host_name
from recipe_scrapers._factory import SchemaScraperFactory
from recipe_scrapers._schemaorg import SchemaOrg

from .cooksillustrated import CooksIllustrated
from .cookidoo import Cookidoo

CUSTOM_SCRAPERS = {
    CooksIllustrated.host(site="cooksillustrated"): CooksIllustrated,
    CooksIllustrated.host(site="americastestkitchen"): CooksIllustrated,
    CooksIllustrated.host(site="cookscountry"): CooksIllustrated,
    "cookidoo.de": Cookidoo,
    "cookidoo.at": Cookidoo,
    "cookidoo.ch": Cookidoo,
}
SCRAPERS.update(CUSTOM_SCRAPERS)


def text_scraper(text, url=None):
    domain = None
    if url:
        domain = get_host_name(url)
    if domain in SCRAPERS:
        scraper_class = SCRAPERS[domain]
    else:
        scraper_class = SchemaScraperFactory.SchemaScraper

    class TextScraper(scraper_class):
        def __init__(
            self,
            html=None,
            url=None,
        ):
            self.wild_mode = False
            self.meta_http_equiv = False
            self.soup = BeautifulSoup(html, "html.parser")
            self.url = url
            self.recipe = None
            try:
                self.schema = SchemaOrg(html)
            except (JSONDecodeError, AttributeError):
                pass

    return TextScraper(url=url, html=text)
