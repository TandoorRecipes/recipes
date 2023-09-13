import asyncio

import django.core.management.commands.runserver as runserver
from asgiref.sync import sync_to_async
from pyppeteer import launch

from cookbook.integration.integration import Integration


class PDFexport(Integration):

    def get_recipe_from_file(self, file):
        raise NotImplementedError('Method not implemented in storage integration')

    async def get_files_from_recipes_async(self, recipes, el, cookie):
        cmd = runserver.Command()

        browser = await launch(
            handleSIGINT=False,
            handleSIGTERM=False,
            handleSIGHUP=False,
            ignoreHTTPSErrors=True,
        )

        cookies = {'domain': cmd.default_addr, 'name': 'sessionid', 'value': cookie['sessionid'], }
        options = {'format': 'letter',
                   'margin': {
                       'top': '0.75in',
                       'bottom': '0.75in',
                       'left': '0.75in',
                       'right': '0.75in',
                   }
                   }

        files = []
        for recipe in recipes:

            page = await browser.newPage()
            await page.emulateMedia('print')
            await page.setCookie(cookies)

            await page.goto('http://' + cmd.default_addr + ':' + cmd.default_port + '/view/recipe/' + str(recipe.id), {'waitUntil': 'domcontentloaded'})
            await page.waitForSelector('#printReady')

            files.append([recipe.name + '.pdf', await page.pdf(options)])
            await page.close()

            el.exported_recipes += 1
            el.msg += self.get_recipe_processed_msg(recipe)
            await sync_to_async(el.save, thread_sensitive=True)()

        await browser.close()
        return files

    def get_files_from_recipes(self, recipes, el, cookie):
        return asyncio.run(self.get_files_from_recipes_async(recipes, el, cookie))
