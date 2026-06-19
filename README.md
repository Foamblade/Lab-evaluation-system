# LabEvo 🚀

LabEvo is a full-stack online coding assessment platform that allows administrators to create coding tests and evaluate student submissions automatically using Judge0.

## Features

### Authentication
- User registration and login
- JWT-based authentication
- Role-based access control
- Admin and Student roles

### Admin Features
- Create coding questions
- Add public and hidden test cases
- Create coding tests
- Assign multiple questions to tests
- View student submissions
- View test results and scores

### Student Features
- Browse available tests
- Attempt coding assessments
- Write code inside an integrated code editor
- Run code against visible test cases
- Submit solutions for evaluation
- View verdicts and scores

### Code Evaluation
- Judge0 API integration
- Multiple language support:
  - C
  - C++
  - Java
  - Python
- Hidden and public test cases
- Automatic scoring
- Execution time tracking
- Memory usage tracking

---

## Tech Stack

### Frontend
- React
- Vite
- React Router
- Axios
- Monaco Editor

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcryptjs

### Code Execution
- Judge0 API

---

## Project Structure

```text
LabEvo/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── services/
│   └── package.json
│
└── README.md
```

---

## Installation

### Clone Repository

```bash
git clone https://github.com/<your-username>/LabEvo.git
cd LabEvo
```

---

## Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```env
PORT=5000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

JUDGE0_API_URL=your_judge0_endpoint
JUDGE0_API_KEY=your_judge0_api_key
```

Start backend:

```bash
npm run dev
```

---

## Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

Start frontend:

```bash
npm run dev
```

---

## API Modules

### Authentication
- Login
- Signup
- JWT Verification

### Questions
- Create Question
- Update Question
- Delete Question
- List Questions

### Tests
- Create Test
- Update Test
- View Tests
- View Test Details

### Submissions
- Run Code
- Submit Code
- Get Results

---

## Supported Languages

| Language | Supported |
|-----------|-----------|
| C | ✅ |
| C++ | ✅ |
| Java | ✅ |
| Python | ✅ |

---

## Security Features

- Password hashing with bcrypt
- JWT authentication
- Protected routes
- Role-based authorization
- Hidden test case protection

---

## Future Improvements

- Contest mode
- Leaderboards
- Plagiarism detection
- Live coding interviews
- AI-based code feedback
- Detailed analytics dashboard

---

## Screenshots

Add screenshots here after deployment.

---

## Author

**Aditya Patil**

- GitHub: https://github.com/Foamblade
- LinkedIn: https://www.linkedin.com/in/aditya-patil-a9a44b323/

---

