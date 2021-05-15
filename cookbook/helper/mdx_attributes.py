import markdown
from markdown.treeprocessors import Treeprocessor


class StyleTreeprocessor(Treeprocessor):

    def run_processor(self, node):
        for child in node:
            if child.tag == "table":
                child.set("class", "table table-bordered")
            if child.tag == "img":
                child.set("class", "img-fluid")
            self.run_processor(child)
        return node

    def run(self, root):
        self.run_processor(root)
        return root


class MarkdownFormatExtension(markdown.Extension):
    # md_ globals deprecated - see here:
    def extendMarkdown(self, md):
        md.treeprocessors.register(
            StyleTreeprocessor(),
            'StyleTreeprocessor',
            10
        )
