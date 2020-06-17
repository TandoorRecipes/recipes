from django.urls import reverse

from cookbook.tests.views.test_views import TestViews


class TestViewsGeneral(TestViews):

    def test_index(self):
        # TODO add appropriate test
        pass

    def test_search(self):
        # TODO add appropriate test
        pass

    def test_view(self):
        # TODO add appropriate test
        pass

    def test_books(self):
        url = reverse('view_books')
        self.batch_requests([(self.anonymous_client, 302), (self.guest_client_1, 302), (self.user_client_1, 200), (self.admin_client_1, 200), (self.superuser_client, 200)], url)

    def test_plan(self):
        url = reverse('view_plan')
        self.batch_requests([(self.anonymous_client, 302), (self.guest_client_1, 302), (self.user_client_1, 200), (self.admin_client_1, 200), (self.superuser_client, 200)], url)

    def test_plan_entry(self):
        # TODO add appropriate test
        pass

    def test_shopping(self):
        url = reverse('view_shopping')
        self.batch_requests([(self.anonymous_client, 302), (self.guest_client_1, 302), (self.user_client_1, 200), (self.admin_client_1, 200), (self.superuser_client, 200)], url)

    def test_settings(self):
        url = reverse('view_settings')
        self.batch_requests([(self.anonymous_client, 302), (self.guest_client_1, 200), (self.user_client_1, 200), (self.admin_client_1, 200), (self.superuser_client, 200)], url)

    def test_history(self):
        url = reverse('view_history')
        self.batch_requests([(self.anonymous_client, 302), (self.guest_client_1, 200), (self.user_client_1, 200), (self.admin_client_1, 200), (self.superuser_client, 200)], url)

    def test_system(self):
        url = reverse('view_system')
        self.batch_requests([(self.anonymous_client, 302), (self.guest_client_1, 302), (self.user_client_1, 302), (self.admin_client_1, 200), (self.superuser_client, 200)], url)

    def test_setup(self):
        url = reverse('view_setup')
        self.batch_requests([(self.anonymous_client, 302), (self.guest_client_1, 302), (self.user_client_1, 302), (self.admin_client_1, 302), (self.superuser_client, 302)], url)

    def test_markdown_info(self):
        url = reverse('docs_markdown')
        self.batch_requests([(self.anonymous_client, 200), (self.guest_client_1, 200), (self.user_client_1, 200), (self.admin_client_1, 200), (self.superuser_client, 200)], url)

    def test_api_info(self):
        url = reverse('docs_api')
        self.batch_requests([(self.anonymous_client, 302), (self.guest_client_1, 200), (self.user_client_1, 200), (self.admin_client_1, 200), (self.superuser_client, 200)], url)
