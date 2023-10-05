import json
import traceback

import requests
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt

from cookbook.helper.ingredient_parser import IngredientParser
from cookbook.helper.permission_helper import group_required
from cookbook.models import ShoppingListEntry, TelegramBot


@group_required('user')
def setup_bot(request, pk):
    bot = get_object_or_404(TelegramBot, pk=pk, space=request.space)

    hook_url = f'{request.build_absolute_uri("/")}telegram/hook/{bot.webhook_token}/'

    create_response = requests.get(f'https://api.telegram.org/bot{bot.token}/setWebhook?url={hook_url}')
    info_response = requests.get(f'https://api.telegram.org/bot{bot.token}/getWebhookInfo')

    return JsonResponse({'hook_url': hook_url, 'create_response': json.loads(create_response.content.decode()),
                        'info_response': json.loads(info_response.content.decode())}, json_dumps_params={'indent': 4})


@group_required('user')
def remove_bot(request, pk):
    bot = get_object_or_404(TelegramBot, pk=pk, space=request.space)

    remove_response = requests.get(f'https://api.telegram.org/bot{bot.token}/deleteWebhook')
    info_response = requests.get(f'https://api.telegram.org/bot{bot.token}/getWebhookInfo')

    return JsonResponse({'remove_response': json.loads(remove_response.content.decode()),
                        'info_response': json.loads(info_response.content.decode())}, json_dumps_params={'indent': 4})


@csrf_exempt
def hook(request, token):
    try:
        tb = get_object_or_404(TelegramBot, webhook_token=token)

        data = json.loads(request.body.decode())

        if tb.chat_id == '':
            tb.chat_id = data['message']['chat']['id']
            tb.save()

        if tb.chat_id == str(data['message']['chat']['id']):
            request.space = tb.space  # TODO this is likely a bad idea. Verify and test
            request.user = tb.created_by
            ingredient_parser = IngredientParser(request, False)
            amount, unit, food, note = ingredient_parser.parse(data['message']['text'])
            f = ingredient_parser.get_food(food)
            u = ingredient_parser.get_unit(unit)

            ShoppingListEntry.objects.create(food=f, unit=u, amount=amount, created_by=request.user, space=request.space)

            return JsonResponse({'data': data['message']['text']})
    except Exception:
        traceback.print_exc()

    return JsonResponse({})
