# Sistem Web pentru Detectarea Cariilor Dentare

Această aplicație constă într-un sistem complet format din:
- Trei microservicii backend (Spring Boot)
- Un server AI (FastAPI) pentru analiza imaginilor
- Un frontend web (Angular)

## Cerințe preliminare

Asigură-te că ai instalat:
- **Java 17+**
- **Maven**
- **Node.js și npm**
- **Angular 19**
- **Python 3.10+**
- **MySQL** (cu un utilizator și o bază de date configurate)
- **IntelliJ IDEA** (opțional, pentru rularea Spring Boot)

---

## Pași pentru rularea locală

### 1. Clonează repository-ul

```bash
git clone https://github.com/.... # Înlocuiește cu linkul real
cd nume-proiect
```
### 2. Pornește serviciile backend

Pentru fiecare microserviciu (user_management, appointment_management, image_management):

```bash
cd User_Management
mvn spring-boot:run
```
Alternativ, deschide fiecare microserviciu în IntelliJ IDEA și rulează direct din IDE.
Asigură-te că:

-  Baza de date MySQL rulează
-  application.properties (sau application.yml) conține corect spring.datasource.url, username, password

### 3. Rulează serverul AI (FastAPI)

```bash
cd Server  # Folderul unde se află app.py și requirements.txt
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```
### 4. Pornește frontend-ul Angular

```bash
cd Frontend  # Navighează în folderul aplicației Angular
npm install
npm start
```

