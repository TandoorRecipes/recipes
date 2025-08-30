import os
import subprocess
import traceback

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

#TODO clean existing links for when plugins are uninstalled or not necessary because it will just be empty links?

PLUGINS_DIRECTORY = os.path.join(BASE_DIR, 'recipes', 'plugins')
if os.path.isdir(PLUGINS_DIRECTORY):
    for d in os.listdir(PLUGINS_DIRECTORY):
        if d != '__pycache__':
            try:
                subprocess.run(['python', 'setup_repo.py'], shell=(os.name == 'nt'), cwd=os.path.join(BASE_DIR, 'recipes', 'plugins', d))
            except Exception:
                traceback.print_exc()
                print(f'ERROR failed to link plugin {d}')

subprocess.run(['npm', 'install', '--global', 'yarn'], shell=(os.name == 'nt'), cwd=os.path.join(BASE_DIR, 'vue3'))
subprocess.run(['yarn', 'install'], shell=(os.name == 'nt'), cwd=os.path.join(BASE_DIR, 'vue3'))
subprocess.run(['yarn', 'build'], shell=(os.name == 'nt'), cwd=os.path.join(BASE_DIR, 'vue3'))
