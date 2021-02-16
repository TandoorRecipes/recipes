CALL venv\Scripts\activate.bat
python manage.py makemessages -i venv -l ca -l de -l en -l es -l fr -l hu_HU -l it -l lv -l nl -l pt -l rn -l tr -l zh_CN
python manage.py makemessages -i venv -a -l de -d djangojs