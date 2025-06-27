# REST API

Prosty serwer REST API stworzony przy użyciu Node.js i Express.js. Umożliwia podstawowe operacje CRUD na zasobach oraz autoryzację za pomocą JWT.

## Technologie

- Node.js
- Express.js
- MongoDB (Mongoose)
- JSON Web Tokens (JWT)
- dotenv
- nodemon

## Uruchomienie lokalne

1. Sklonuj repozytorium:

```bash
git clone https://github.com/kuszpit/REST-API.git
cd REST-API
```

2. Zainstaluj zależności:

```bash
npm install
```

3. Utwórz plik .env i dodaj zmienne środowiskowe:
```bash
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

4. Uruchom serwer:

```bash
npx nodemon server.js
```
## Autoryzacja

Niektóre endpointy wymagają autoryzacji z użyciem tokena JWT.  
Po zalogowaniu się uzyskaj token i dołącz go do nagłówka każdego żądania:

## Testowanie

Testy jednostkowe znajdują się w katalogu `__tests__/`.

Uruchom testy komendą:

```bash
npm test
```
