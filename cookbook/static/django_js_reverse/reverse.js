this.Urls=(function(){"use strict";var data={"urls":[["account_change_password",[["accounts/password/change/",[]]]],["account_confirm_email",[["accounts/confirm-email/%(key)s/",["key"]]]],["account_email",[["accounts/email/",[]]]],["account_email_verification_sent",[["accounts/confirm-email/",[]]]],["account_inactive",[["accounts/inactive/",[]]]],["account_login",[["accounts/login/",[]]]],["account_logout",[["accounts/logout/",[]]]],["account_reset_password",[["accounts/password/reset/",[]]]],["account_reset_password_done",[["accounts/password/reset/done/",[]]]],["account_reset_password_from_key",[["accounts/password/reset/key/%(uidb36)s-%(key)s/",["uidb36","key"]]]],["account_reset_password_from_key_done",[["accounts/password/reset/key/done/",[]]]],["account_set_password",[["accounts/password/set/",[]]]],["account_signup",[["accounts/signup/",[]]]],["admin:account_emailaddress_add",[["admin/account/emailaddress/add/",[]]]],["admin:account_emailaddress_change",[["admin/account/emailaddress/%(object_id)s/change/",["object_id"]]]],["admin:account_emailaddress_changelist",[["admin/account/emailaddress/",[]]]],["admin:account_emailaddress_delete",[["admin/account/emailaddress/%(object_id)s/delete/",["object_id"]]]],["admin:account_emailaddress_history",[["admin/account/emailaddress/%(object_id)s/history/",["object_id"]]]],["admin:app_list",[["admin/%(app_label)s/",["app_label"]]]],["admin:auth_user_add",[["admin/auth/user/add/",[]]]],["admin:auth_user_change",[["admin/auth/user/%(object_id)s/change/",["object_id"]]]],["admin:auth_user_changelist",[["admin/auth/user/",[]]]],["admin:auth_user_delete",[["admin/auth/user/%(object_id)s/delete/",["object_id"]]]],["admin:auth_user_history",[["admin/auth/user/%(object_id)s/history/",["object_id"]]]],["admin:auth_user_password_change",[["admin/auth/user/%(id)s/password/",["id"]]]],["admin:authtoken_tokenproxy_add",[["admin/authtoken/tokenproxy/add/",[]]]],["admin:authtoken_tokenproxy_change",[["admin/authtoken/tokenproxy/%(object_id)s/change/",["object_id"]]]],["admin:authtoken_tokenproxy_changelist",[["admin/authtoken/tokenproxy/",[]]]],["admin:authtoken_tokenproxy_delete",[["admin/authtoken/tokenproxy/%(object_id)s/delete/",["object_id"]]]],["admin:authtoken_tokenproxy_history",[["admin/authtoken/tokenproxy/%(object_id)s/history/",["object_id"]]]],["admin:autocomplete",[["admin/autocomplete/",[]]]],["admin:cookbook_bookmarkletimport_add",[["admin/cookbook/bookmarkletimport/add/",[]]]],["admin:cookbook_bookmarkletimport_change",[["admin/cookbook/bookmarkletimport/%(object_id)s/change/",["object_id"]]]],["admin:cookbook_bookmarkletimport_changelist",[["admin/cookbook/bookmarkletimport/",[]]]],["admin:cookbook_bookmarkletimport_delete",[["admin/cookbook/bookmarkletimport/%(object_id)s/delete/",["object_id"]]]],["admin:cookbook_bookmarkletimport_history",[["admin/cookbook/bookmarkletimport/%(object_id)s/history/",["object_id"]]]],["admin:cookbook_comment_add",[["admin/cookbook/comment/add/",[]]]],["admin:cookbook_comment_change",[["admin/cookbook/comment/%(object_id)s/change/",["object_id"]]]],["admin:cookbook_comment_changelist",[["admin/cookbook/comment/",[]]]],["admin:cookbook_comment_delete",[["admin/cookbook/comment/%(object_id)s/delete/",["object_id"]]]],["admin:cookbook_comment_history",[["admin/cookbook/comment/%(object_id)s/history/",["object_id"]]]],["admin:cookbook_cooklog_add",[["admin/cookbook/cooklog/add/",[]]]],["admin:cookbook_cooklog_change",[["admin/cookbook/cooklog/%(object_id)s/change/",["object_id"]]]],["admin:cookbook_cooklog_changelist",[["admin/cookbook/cooklog/",[]]]],["admin:cookbook_cooklog_delete",[["admin/cookbook/cooklog/%(object_id)s/delete/",["object_id"]]]],["admin:cookbook_cooklog_history",[["admin/cookbook/cooklog/%(object_id)s/history/",["object_id"]]]],["admin:cookbook_food_add",[["admin/cookbook/food/add/",[]]]],["admin:cookbook_food_change",[["admin/cookbook/food/%(object_id)s/change/",["object_id"]]]],["admin:cookbook_food_changelist",[["admin/cookbook/food/",[]]]],["admin:cookbook_food_delete",[["admin/cookbook/food/%(object_id)s/delete/",["object_id"]]]],["admin:cookbook_food_history",[["admin/cookbook/food/%(object_id)s/history/",["object_id"]]]],["admin:cookbook_importlog_add",[["admin/cookbook/importlog/add/",[]]]],["admin:cookbook_importlog_change",[["admin/cookbook/importlog/%(object_id)s/change/",["object_id"]]]],["admin:cookbook_importlog_changelist",[["admin/cookbook/importlog/",[]]]],["admin:cookbook_importlog_delete",[["admin/cookbook/importlog/%(object_id)s/delete/",["object_id"]]]],["admin:cookbook_importlog_history",[["admin/cookbook/importlog/%(object_id)s/history/",["object_id"]]]],["admin:cookbook_ingredient_add",[["admin/cookbook/ingredient/add/",[]]]],["admin:cookbook_ingredient_change",[["admin/cookbook/ingredient/%(object_id)s/change/",["object_id"]]]],["admin:cookbook_ingredient_changelist",[["admin/cookbook/ingredient/",[]]]],["admin:cookbook_ingredient_delete",[["admin/cookbook/ingredient/%(object_id)s/delete/",["object_id"]]]],["admin:cookbook_ingredient_history",[["admin/cookbook/ingredient/%(object_id)s/history/",["object_id"]]]],["admin:cookbook_invitelink_add",[["admin/cookbook/invitelink/add/",[]]]],["admin:cookbook_invitelink_change",[["admin/cookbook/invitelink/%(object_id)s/change/",["object_id"]]]],["admin:cookbook_invitelink_changelist",[["admin/cookbook/invitelink/",[]]]],["admin:cookbook_invitelink_delete",[["admin/cookbook/invitelink/%(object_id)s/delete/",["object_id"]]]],["admin:cookbook_invitelink_history",[["admin/cookbook/invitelink/%(object_id)s/history/",["object_id"]]]],["admin:cookbook_keyword_add",[["admin/cookbook/keyword/add/",[]]]],["admin:cookbook_keyword_change",[["admin/cookbook/keyword/%(object_id)s/change/",["object_id"]]]],["admin:cookbook_keyword_changelist",[["admin/cookbook/keyword/",[]]]],["admin:cookbook_keyword_delete",[["admin/cookbook/keyword/%(object_id)s/delete/",["object_id"]]]],["admin:cookbook_keyword_history",[["admin/cookbook/keyword/%(object_id)s/history/",["object_id"]]]],["admin:cookbook_mealplan_add",[["admin/cookbook/mealplan/add/",[]]]],["admin:cookbook_mealplan_change",[["admin/cookbook/mealplan/%(object_id)s/change/",["object_id"]]]],["admin:cookbook_mealplan_changelist",[["admin/cookbook/mealplan/",[]]]],["admin:cookbook_mealplan_delete",[["admin/cookbook/mealplan/%(object_id)s/delete/",["object_id"]]]],["admin:cookbook_mealplan_history",[["admin/cookbook/mealplan/%(object_id)s/history/",["object_id"]]]],["admin:cookbook_mealtype_add",[["admin/cookbook/mealtype/add/",[]]]],["admin:cookbook_mealtype_change",[["admin/cookbook/mealtype/%(object_id)s/change/",["object_id"]]]],["admin:cookbook_mealtype_changelist",[["admin/cookbook/mealtype/",[]]]],["admin:cookbook_mealtype_delete",[["admin/cookbook/mealtype/%(object_id)s/delete/",["object_id"]]]],["admin:cookbook_mealtype_history",[["admin/cookbook/mealtype/%(object_id)s/history/",["object_id"]]]],["admin:cookbook_nutritioninformation_add",[["admin/cookbook/nutritioninformation/add/",[]]]],["admin:cookbook_nutritioninformation_change",[["admin/cookbook/nutritioninformation/%(object_id)s/change/",["object_id"]]]],["admin:cookbook_nutritioninformation_changelist",[["admin/cookbook/nutritioninformation/",[]]]],["admin:cookbook_nutritioninformation_delete",[["admin/cookbook/nutritioninformation/%(object_id)s/delete/",["object_id"]]]],["admin:cookbook_nutritioninformation_history",[["admin/cookbook/nutritioninformation/%(object_id)s/history/",["object_id"]]]],["admin:cookbook_recipe_add",[["admin/cookbook/recipe/add/",[]]]],["admin:cookbook_recipe_change",[["admin/cookbook/recipe/%(object_id)s/change/",["object_id"]]]],["admin:cookbook_recipe_changelist",[["admin/cookbook/recipe/",[]]]],["admin:cookbook_recipe_delete",[["admin/cookbook/recipe/%(object_id)s/delete/",["object_id"]]]],["admin:cookbook_recipe_history",[["admin/cookbook/recipe/%(object_id)s/history/",["object_id"]]]],["admin:cookbook_recipebook_add",[["admin/cookbook/recipebook/add/",[]]]],["admin:cookbook_recipebook_change",[["admin/cookbook/recipebook/%(object_id)s/change/",["object_id"]]]],["admin:cookbook_recipebook_changelist",[["admin/cookbook/recipebook/",[]]]],["admin:cookbook_recipebook_delete",[["admin/cookbook/recipebook/%(object_id)s/delete/",["object_id"]]]],["admin:cookbook_recipebook_history",[["admin/cookbook/recipebook/%(object_id)s/history/",["object_id"]]]],["admin:cookbook_recipebookentry_add",[["admin/cookbook/recipebookentry/add/",[]]]],["admin:cookbook_recipebookentry_change",[["admin/cookbook/recipebookentry/%(object_id)s/change/",["object_id"]]]],["admin:cookbook_recipebookentry_changelist",[["admin/cookbook/recipebookentry/",[]]]],["admin:cookbook_recipebookentry_delete",[["admin/cookbook/recipebookentry/%(object_id)s/delete/",["object_id"]]]],["admin:cookbook_recipebookentry_history",[["admin/cookbook/recipebookentry/%(object_id)s/history/",["object_id"]]]],["admin:cookbook_recipeimport_add",[["admin/cookbook/recipeimport/add/",[]]]],["admin:cookbook_recipeimport_change",[["admin/cookbook/recipeimport/%(object_id)s/change/",["object_id"]]]],["admin:cookbook_recipeimport_changelist",[["admin/cookbook/recipeimport/",[]]]],["admin:cookbook_recipeimport_delete",[["admin/cookbook/recipeimport/%(object_id)s/delete/",["object_id"]]]],["admin:cookbook_recipeimport_history",[["admin/cookbook/recipeimport/%(object_id)s/history/",["object_id"]]]],["admin:cookbook_searchpreference_add",[["admin/cookbook/searchpreference/add/",[]]]],["admin:cookbook_searchpreference_change",[["admin/cookbook/searchpreference/%(object_id)s/change/",["object_id"]]]],["admin:cookbook_searchpreference_changelist",[["admin/cookbook/searchpreference/",[]]]],["admin:cookbook_searchpreference_delete",[["admin/cookbook/searchpreference/%(object_id)s/delete/",["object_id"]]]],["admin:cookbook_searchpreference_history",[["admin/cookbook/searchpreference/%(object_id)s/history/",["object_id"]]]],["admin:cookbook_sharelink_add",[["admin/cookbook/sharelink/add/",[]]]],["admin:cookbook_sharelink_change",[["admin/cookbook/sharelink/%(object_id)s/change/",["object_id"]]]],["admin:cookbook_sharelink_changelist",[["admin/cookbook/sharelink/",[]]]],["admin:cookbook_sharelink_delete",[["admin/cookbook/sharelink/%(object_id)s/delete/",["object_id"]]]],["admin:cookbook_sharelink_history",[["admin/cookbook/sharelink/%(object_id)s/history/",["object_id"]]]],["admin:cookbook_shoppinglist_add",[["admin/cookbook/shoppinglist/add/",[]]]],["admin:cookbook_shoppinglist_change",[["admin/cookbook/shoppinglist/%(object_id)s/change/",["object_id"]]]],["admin:cookbook_shoppinglist_changelist",[["admin/cookbook/shoppinglist/",[]]]],["admin:cookbook_shoppinglist_delete",[["admin/cookbook/shoppinglist/%(object_id)s/delete/",["object_id"]]]],["admin:cookbook_shoppinglist_history",[["admin/cookbook/shoppinglist/%(object_id)s/history/",["object_id"]]]],["admin:cookbook_shoppinglistentry_add",[["admin/cookbook/shoppinglistentry/add/",[]]]],["admin:cookbook_shoppinglistentry_change",[["admin/cookbook/shoppinglistentry/%(object_id)s/change/",["object_id"]]]],["admin:cookbook_shoppinglistentry_changelist",[["admin/cookbook/shoppinglistentry/",[]]]],["admin:cookbook_shoppinglistentry_delete",[["admin/cookbook/shoppinglistentry/%(object_id)s/delete/",["object_id"]]]],["admin:cookbook_shoppinglistentry_history",[["admin/cookbook/shoppinglistentry/%(object_id)s/history/",["object_id"]]]],["admin:cookbook_shoppinglistrecipe_add",[["admin/cookbook/shoppinglistrecipe/add/",[]]]],["admin:cookbook_shoppinglistrecipe_change",[["admin/cookbook/shoppinglistrecipe/%(object_id)s/change/",["object_id"]]]],["admin:cookbook_shoppinglistrecipe_changelist",[["admin/cookbook/shoppinglistrecipe/",[]]]],["admin:cookbook_shoppinglistrecipe_delete",[["admin/cookbook/shoppinglistrecipe/%(object_id)s/delete/",["object_id"]]]],["admin:cookbook_shoppinglistrecipe_history",[["admin/cookbook/shoppinglistrecipe/%(object_id)s/history/",["object_id"]]]],["admin:cookbook_space_add",[["admin/cookbook/space/add/",[]]]],["admin:cookbook_space_change",[["admin/cookbook/space/%(object_id)s/change/",["object_id"]]]],["admin:cookbook_space_changelist",[["admin/cookbook/space/",[]]]],["admin:cookbook_space_delete",[["admin/cookbook/space/%(object_id)s/delete/",["object_id"]]]],["admin:cookbook_space_history",[["admin/cookbook/space/%(object_id)s/history/",["object_id"]]]],["admin:cookbook_step_add",[["admin/cookbook/step/add/",[]]]],["admin:cookbook_step_change",[["admin/cookbook/step/%(object_id)s/change/",["object_id"]]]],["admin:cookbook_step_changelist",[["admin/cookbook/step/",[]]]],["admin:cookbook_step_delete",[["admin/cookbook/step/%(object_id)s/delete/",["object_id"]]]],["admin:cookbook_step_history",[["admin/cookbook/step/%(object_id)s/history/",["object_id"]]]],["admin:cookbook_storage_add",[["admin/cookbook/storage/add/",[]]]],["admin:cookbook_storage_change",[["admin/cookbook/storage/%(object_id)s/change/",["object_id"]]]],["admin:cookbook_storage_changelist",[["admin/cookbook/storage/",[]]]],["admin:cookbook_storage_delete",[["admin/cookbook/storage/%(object_id)s/delete/",["object_id"]]]],["admin:cookbook_storage_history",[["admin/cookbook/storage/%(object_id)s/history/",["object_id"]]]],["admin:cookbook_supermarket_add",[["admin/cookbook/supermarket/add/",[]]]],["admin:cookbook_supermarket_change",[["admin/cookbook/supermarket/%(object_id)s/change/",["object_id"]]]],["admin:cookbook_supermarket_changelist",[["admin/cookbook/supermarket/",[]]]],["admin:cookbook_supermarket_delete",[["admin/cookbook/supermarket/%(object_id)s/delete/",["object_id"]]]],["admin:cookbook_supermarket_history",[["admin/cookbook/supermarket/%(object_id)s/history/",["object_id"]]]],["admin:cookbook_supermarketcategory_add",[["admin/cookbook/supermarketcategory/add/",[]]]],["admin:cookbook_supermarketcategory_change",[["admin/cookbook/supermarketcategory/%(object_id)s/change/",["object_id"]]]],["admin:cookbook_supermarketcategory_changelist",[["admin/cookbook/supermarketcategory/",[]]]],["admin:cookbook_supermarketcategory_delete",[["admin/cookbook/supermarketcategory/%(object_id)s/delete/",["object_id"]]]],["admin:cookbook_supermarketcategory_history",[["admin/cookbook/supermarketcategory/%(object_id)s/history/",["object_id"]]]],["admin:cookbook_sync_add",[["admin/cookbook/sync/add/",[]]]],["admin:cookbook_sync_change",[["admin/cookbook/sync/%(object_id)s/change/",["object_id"]]]],["admin:cookbook_sync_changelist",[["admin/cookbook/sync/",[]]]],["admin:cookbook_sync_delete",[["admin/cookbook/sync/%(object_id)s/delete/",["object_id"]]]],["admin:cookbook_sync_history",[["admin/cookbook/sync/%(object_id)s/history/",["object_id"]]]],["admin:cookbook_synclog_add",[["admin/cookbook/synclog/add/",[]]]],["admin:cookbook_synclog_change",[["admin/cookbook/synclog/%(object_id)s/change/",["object_id"]]]],["admin:cookbook_synclog_changelist",[["admin/cookbook/synclog/",[]]]],["admin:cookbook_synclog_delete",[["admin/cookbook/synclog/%(object_id)s/delete/",["object_id"]]]],["admin:cookbook_synclog_history",[["admin/cookbook/synclog/%(object_id)s/history/",["object_id"]]]],["admin:cookbook_telegrambot_add",[["admin/cookbook/telegrambot/add/",[]]]],["admin:cookbook_telegrambot_change",[["admin/cookbook/telegrambot/%(object_id)s/change/",["object_id"]]]],["admin:cookbook_telegrambot_changelist",[["admin/cookbook/telegrambot/",[]]]],["admin:cookbook_telegrambot_delete",[["admin/cookbook/telegrambot/%(object_id)s/delete/",["object_id"]]]],["admin:cookbook_telegrambot_history",[["admin/cookbook/telegrambot/%(object_id)s/history/",["object_id"]]]],["admin:cookbook_unit_add",[["admin/cookbook/unit/add/",[]]]],["admin:cookbook_unit_change",[["admin/cookbook/unit/%(object_id)s/change/",["object_id"]]]],["admin:cookbook_unit_changelist",[["admin/cookbook/unit/",[]]]],["admin:cookbook_unit_delete",[["admin/cookbook/unit/%(object_id)s/delete/",["object_id"]]]],["admin:cookbook_unit_history",[["admin/cookbook/unit/%(object_id)s/history/",["object_id"]]]],["admin:cookbook_userfile_add",[["admin/cookbook/userfile/add/",[]]]],["admin:cookbook_userfile_change",[["admin/cookbook/userfile/%(object_id)s/change/",["object_id"]]]],["admin:cookbook_userfile_changelist",[["admin/cookbook/userfile/",[]]]],["admin:cookbook_userfile_delete",[["admin/cookbook/userfile/%(object_id)s/delete/",["object_id"]]]],["admin:cookbook_userfile_history",[["admin/cookbook/userfile/%(object_id)s/history/",["object_id"]]]],["admin:cookbook_userpreference_add",[["admin/cookbook/userpreference/add/",[]]]],["admin:cookbook_userpreference_change",[["admin/cookbook/userpreference/%(object_id)s/change/",["object_id"]]]],["admin:cookbook_userpreference_changelist",[["admin/cookbook/userpreference/",[]]]],["admin:cookbook_userpreference_delete",[["admin/cookbook/userpreference/%(object_id)s/delete/",["object_id"]]]],["admin:cookbook_userpreference_history",[["admin/cookbook/userpreference/%(object_id)s/history/",["object_id"]]]],["admin:cookbook_viewlog_add",[["admin/cookbook/viewlog/add/",[]]]],["admin:cookbook_viewlog_change",[["admin/cookbook/viewlog/%(object_id)s/change/",["object_id"]]]],["admin:cookbook_viewlog_changelist",[["admin/cookbook/viewlog/",[]]]],["admin:cookbook_viewlog_delete",[["admin/cookbook/viewlog/%(object_id)s/delete/",["object_id"]]]],["admin:cookbook_viewlog_history",[["admin/cookbook/viewlog/%(object_id)s/history/",["object_id"]]]],["admin:index",[["admin/",[]]]],["admin:javascript-catalog",[["admin/cookbook/food/jsi18n/",[]],["admin/cookbook/keyword/jsi18n/",[]]]],["admin:jsi18n",[["admin/jsi18n/",[]]]],["admin:login",[["admin/login/",[]]]],["admin:logout",[["admin/logout/",[]]]],["admin:password_change",[["admin/password_change/",[]]]],["admin:password_change_done",[["admin/password_change/done/",[]]]],["admin:sites_site_add",[["admin/sites/site/add/",[]]]],["admin:sites_site_change",[["admin/sites/site/%(object_id)s/change/",["object_id"]]]],["admin:sites_site_changelist",[["admin/sites/site/",[]]]],["admin:sites_site_delete",[["admin/sites/site/%(object_id)s/delete/",["object_id"]]]],["admin:sites_site_history",[["admin/sites/site/%(object_id)s/history/",["object_id"]]]],["admin:socialaccount_socialaccount_add",[["admin/socialaccount/socialaccount/add/",[]]]],["admin:socialaccount_socialaccount_change",[["admin/socialaccount/socialaccount/%(object_id)s/change/",["object_id"]]]],["admin:socialaccount_socialaccount_changelist",[["admin/socialaccount/socialaccount/",[]]]],["admin:socialaccount_socialaccount_delete",[["admin/socialaccount/socialaccount/%(object_id)s/delete/",["object_id"]]]],["admin:socialaccount_socialaccount_history",[["admin/socialaccount/socialaccount/%(object_id)s/history/",["object_id"]]]],["admin:socialaccount_socialapp_add",[["admin/socialaccount/socialapp/add/",[]]]],["admin:socialaccount_socialapp_change",[["admin/socialaccount/socialapp/%(object_id)s/change/",["object_id"]]]],["admin:socialaccount_socialapp_changelist",[["admin/socialaccount/socialapp/",[]]]],["admin:socialaccount_socialapp_delete",[["admin/socialaccount/socialapp/%(object_id)s/delete/",["object_id"]]]],["admin:socialaccount_socialapp_history",[["admin/socialaccount/socialapp/%(object_id)s/history/",["object_id"]]]],["admin:socialaccount_socialtoken_add",[["admin/socialaccount/socialtoken/add/",[]]]],["admin:socialaccount_socialtoken_change",[["admin/socialaccount/socialtoken/%(object_id)s/change/",["object_id"]]]],["admin:socialaccount_socialtoken_changelist",[["admin/socialaccount/socialtoken/",[]]]],["admin:socialaccount_socialtoken_delete",[["admin/socialaccount/socialtoken/%(object_id)s/delete/",["object_id"]]]],["admin:socialaccount_socialtoken_history",[["admin/socialaccount/socialtoken/%(object_id)s/history/",["object_id"]]]],["admin:view_on_site",[["admin/r/%(content_type_id)s/%(object_id)s/",["content_type_id","object_id"]]]],["api:api-root",[["api/.%(format)s",["format"]],["api/",[]]]],["api:automation-detail",[["api/automation/%(pk)s.%(format)s",["pk","format"]],["api/automation/%(pk)s/",["pk"]]]],["api:automation-list",[["api/automation.%(format)s",["format"]],["api/automation/",[]]]],["api:bookmarkletimport-detail",[["api/bookmarklet-import/%(pk)s.%(format)s",["pk","format"]],["api/bookmarklet-import/%(pk)s/",["pk"]]]],["api:bookmarkletimport-list",[["api/bookmarklet-import.%(format)s",["format"]],["api/bookmarklet-import/",[]]]],["api:cooklog-detail",[["api/cook-log/%(pk)s.%(format)s",["pk","format"]],["api/cook-log/%(pk)s/",["pk"]]]],["api:cooklog-list",[["api/cook-log.%(format)s",["format"]],["api/cook-log/",[]]]],["api:food-detail",[["api/food/%(pk)s.%(format)s",["pk","format"]],["api/food/%(pk)s/",["pk"]]]],["api:food-list",[["api/food.%(format)s",["format"]],["api/food/",[]]]],["api:food-merge",[["api/food/%(pk)s/merge/%(target)s.%(format)s",["pk","target","format"]],["api/food/%(pk)s/merge/%(target)s/",["pk","target"]]]],["api:food-move",[["api/food/%(pk)s/move/%(parent)s.%(format)s",["pk","parent","format"]],["api/food/%(pk)s/move/%(parent)s/",["pk","parent"]]]],["api:importlog-detail",[["api/import-log/%(pk)s.%(format)s",["pk","format"]],["api/import-log/%(pk)s/",["pk"]]]],["api:importlog-list",[["api/import-log.%(format)s",["format"]],["api/import-log/",[]]]],["api:ingredient-detail",[["api/ingredient/%(pk)s.%(format)s",["pk","format"]],["api/ingredient/%(pk)s/",["pk"]]]],["api:ingredient-list",[["api/ingredient.%(format)s",["format"]],["api/ingredient/",[]]]],["api:keyword-detail",[["api/keyword/%(pk)s.%(format)s",["pk","format"]],["api/keyword/%(pk)s/",["pk"]]]],["api:keyword-list",[["api/keyword.%(format)s",["format"]],["api/keyword/",[]]]],["api:keyword-merge",[["api/keyword/%(pk)s/merge/%(target)s.%(format)s",["pk","target","format"]],["api/keyword/%(pk)s/merge/%(target)s/",["pk","target"]]]],["api:keyword-move",[["api/keyword/%(pk)s/move/%(parent)s.%(format)s",["pk","parent","format"]],["api/keyword/%(pk)s/move/%(parent)s/",["pk","parent"]]]],["api:mealplan-detail",[["api/meal-plan/%(pk)s.%(format)s",["pk","format"]],["api/meal-plan/%(pk)s/",["pk"]]]],["api:mealplan-list",[["api/meal-plan.%(format)s",["format"]],["api/meal-plan/",[]]]],["api:mealtype-detail",[["api/meal-type/%(pk)s.%(format)s",["pk","format"]],["api/meal-type/%(pk)s/",["pk"]]]],["api:mealtype-list",[["api/meal-type.%(format)s",["format"]],["api/meal-type/",[]]]],["api:recipe-detail",[["api/recipe/%(pk)s.%(format)s",["pk","format"]],["api/recipe/%(pk)s/",["pk"]]]],["api:recipe-image",[["api/recipe/%(pk)s/image.%(format)s",["pk","format"]],["api/recipe/%(pk)s/image/",["pk"]]]],["api:recipe-list",[["api/recipe.%(format)s",["format"]],["api/recipe/",[]]]],["api:recipebook-detail",[["api/recipe-book/%(pk)s.%(format)s",["pk","format"]],["api/recipe-book/%(pk)s/",["pk"]]]],["api:recipebook-list",[["api/recipe-book.%(format)s",["format"]],["api/recipe-book/",[]]]],["api:recipebookentry-detail",[["api/recipe-book-entry/%(pk)s.%(format)s",["pk","format"]],["api/recipe-book-entry/%(pk)s/",["pk"]]]],["api:recipebookentry-list",[["api/recipe-book-entry.%(format)s",["format"]],["api/recipe-book-entry/",[]]]],["api:shoppinglist-detail",[["api/shopping-list/%(pk)s.%(format)s",["pk","format"]],["api/shopping-list/%(pk)s/",["pk"]]]],["api:shoppinglist-list",[["api/shopping-list.%(format)s",["format"]],["api/shopping-list/",[]]]],["api:shoppinglistentry-detail",[["api/shopping-list-entry/%(pk)s.%(format)s",["pk","format"]],["api/shopping-list-entry/%(pk)s/",["pk"]]]],["api:shoppinglistentry-list",[["api/shopping-list-entry.%(format)s",["format"]],["api/shopping-list-entry/",[]]]],["api:shoppinglistrecipe-detail",[["api/shopping-list-recipe/%(pk)s.%(format)s",["pk","format"]],["api/shopping-list-recipe/%(pk)s/",["pk"]]]],["api:shoppinglistrecipe-list",[["api/shopping-list-recipe.%(format)s",["format"]],["api/shopping-list-recipe/",[]]]],["api:step-detail",[["api/step/%(pk)s.%(format)s",["pk","format"]],["api/step/%(pk)s/",["pk"]]]],["api:step-list",[["api/step.%(format)s",["format"]],["api/step/",[]]]],["api:storage-detail",[["api/storage/%(pk)s.%(format)s",["pk","format"]],["api/storage/%(pk)s/",["pk"]]]],["api:storage-list",[["api/storage.%(format)s",["format"]],["api/storage/",[]]]],["api:supermarket-detail",[["api/supermarket/%(pk)s.%(format)s",["pk","format"]],["api/supermarket/%(pk)s/",["pk"]]]],["api:supermarket-list",[["api/supermarket.%(format)s",["format"]],["api/supermarket/",[]]]],["api:supermarketcategory-detail",[["api/supermarket-category/%(pk)s.%(format)s",["pk","format"]],["api/supermarket-category/%(pk)s/",["pk"]]]],["api:supermarketcategory-list",[["api/supermarket-category.%(format)s",["format"]],["api/supermarket-category/",[]]]],["api:supermarketcategoryrelation-detail",[["api/supermarket-category-relation/%(pk)s.%(format)s",["pk","format"]],["api/supermarket-category-relation/%(pk)s/",["pk"]]]],["api:supermarketcategoryrelation-list",[["api/supermarket-category-relation.%(format)s",["format"]],["api/supermarket-category-relation/",[]]]],["api:sync-detail",[["api/sync/%(pk)s.%(format)s",["pk","format"]],["api/sync/%(pk)s/",["pk"]]]],["api:sync-list",[["api/sync.%(format)s",["format"]],["api/sync/",[]]]],["api:synclog-detail",[["api/sync-log/%(pk)s.%(format)s",["pk","format"]],["api/sync-log/%(pk)s/",["pk"]]]],["api:synclog-list",[["api/sync-log.%(format)s",["format"]],["api/sync-log/",[]]]],["api:unit-detail",[["api/unit/%(pk)s.%(format)s",["pk","format"]],["api/unit/%(pk)s/",["pk"]]]],["api:unit-list",[["api/unit.%(format)s",["format"]],["api/unit/",[]]]],["api:unit-merge",[["api/unit/%(pk)s/merge/%(target)s.%(format)s",["pk","target","format"]],["api/unit/%(pk)s/merge/%(target)s/",["pk","target"]]]],["api:userfile-detail",[["api/user-file/%(pk)s.%(format)s",["pk","format"]],["api/user-file/%(pk)s/",["pk"]]]],["api:userfile-list",[["api/user-file.%(format)s",["format"]],["api/user-file/",[]]]],["api:username-detail",[["api/user-name/%(pk)s.%(format)s",["pk","format"]],["api/user-name/%(pk)s/",["pk"]]]],["api:username-list",[["api/user-name.%(format)s",["format"]],["api/user-name/",[]]]],["api:userpreference-detail",[["api/user-preference/%(pk)s.%(format)s",["pk","format"]],["api/user-preference/%(pk)s/",["pk"]]]],["api:userpreference-list",[["api/user-preference.%(format)s",["format"]],["api/user-preference/",[]]]],["api:viewlog-detail",[["api/view-log/%(pk)s.%(format)s",["pk","format"]],["api/view-log/%(pk)s/",["pk"]]]],["api:viewlog-list",[["api/view-log.%(format)s",["format"]],["api/view-log/",[]]]],["api_backup",[["api/backup/",[]]]],["api_get_external_file_link",[["api/get_external_file_link/%(recipe_id)s/",["recipe_id"]]]],["api_get_facets",[["api/get_facets/",[]]]],["api_get_plan_ical",[["api/plan-ical/%(from_date)s/%(to_date)s/",["from_date","to_date"]]]],["api_get_recipe_file",[["api/get_recipe_file/%(recipe_id)s/",["recipe_id"]]]],["api_ingredient_from_string",[["api/ingredient-from-string/",[]]]],["api_log_cooking",[["api/log_cooking/%(recipe_id)s/",["recipe_id"]]]],["api_recipe_from_source",[["api/recipe-from-source/",[]]]],["api_share_link",[["api/share-link/%(pk)s",["pk"]]]],["api_sync",[["api/sync_all/",[]]]],["change_space_member",[["space/member/%(user_id)s/%(space_id)s/%(group)s",["user_id","space_id","group"]]]],["dal_food",[["dal/food/",[]]]],["dal_keyword",[["dal/keyword/",[]]]],["dal_unit",[["dal/unit/",[]]]],["data_batch_edit",[["data/batch/edit",[]]]],["data_batch_import",[["data/batch/import",[]]]],["data_import_url",[["data/import/url",[]]]],["data_stats",[["data/statistics",[]]]],["data_sync",[["data/sync",[]]]],["data_sync_wait",[["data/sync/wait",[]]]],["delete_comment",[["delete/comment/%(pk)s/",["pk"]]]],["delete_invite_link",[["delete/invite-link/%(pk)s/",["pk"]]]],["delete_meal_plan",[["delete/meal-plan/%(pk)s/",["pk"]]]],["delete_recipe",[["delete/recipe/%(pk)s/",["pk"]]]],["delete_recipe_book",[["delete/recipe-book/%(pk)s/",["pk"]]]],["delete_recipe_book_entry",[["delete/recipe-book-entry/%(pk)s/",["pk"]]]],["delete_recipe_import",[["delete/recipe-import/%(pk)s/",["pk"]]]],["delete_recipe_source",[["delete/recipe-source/%(pk)s/",["pk"]]]],["delete_storage",[["delete/storage/%(pk)s/",["pk"]]]],["delete_sync",[["delete/sync/%(pk)s/",["pk"]]]],["docs_api",[["docs/api/",[]]]],["docs_markdown",[["docs/markdown/",[]]]],["docs_search",[["docs/search/",[]]]],["edit_comment",[["edit/comment/%(pk)s/",["pk"]]]],["edit_convert_recipe",[["edit/recipe/convert/%(pk)s/",["pk"]]]],["edit_external_recipe",[["edit/recipe/external/%(pk)s/",["pk"]]]],["edit_internal_recipe",[["edit/recipe/internal/%(pk)s/",["pk"]]]],["edit_meal_plan",[["edit/meal-plan/%(pk)s/",["pk"]]]],["edit_recipe",[["edit/recipe/%(pk)s/",["pk"]]]],["edit_storage",[["edit/storage/%(pk)s/",["pk"]]]],["edit_sync",[["edit/sync/%(pk)s/",["pk"]]]],["index",[["",[]]]],["javascript-catalog",[["jsi18n/",[]]]],["js_reverse",[["jsreverse.json",[]]]],["list_automation",[["list/automation/",[]]]],["list_food",[["list/food/",[]]]],["list_invite_link",[["list/invite-link/",[]]]],["list_keyword",[["list/keyword/",[]]]],["list_recipe_import",[["list/recipe-import/",[]]]],["list_shopping_list",[["list/shopping-list/",[]]]],["list_step",[["list/step/",[]]]],["list_storage",[["list/storage/",[]]]],["list_supermarket",[["list/supermarket/",[]]]],["list_supermarket_category",[["list/supermarket-category/",[]]]],["list_sync_log",[["list/sync-log/",[]]]],["list_unit",[["list/unit/",[]]]],["list_user_file",[["list/user-file/",[]]]],["new_invite_link",[["new/invite-link/",[]]]],["new_meal_plan",[["new/meal-plan/",[]]]],["new_recipe",[["new/recipe/",[]]]],["new_recipe_import",[["new/recipe-import/%(import_id)s/",["import_id"]]]],["new_share_link",[["new/share-link/%(pk)s/",["pk"]]]],["new_storage",[["new/storage/",[]]]],["openapi-schema",[["openapi/",[]]]],["rest_framework:login",[["api-auth/login/",[]]]],["rest_framework:logout",[["api-auth/logout/",[]]]],["service_worker",[["service-worker.js",[]]]],["set_language",[["i18n/setlang/",[]]]],["socialaccount_connections",[["accounts/social/connections/",[]]]],["socialaccount_login_cancelled",[["accounts/social/login/cancelled/",[]]]],["socialaccount_login_error",[["accounts/social/login/error/",[]]]],["socialaccount_signup",[["accounts/social/signup/",[]]]],["telegram_hook",[["telegram/hook/%(token)s/",["token"]]]],["telegram_remove",[["telegram/remove/%(pk)s",["pk"]]]],["telegram_setup",[["telegram/setup/%(pk)s",["pk"]]]],["view_books",[["books/",[]]]],["view_export",[["export/",[]]]],["view_history",[["history/",[]]]],["view_import",[["import/",[]]]],["view_import_response",[["import-response/%(pk)s/",["pk"]]]],["view_invite",[["invite/%(token)s",["token"]]]],["view_no_group",[["no-group",[]]]],["view_no_perm",[["no-perm",[]]]],["view_no_space",[["no-space",[]]]],["view_offline",[["offline/",[]]]],["view_plan",[["plan/",[]]]],["view_plan_entry",[["plan/entry/%(pk)s",["pk"]]]],["view_recipe",[["view/recipe/%(pk)s/%(share)s",["pk","share"]],["view/recipe/%(pk)s",["pk"]]]],["view_report_share_abuse",[["abuse/%(token)s",["token"]]]],["view_search",[["search/",[]]]],["view_search_v2",[["search/v2/",[]]]],["view_settings",[["settings/",[]]]],["view_setup",[["setup/",[]]]],["view_shopping",[["shopping/%(pk)s",["pk"]],["shopping/",[]]]],["view_shopping_latest",[["shopping/latest/",[]]]],["view_shopping_new",[["shopping/new/",[]]]],["view_signup",[["signup/%(token)s",["token"]]]],["view_space",[["space/",[]]]],["view_supermarket",[["supermarket/",[]]]],["view_system",[["system/",[]]]],["web_manifest",[["manifest.json",[]]]]],"prefix":"/"};function factory(d){var url_patterns=d.urls;var url_prefix=d.prefix;var Urls={};var self_url_patterns={};var _get_url=function(url_pattern){return function(){var _arguments,index,url,url_arg,url_args,_i,_len,_ref,_ref_list,match_ref,provided_keys,build_kwargs;_arguments=arguments;_ref_list=self_url_patterns[url_pattern];if(arguments.length==1&&typeof(arguments[0])=="object"){var provided_keys_list=Object.keys(arguments[0]);provided_keys={};for(_i=0;_i<provided_keys_list.length;_i++)
provided_keys[provided_keys_list[_i]]=1;match_ref=function(ref)
{var _i;if(ref[1].length!=provided_keys_list.length)
return false;for(_i=0;_i<ref[1].length&&ref[1][_i]in provided_keys;_i++);return _i==ref[1].length;}
build_kwargs=function(keys){return _arguments[0];}}else{match_ref=function(ref)
{return ref[1].length==_arguments.length;}
build_kwargs=function(keys){var kwargs={};for(var i=0;i<keys.length;i++){kwargs[keys[i]]=_arguments[i];}
return kwargs;}}
for(_i=0;_i<_ref_list.length&&!match_ref(_ref_list[_i]);_i++);if(_i==_ref_list.length)
return null;_ref=_ref_list[_i];url=_ref[0],url_args=build_kwargs(_ref[1]);for(url_arg in url_args){var url_arg_value=url_args[url_arg];if(url_arg_value===undefined||url_arg_value===null){url_arg_value='';}else{url_arg_value=url_arg_value.toString();}
url=url.replace("%("+url_arg+")s",url_arg_value);}
return url_prefix+url;};};var name,pattern,url,_i,_len,_ref;for(_i=0,_len=url_patterns.length;_i<_len;_i++){_ref=url_patterns[_i],name=_ref[0],pattern=_ref[1];self_url_patterns[name]=pattern;url=_get_url(name);Urls[name.replace(/[-_]+(.)/g,function(_m,p1){return p1.toUpperCase();})]=url;Urls[name.replace(/-/g,'_')]=url;Urls[name]=url;}
return Urls;}
return data?factory(data):factory;})();