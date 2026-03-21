from django.utils.translation import gettext_lazy as _

from cookbook.integration.integration import Integration


class PDFexport(Integration):

    def get_recipe_from_file(self, file):
        raise NotImplementedError(_('Method not implemented in storage integration'))

    def get_files_from_recipes(self, recipes, el, cookie):
        raise NotImplementedError(_(
            'PDF export is not currently available. '
            'Use your browser\'s print function (Ctrl+P) to save recipes as PDF.'
        ))
