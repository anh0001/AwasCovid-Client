web: gunicorn awascovid.wsgi --chdir backend --limit-request-line 8188 --log-file -
worker: celery worker --workdir backend --app=awascovid -B --loglevel=info
