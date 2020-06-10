class Provider:
    @staticmethod
    def import_all(monitor):
        raise Exception('Method not implemented in storage provider')

    @staticmethod
    def create_share_link(recipe):
        raise Exception('Method not implemented in storage provider')

    @staticmethod
    def get_share_link(recipe):
        raise Exception('Method not implemented in storage provider')

    @staticmethod
    def get_file(recipe):
        raise Exception('Method not implemented in storage provider')

    @staticmethod
    def rename_file(recipe, new_name):
        raise Exception('Method not implemented in storage provider')

    @staticmethod
    def delete_file(recipe):
        raise Exception('Method not implemented in storage provider')
