from json import JSONDecodeError

from bs4 import BeautifulSoup
from recipe_scrapers import SCRAPERS, get_host_name
from recipe_scrapers._factory import SchemaScraperFactory
from recipe_scrapers._schemaorg import SchemaOrg

from .cooksillustrated import CooksIllustrated

CUSTOM_SCRAPERS = {
    CooksIllustrated.host(site="cooksillustrated"): CooksIllustrated,
    CooksIllustrated.host(site="americastestkitchen"): CooksIllustrated,
    CooksIllustrated.host(site="cookscountry"): CooksIllustrated,
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
            page_data,
            url=None
        ):
            self.wild_mode = False
            self.meta_http_equiv = False
            self.soup = BeautifulSoup(page_data, "html.parser")
            self.url = url
            self.recipe = None
            try:
                self.schema = SchemaOrg(page_data)
            except (JSONDecodeError, AttributeError):
                pass

    return TextScraper(text, url)
