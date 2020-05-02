from django.urls import reverse

from cookbook.tests.views.test_views import TestViews


class TestViewsGeneral(TestViews):

    def test_index(self):
        r = self.user_client_1.get(reverse('index'))
        self.assertEqual(r.status_code, 302)

        r = self.anonymous_client.get(reverse('index'))
        self.assertEqual(r.status_code, 302)

    def test_books(self):
        url = reverse('view_books')
        r = self.user_client_1.get(url)
        self.assertEqual(r.status_code, 200)

        r = self.anonymous_client.get(url)
        self.assertEqual(r.status_code, 302)

    def test_plan(self):
        url = reverse('view_plan')
        r = self.user_client_1.get(url)
        self.assertEqual(r.status_code, 200)

        r = self.anonymous_client.get(url)
        self.assertEqual(r.status_code, 302)

    def test_shopping(self):
        url = reverse('view_shopping')
        r = self.user_client_1.get(url)
        self.assertEqual(r.status_code, 200)

        r = self.anonymous_client.get(url)
        self.assertEqual(r.status_code, 302)
