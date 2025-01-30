## Installation and Development Setup

> **Note**: The development setup integrates Django for the backend and Vue.js for the frontend, combining the best of both worlds to create a modern web application.

### Devcontainer Setup

A [devcontainer](https://containers.dev) is configured to streamline development. It is optimized for VSCode but can be used with other editors. Once the container is running, you can:

- Start the Django development server
- Start the Vue.js development server
- Run Python tests

#### VSCode Setup

1. Clone the repository.
2. Open VSCode and, via the command palette, select `Dev Containers: Reopen in Container`.

#### Modifying Dependencies

- If you need to update Python dependencies (`requirements.txt`) or OS packages, rebuild the container.
- If modifying OS package requirements, update both the main `Dockerfile` and `.devcontainer/Dockerfile`.

### Django Setup

> **Note**: Alternatively, you can use the pre-configured VSCode task **Run Dev Server** to start the Django development server.

This application is developed using the Django framework for Python. The official [Django documentation](https://www.djangoproject.com/start/) provides a comprehensive guide, but here’s a quick setup:

1. Clone the repository and install Python 3.10 or above.
2. Open the project in your preferred IDE (e.g., PyCharm).
   - Optionally, create a virtual environment for dependencies.
3. Install required packages:
   ```sh
   pip install -r requirements.txt
   ```
4. Apply migrations:
   ```sh
   python manage.py migrate
   ```
5. Start the Django development server:
   ```sh
   python manage.py runserver
   ```

#### Frontend Integration with Django (Django-Vite)

For frontend development, Django uses the `django_vite` extension. To enable development mode, update `settings.py`:

```python
DJANGO_VITE = {
    "default": {
        "dev_mode": True,
        "static_url_prefix": 'vue3',
        "dev_server_port": 5173,
        "dev_server_host": os.getenv('DJANGO_VITE_DEV_SERVER_HOST', 'localhost'),
    },
}
```

This allows Django to communicate with the Vite development server running on port 5173.

### Vue.js Setup

The frontend is built using [Vue.js](https://vuejs.org/).

#### Steps to setup Vue.js

> **Note**: Vue 3 is the primary frontend framework for this application, and work is ongoing on **Tandoor 2.0**, which will fully adopt Vue 3.

1. Install a JavaScript package manager (e.g., `yarn` or `npm`).
2. Navigate to the `vue` folder and install dependencies:
   ```sh
   yarn install
   ```
3. Start the development server:
   ```sh
   yarn serve
   ```
4. Install Vite:
   ```sh
   yarn add vite
   ```
5. To build the frontend for production, run:
   ```sh
   yarn build
   ```

#### Vue 3 Integration

To enable hot reload for better development experience, add the following configuration to `vite.config.ts`:

```ts
watch: {
    usePolling: true, // set to true to use polling instead of native watchers
}
```

- Vue 3 is used for the frontend, and it utilizes **TypeScript**.
- The Vite configuration (`vite.config.ts`) is set up to create a development server for `django-vite`, ensuring seamless integration with Django.

By following these steps, you can efficiently develop and test both the Django backend and Vue 3 frontend in an integrated environment.
