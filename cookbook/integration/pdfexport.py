import json
from io import BytesIO
from re import match
from zipfile import ZipFile
import asyncio
from pyppeteer import launch

from rest_framework.renderers import JSONRenderer

from cookbook.helper.image_processing import get_filetype
from cookbook.integration.integration import Integration
from cookbook.serializer import RecipeExportSerializer

import django.core.management.commands.runserver as runserver


class PDFexport(Integration):

    def get_recipe_from_file(self, file):
        raise NotImplementedError('Method not implemented in storage integration')





    async def get_files_from_recipes_async(self, recipes, cookie):
        cmd = runserver.Command()

        browser = await launch(
            handleSIGINT=False,
            handleSIGTERM=False,
            handleSIGHUP=False,
            ignoreHTTPSErrors=True
        )

        cookies = {'domain': cmd.default_addr, 'name': 'sessionid', 'value': cookie['sessionid'],}
        options = { 'format': 'letter',
                    'margin': {
                        'top': '0.75in',
                        'bottom': '0.75in',
                        'left': '0.75in',
                        'right': '0.75in',
                    }
                }

        page = await browser.newPage()
        await page.emulateMedia('print')
        await page.setCookie(cookies)

        files = []
        for recipe in recipes:
            await page.goto('http://'+cmd.default_addr+':'+cmd.default_port+'/view/recipe/'+str(recipe.id), {'waitUntil': 'networkidle0',})
            files.append([ recipe.name+'.pdf', await page.pdf(options) ])


        await browser.close()
        return files



    def get_files_from_recipes(self, recipes, cookie):
        return asyncio.run(self.get_files_from_recipes_async(recipes, cookie))
