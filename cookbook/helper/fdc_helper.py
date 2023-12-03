import json


def get_all_nutrient_types():
    f = open('')  # <--- download the foundation food or any other dataset and retrieve all nutrition ID's from it https://fdc.nal.usda.gov/download-datasets.html
    json_data = json.loads(f.read())

    nutrients = {}
    for food in json_data['FoundationFoods']:
        for entry in food['foodNutrients']:
            nutrients[entry['nutrient']['id']] = {'name': entry['nutrient']['name'], 'unit': entry['nutrient']['unitName']}

    nutrient_ids = list(nutrients.keys())
    nutrient_ids.sort()
    for nid in nutrient_ids:
        print('{', f'value: {nid}, text: "{nutrients[nid]["name"]} [{nutrients[nid]["unit"]}] ({nid})"', '},')


get_all_nutrient_types()
