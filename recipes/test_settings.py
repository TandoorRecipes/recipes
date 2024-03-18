from recipes.settings import *  # noqa: F403
import os

DATABASES = setup_database(  # noqa: F405
    db_url=os.getenv('TEST_DATABASE_URL'),
    db_options=os.getenv('TEST_DB_OPTIONS'),
    db_engine=os.getenv('TEST_DB_ENGINE'),
    pg_host=os.getenv('TEST_POSTGRES_HOST'),
    pg_port=os.getenv('TEST_POSTGRES_PORT'),
    pg_user=os.getenv('TEST_POSTGRES_PORT'),
    pg_password=os.getenv('TEST_POSTGRES_PASSWORD'),
    pg_db=os.getenv('TEST_POSTGRES_DB')
    )
