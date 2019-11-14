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
