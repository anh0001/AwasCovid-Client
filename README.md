# AwasCovid-Client

This repo is based on Django React Boilerplate.

## Troubleshooting:

### Frontend (Tested in WSL Ubuntu 20.04)

- ```bash
  cd frontend
  npm install
  npm run build:dll
  npm start
  ```

  Then open web browser and enter URL according to the URL and port as shown in the terminal

### Backend (Tested in WSL Ubuntu 20.04)

- install Django (make sure using python 3.8)

  ```bash
  pip install django
  ```

- ```bash
  sudo apt-get install gcc libpq-dev -y
  sudo apt-get install python-dev  python-pip -y
  sudo apt-get install python3-dev python3-pip python3-venv python3-wheel -y
  ```

- create environment (Use python 3) and activate the environment

  ```bash
  python3 -m venv env
  source ./env/bin/activate
  ```

  Make sure the environment always active for executing the below commands

- install wheel

  ```bash
  pip3 install wheel
  ```

- run the below command

  ```bash
  make compile_install_requirements
  ```

- Inside the `backend` folder, do the following:

  Create a copy of ``awascovid/settings/local.py.example``:  
  `cp awascovid/settings/local.py.example awascovid/settings/local.py`

  Create a copy of ``.env.example``:
  `cp .env.example .env`

- database migration

  ```
  cd backend/
  python3 manage.py makemigrations
  python3 manage.py migrate
  ```

- In order to run the server on the same network such as a wifi, 

  ```bash
  python3 ./manage.py runserver 0.0.0.0:8000
  ```

- Set ALLOWED_HOSTS = ['*']

- In order to delete the backend database, just delete the db.sqlite3 file in the backend folder, and delete the xxxx_initial.py in the modified migrations folder. Then make a Django makemigrations and migrate.

### Backend (Windows 10)

- Make sure using python > 3.8 from python.org.

  Open powershell in windows 10

  Create environment ``python -m venv env``

  `.\env\Scripts\activate`

  keep the environment active

- Install pip and requirements

  `pip install -r requirements.txt`

  `pip install -r dev-requirements.txt`

- Inside the `backend` folder, do the following:

  Create a copy of ``awascovid/settings/local.py.example``:  
  `cp awascovid/settings/local.py.example awascovid/settings/local.py`

  Create a copy of ``.env.example``:
  `cp .env.example .env`

- database migration

  ```bash
  cd backend/
  python manage.py makemigrations
  python manage.py migrate
  ```

- In order to run the server on the same network such as a wifi, 

  ```bash
  python ./manage.py runserver 0.0.0.0:8000
  ```

- 

## About

A [Django](https://www.djangoproject.com/) project boilerplate/template with lots of state of the art libraries and tools like:
- [React](https://facebook.github.io/react/), for building interactive UIs
- [django-js-reverse](https://github.com/ierror/django-js-reverse), for generating URLs on JS
- [Bootstrap 4](https://v4-alpha.getbootstrap.com/), for responsive styling
- [Webpack](https://webpack.js.org/), for bundling static assets
- [Celery](http://www.celeryproject.org/), for background worker tasks
- [WhiteNoise](http://whitenoise.evans.io/en/stable/) with [brotlipy](https://github.com/python-hyper/brotlipy), for efficient static files serving
- [prospector](https://prospector.landscape.io/en/master/) and [ESLint](https://eslint.org/) with [pre-commit](http://pre-commit.com/) for automated quality assurance (does not replace proper testing!)

For continuous integration, a [CircleCI](https://circleci.com/) configuration `.circleci/config.yml` is included.

Also, includes a Heroku `app.json` and a working Django `production.py` settings, enabling easy deployments with ['Deploy to Heroku' button](https://devcenter.heroku.com/articles/heroku-button). Those Heroku plugins are included in `app.json`:
- PostgreSQL, for DB
- Redis, for Celery
- Sendgrid, for e-mail sending
- Papertrail, for logs and platform errors alerts (must set them manually)

This is a good starting point for modern Python/JavaScript web projects.

## Project bootstrap [![CircleCI](https://circleci.com/gh/vintasoftware/django-react-boilerplate.svg?style=svg)](https://circleci.com/gh/vintasoftware/django-react-boilerplate) [![Greenkeeper badge](https://badges.greenkeeper.io/vintasoftware/django-react-boilerplate.svg)](https://greenkeeper.io/)
- [ ] Make sure you have Python 3.8 installed
- [ ] Install Django with `pip install django`, to have the `django-admin` command available.
- [ ] Open the command line and go to the directory you want to start your project in.
- [ ] Start your project using:
```
django-admin startproject theprojectname --extension py,yml,json --name Procfile,Dockerfile,README.md,.env.example,.gitignore --template=https://github.com/vintasoftware/django-react-boilerplate/archive/boilerplate-release.zip
```
In the next steps, always remember to replace theprojectname with your project's name
- [ ] Above: don't forget the `--extension` and `--name` params!
- [ ] Navigate to the project's directory through your command line.
- [ ] Create a new virtualenv with either [virtualenvwrapper](https://virtualenvwrapper.readthedocs.io/en/latest/) or only virtualenv: `mkvirtualenv awascovid` or `python -m venv awascovid-venv`.
  
    > If you're using Python's virtualenv (the latter option), make sure to create the environment with the suggested name, otherwise it will be added to version control.
- [ ] Make sure the virtualenv is activated `workon awascovid` or `source awascovid-venv/bin/activate`.
- [ ] Compile the requirements before installation and install them:  `make compile_install_requirements`
- [ ] Change the first line of README to the name of the project
- [ ] Add an email address to the `ADMINS` settings variable in `awascovid/backend/awascovid/settings/base.py`
- [ ] Change the `SERVER_EMAIL` to the email address used to send e-mails in `awascovid/backend/awascovid/settings/production.py`
- [ ] Rename the folder `circleci` to `.circleci` with the command `mv circleci .circleci`

After completing ALL of the above, remove this `Project bootstrap` section from the project README. Then follow `Running` below.

## Running
### Setup
- Inside the `backend` folder, do the following:
- Create a copy of ``awascovid/settings/local.py.example``:  
  `cp awascovid/settings/local.py.example awascovid/settings/local.py`
- Create a copy of ``.env.example``:
  `cp .env.example .env`

#### If you are using plain python:
- Create the migrations for `users` app: 
  `python manage.py makemigrations`
- Run the migrations:
  `python manage.py migrate`

#### If you are using Docker:
- Create the migrations for `users` app:  
  `docker-compose run --rm backend python manage.py makemigrations`
- Run the migrations:
  `docker-compose run --rm backend python manage.py migrate`

### Tools
- Setup [editorconfig](http://editorconfig.org/), [prospector](https://prospector.landscape.io/en/master/) and [ESLint](http://eslint.org/) in the text editor you will use to develop.

### Running the project (without docker)
- Open a command line window and go to the project's directory.
- `pip install -r requirements.txt && pip install -r dev-requirements.txt`
- `npm install`
- `npm run start`
- Open another command line window.
- `workon theprojectname` or `source theprojectname/bin/activate` depending on if you are using virtualenvwrapper or just virtualenv.
- Go to the `backend` directory.
- `python manage.py runserver`


### Running the project (with docker)
- Open a command line window and go to the project's directory.
- `docker-compose up -d `
To access the logs for each service run `docker-compose logs -f service_name` (either backend, frontend, etc)

#### Celery
- Open a command line window and go to the project's directory
- `workon theprojectname` or `source theprojectname/bin/activate` depending on if you are using virtualenvwrapper or just virtualenv.
- `python manage.py celery`

### Testing
`make test`

Will run django tests using `--keepdb` and `--parallel`. You may pass a path to the desired test module in the make command. E.g.:

`make test someapp.tests.test_views`

### Adding new pypi libs
Add the libname to either requirements.in or dev-requirents.in, then either upgrade the libs with `make upgrade` or manually compile it and then,  install.
`pip-compile requirements.in > requirements.txt` or `make upgrade`
`pip install -r requirements.txt`

### Cleaning example code
Before you start creating your own apps remove the example:
- Run the command `make clean_examples` in order to clean up the example apps from the front and backend.
- Deregister the example app by removing `'exampleapp.apps.ExampleappConfig'` from ``backend/awascovid/settings/base.py``.
- Adjust ``backend/awascovid/urls.py`` to point to your newly created Django app and remove the path configuration that redirects to the deleted example app.

## Deployment 
### Setup
This project comes with an `app.json` file, which can be used to create an app on Heroku from a GitHub repository.

After setting up the project, you can init a repository and push it on GitHub. If your repository is public, you can use the following button:

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy) 

If you are in a private repository, access the following link replacing `$YOUR_REPOSITORY_LINK$` with your repository link.

- `https://heroku.com/deploy?template=$YOUR_REPOSITORY_LINK$`

Remember to fill the `ALLOWED_HOSTS` with the URL of your app, the default on heroku is `appname.herokuapp.com`. Replace `appname` with your heroku app name.

### Sentry

[Sentry](https://sentry.io) is already set up on the project. For production, add `SENTRY_DSN` environment variable on Heroku, with your Sentry DSN as the value.

You can test your Sentry configuration by deploying the boilerplate with the sample page and clicking on the corresponding button.

### Sentry source maps for JS files

The `bin/post_compile` script has a step to push Javascript source maps to Sentry, however some environment variables need to be set on Heroku.

You need to enable Heroku dyno metadata on your Heroku App. Use the following command on Heroku CLI:

- `heroku labs:enable runtime-dyno-metadata -a <app name>`

The environment variables that need to be set are:

- `SENTRY_ORG` - Name of the Sentry Organization that owns your Sentry Project.
- `SENTRY_PROJECT_NAME` - Name of the Sentry Project.
- `SENTRY_API_KEY` - Sentry API key that needs to be generated on Sentry. [You can find or create authentication tokens within Sentry](https://sentry.io/api/).

After enabling dyno metadata and setting the environment variables, your next Heroku Deploys will create a release on Sentry where the release name is the commit SHA, and it will push the source maps to it.

## Linting
- Manually with `prospector` and `npm run lint` on project root.
- During development with an editor compatible with prospector and ESLint.

## Pre-commit hooks
- Run `pre-commit install` to enable the hook into your git repo. The hook will run automatically for each commit.
- Run `git commit -m "Your message" -n` to skip the hook if you need.

## Opinionated Settings
Some settings defaults were decided based on Vinta's experiences. Here's the rationale behind them:

### `CELERY_ACKS_LATE = True`
We believe Celery tasks should be idempotent. So for us it's safe to set `CELERY_ACKS_LATE = True` to ensure tasks will be re-queued after a worker failure. Check Celery docs on ["Should I use retry or acks_late?"](https://docs.celeryproject.org/en/latest/faq.html#should-i-use-retry-or-acks-late) for more info.

## Contributing

If you wish to contribute to this project, please first discuss the change you wish to make via an [issue](https://github.com/vintasoftware/django-react-boilerplate/issues).

Check our [contributing guide](https://github.com/vintasoftware/django-react-boilerplate/blob/master/CONTRIBUTING.md) to learn more about our development process and how you can test your changes to the boilerplate.

## Commercial Support
This project, as other Vinta open-source projects, is used in products of Vinta clients. We are always looking for exciting work, so if you need any commercial support, feel free to get in touch: contact@vinta.com.br

Copyright (c) 2020 Vinta Serviços e Soluções Tecnológicas Ltda.

[MIT License](LICENSE.txt)
