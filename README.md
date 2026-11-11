# school-erp
Projet d'application de gestion scolaire

## API minimale (enseignement fondamental)

Cette première version fournit une API HTTP simple pour :
- enregistrer les élèves
- enregistrer les classes
- inscrire des élèves dans des classes
- consulter les élèves d'une classe

### Lancer le projet

```bash
npm start
```

### Exécuter les tests

```bash
npm test
```

### Endpoints disponibles

- `GET /health`
- `GET /students`
- `POST /students` avec `{ "firstName": "...", "lastName": "...", "level": "CM1" }`
- `GET /classes`
- `POST /classes` avec `{ "name": "CM1-A", "level": "CM1" }`
- `POST /enrollments` avec `{ "studentId": 1, "classId": 1 }`
- `GET /classes/:id/students`
