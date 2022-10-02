import json
import random
from datetime import timedelta

import requests
from django.utils.timezone import now

from cookbook.models import CookingMachine


# Tandoor is not affiliated in any way or form with the holders of Trademark or other right associated with the mentioned names. All mentioned protected names are purely used to identify to the user a certain device or integration.
class HomeConnectCookit:
    AUTH_AUTHORIZE_URL = 'https://api.home-connect.com/security/oauth/authorize'
    AUTH_TOKEN_URL = 'https://api.home-connect.com/security/oauth/token'
    AUTH_REFRESH_URL = 'https://api.home-connect.com/security/oauth/token'

    RECIPE_API_URL = 'https://prod.reu.rest.homeconnectegw.com/user-generated-recipes/server/api/v1/recipes'
    IMAGE_API_URL = 'https://prod.reu.rest.homeconnectegw.com/user-generated-recipes/server/api/v1/images'

    CLIENT_ID = ''  # TODO load from .env settings
    _CLIENT_SECRET = ''  # TODO load from .env settings

    _cooking_machine = None

    def __init__(self, cooking_machine):
        self._cooking_machine = cooking_machine

    def get_auth_link(self):
        return f"{self.AUTH_AUTHORIZE_URL}?client_id={self.CLIENT_ID}&response_type=code&scope=IdentifyAppliance%20Settings&state={random.randint(100000, 999999)}"

    def _validate_token(self):
        if self._cooking_machine.access_token is None and self._cooking_machine.refresh_token is None:
            return False  # user needs to login
        elif self._cooking_machine.access_token_expiry < now() + timedelta(minutes=10):
            return False  # refresh token

    def _refresh_access_token(self):
        token_response = requests.post(self.AUTH_REFRESH_URL, {
            'grant_type': 'refresh_token',
            'refresh_token': self._cooking_machine.refresh_token,
            'client_secret': self._CLIENT_SECRET,
        })
        if token_response.status_code == 200:
            token_response_body = json.loads(token_response.content)
            self._cooking_machine.access_token = token_response_body['access_token']
            self._cooking_machine.access_token_expiry = now() + timedelta(seconds=(token_response_body['expires_in'] - (60 * 10)))
            self._cooking_machine.refresh_token = token_response_body['refresh_token']
            self._cooking_machine.refresh_token_expiry = now() + timedelta(days=58)
            self._cooking_machine.save()

    def get_access_token(self, code):
        token_response = requests.post(self.AUTH_TOKEN_URL, {
            'grant_type': 'authorization_code',
            'code': code,
            'client_id': self.CLIENT_ID,
            'client_secret': self._CLIENT_SECRET,
        })
        if token_response.status_code == 200:
            token_response_body = json.loads(token_response.content)
            self._cooking_machine.access_token = token_response_body['access_token']
            self._cooking_machine.access_token_expiry = now() + timedelta(seconds=(token_response_body['expires_in'] - (60 * 10)))
            self._cooking_machine.refresh_token = token_response_body['refresh_token']
            self._cooking_machine.refresh_token_expiry = now() + timedelta(days=58)
            self._cooking_machine.save()

    def _get_default_headers(self):
        auth_token = ''
        return {
            'authorization': f'Bearer {self._cooking_machine.access_token}',
            'accept-language': "en-US",
            "referer": "https://prod.reu.rest.homeconnectegw.com/user-generated- recipes/client/editor/recipedetails",
            "user-agent": "Mozilla/5.0 (Linux; Android 10; Android SDK built for x86 Build/QSR1.210802.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/74.0.3729.185 Mobile Safari/537.36",
            "x-requested-with": "com.bshg.homeconnect.android.release"
        }

    def push_recipe(self, recipe):
        data = {
            "title": recipe.name,
            "description": recipe.description,
            "ingredients": [],
            "steps": [],
            "durations": {
                "totalTime": (recipe.working_time + recipe.waiting_time) * 60,
                "cookingTime": 0,  # recipe.waiting_time * 60, #TODO cooking time must be sum of step duration attribute, otherwise creation fails
                "preparationTime": recipe.working_time * 60,
            },
            "keywords": [],
            "servings": {
                "amount": int(recipe.servings),
                "unit": 'portion',  # required
            },
            "servingTipsStep": {
                "textInstructions": "Serve"
            },
            "complexityLevel": "medium",
            "image": {
                "url": "https://media3.bsh-group.com/Recipes/800x480/17062805_210217_My-own-recipe_Picture_188ppi.jpg",
                "mimeType": "image/jpeg"
                # TODO add image upload
            },
            "accessories": [],  # TODO add once tandoor supports tools
            "legalDisclaimerApproved": True  # TODO force user to approve disclaimer
        }
        for step in recipe.steps.all():
            data['steps'].append({
                "textInstructions": step.instruction
            })
            for i in step.ingredients.all():
                data['ingredients'].append({
                    "amount": int(i.amount),
                    "unit": i.unit.name,
                    "name": i.food.name,
                })
        # TODO create synced recipe
        response = requests.post(f'{self.RECIPE_API_URL}', json=data, headers=self._get_default_headers())
        return response
