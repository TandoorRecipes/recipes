import os


def detect_languages(folder_path):
    languages = []
    for root, dirs, files in os.walk(folder_path):
        for dir in dirs:
            languages.append(dir)
    return languages


def call_makemessages(languages):
    command = "python manage.py makemessages -i venv -i staticfiles -i static -i vue -i vue3 "
    for lang in languages:
        command += f"-l {lang} "
    os.system(command)

def call_compilemessages():
    os.system('python manage.py compilemessages -i venv -i staticfiles -i static -i vue -i vue3')


if __name__ == "__main__":
    # Specify the path to the folder containing language directories
    folder_path = "cookbook/locale"

    # Detect languages in the folder
    languages = detect_languages(folder_path)

    # Call makemessages for each language
    call_makemessages(languages)

    call_compilemessages()
