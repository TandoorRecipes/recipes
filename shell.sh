# migrate database 
bin/python3 manage.py migrate
# collect static files
# if the output is not "0 static files copied" you might want to run the commands again to make sure everythig is collected
bin/python3 manage.py collectstatic --no-input
bin/python3 manage.py collectstatic_js_reverse
# change to frontend directory
cd vue
# install and build frontend
yarn build
# restart gunicorn service
sudo systemctl restart gunicorn_recipes