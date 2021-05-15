The telegram bot is meant to simplify certain interactions with Tandoor.
It is currently very basic but might be expanded in the future.

!!! warning "Experimental"
    This feature is considered experimental. You can use it and it should not break anything but you might be 
    required to update your configuration in the future.
    The setup is also definitely not user-friendly, this will likely improve if the feature is well-received/expanded.

!!! info "Public IP/Domain"
    To use the Telegram Bot you will need an installation that is accessible from the outside, otherwise telegram can't send messages.
    This could be circumvented using the polling API but this is currently not implemented.

## Shopping Bot
The shopping bot will add any message you send it to your latest open shopping list.

To get a shopping bot follow these steps

1. Create a new Telegram Bot using the [BotFather](https://t.me/botfather)
   - If you want to use the bot with multiple persons add the bot to a group and grant it admin privileges
2. Open the Admin Page (click your username, then admin) and select `Telegram Bots`
3. Create a new Bot
   - token: the token obtained in step one 
   - space: your space (usually Default)
   - user: to the user the bot is meant for (determines the shopping list used)
   - chat id: if you know where messages will be sent from enter the chat ID, otherwise it is set to the first chat the bot received a message from
4. Visit your installation at `recipes.mydomin.tld/telegram/setup/<botid>` with botid being the ID of the bot you just created
   You should see the following message:
    ```
    {
        "hook_url": "https://recipes.mydomin.tld/telegram/hook/c0c08de9-5e1e-4480-8312-3e256af61340/",
        "create_response": {
            "ok": true,
            "result": true,
            "description": "Webhook was set"
        },
        "info_response": {
            "ok": true,
            "result": {
                "url": "recipes.mydomin.tld/telegram/hook/<webhook_token>",
                "has_custom_certificate": false,
                "pending_update_count": 0,
                "max_connections": 40,
                "ip_address": "46.4.105.116"
            }
        }
    }
    ```

You should now be able to send messages to the bot and have the entries appear in your latest shopping list.

### Resetting
To reset a bot open `recipes.mydomin.tld/telegram/remove/<botid>`