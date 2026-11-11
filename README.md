# school-erp
Projet d'application de gestion scolaire

## Backend Django (Python) - enseignement fondamental

Cette version fournit un backend Django pour :
- enregistrer les élèves
- enregistrer les classes
- inscrire des élèves dans des classes
- consulter les élèves d'une classe

### Installer les dépendances

```bash
python -m pip install -r requirements.txt
```

### Lancer le serveur

```bash
python manage.py migrate
python manage.py runserver
```

### Exécuter les tests

```bash
python manage.py test
```

### Endpoints disponibles

- `GET /health`
- `GET /students`
- `POST /students` avec `{ "firstName": "...", "lastName": "...", "level": "CM1" }`
- `GET /classes`
- `POST /classes` avec `{ "name": "CM1-A", "level": "CM1" }`
- `POST /enrollments` avec `{ "studentId": 1, "classId": 1 }`
- `GET /classes/<id>/students`
