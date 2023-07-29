import os
import re
import subprocess
import sys
import traceback

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PLUGINS_DIRECTORY = os.path.join(BASE_DIR, 'recipes', 'plugins')

version_info = []
tandoor_tag = ''
tandoor_hash = ''
try:
    r = subprocess.check_output(['git', 'show', '-s'], cwd=BASE_DIR).decode()
    tandoor_branch = subprocess.check_output(['git', 'rev-parse', '--abbrev-ref', 'HEAD'], cwd=BASE_DIR).decode()
    tandoor_hash = r.split('\n')[0].split(' ')[1]
    try:
        tandoor_tag = subprocess.check_output(['git', 'describe', '--exact-match', tandoor_hash], cwd=os.path.join(BASE_DIR, 'recipes', 'plugins', d)).decode().replace('\n', '')
    except:
        pass

    version_info.append({
        'name': 'Tandoor ',
        'version': re.sub(r'<.*>', '', r),
        'website': 'https://github.com/TandoorRecipes/recipes',
        'commit_link': 'https://github.com/TandoorRecipes/recipes/commit/' + r.split('\n')[0].split(' ')[1],
        'ref': tandoor_hash,
        'branch': tandoor_branch,
        'tag': tandoor_tag
    })

    if os.path.isdir(PLUGINS_DIRECTORY):
        for d in os.listdir(PLUGINS_DIRECTORY):
            if d != '__pycache__':
                try:
                    apps_path = f'recipes.plugins.{d}.apps'
                    __import__(apps_path)
                    app_config_classname = dir(sys.modules[apps_path])[1]
                    plugin_module = f'recipes.plugins.{d}.apps.{app_config_classname}'
                    plugin_class = getattr(sys.modules[apps_path], app_config_classname)

                    r = subprocess.check_output(['git', 'show', '-s'], cwd=os.path.join(BASE_DIR, 'recipes', 'plugins', d)).decode()
                    branch = subprocess.check_output(['git', 'rev-parse', '--abbrev-ref', 'HEAD'], cwd=os.path.join(BASE_DIR, 'recipes', 'plugins', d)).decode()
                    commit_hash = r.split('\n')[0].split(' ')[1]
                    try:
                        tag = subprocess.check_output(['git', 'describe', '--exact-match', commit_hash], cwd=os.path.join(BASE_DIR, 'recipes', 'plugins', d)).decode().replace('\n', '')
                    except:
                        tag = ''

                    version_info.append({
                        'name': 'Plugin: ' + plugin_class.verbose_name if hasattr(plugin_class, 'verbose_name') else plugin_class.name,
                        'version': re.sub(r'<.*>', '', r),
                        'website': plugin_class.website if hasattr(plugin_class, 'website') else '',
                        'commit_link': plugin_class.github if hasattr(plugin_class, 'github') else '' + '/commit/' + commit_hash,
                        'ref': commit_hash,
                        'branch': branch,
                        'tag': tag
                    })
                except Exception:
                    traceback.print_exc()
except:
    traceback.print_exc()

with open('version_info.py', 'w+', encoding='UTF-8') as f:
    f.write(f'TANDOOR_VERSION = "{tandoor_tag}"\nTANDOOR_REF = "{tandoor_hash}"\nVERSION_INFO = {version_info}')
