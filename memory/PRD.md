# Grade 5 Scholarship Examination Platform - PRD v3.0

## Original Problem Statement
Complete exam system for Grade 2-5 scholarship preparation with strict flow control:
- Student takes MCQ (60 questions, 60 min) then Written paper
- Parent CANNOT login while student is taking exam  
- Parent has 5 minutes to upload photos AFTER student finishes
- Anonymous marking with secret codes
- Marker payment tracking
- Multi-language support (Sinhala, Tamil, English)
- Batch/Class management for island-wide operation
- MCQ Teaching feature with paid audio explanations
- Desktop app (.exe) for network-based island-wide use

## User Flow (VERIFIED WORKING)

### Student Flow:
1. Student logs in with email/password
2. Sees available exams for their grade
3. Starts exam → MCQ Section (60 questions, 60 min timer)
4. Auto-save answers as they go
5. Submit MCQ → Auto-graded by system
6. Written Section (Essay + 5-15 short questions)
7. Submit Written → Exam ends
8. **Must logout for parent to login**

### Parent Flow:
1. **CANNOT login** while student is taking exam (blocked by system)
2. **CAN login** only AFTER student finishes written section
3. Has exactly **5 minutes** to upload photos of written paper
4. Upload window closes automatically after 5 minutes
5. Papers go to marking queue with SECRET CODE only

### Marker Flow:
1. Sees papers with **SECRET CODE ONLY** (no student name)
2. Claims paper → Marks → Submits
3. Payment recorded per paper marked

### MCQ Teaching Flow (NEW):
1. Admin/Teacher creates teaching session linked to an exam
2. Uploads MP3 audio (60 questions x 2 min = ~2 hours)
3. 4 exams/month x 3 languages = 12 recordings/month
4. Available to students 7 days after their exam
5. Students pay separately (bank transfer) for access
6. Admin verifies payment → grants access

## Verified Test Results (2026-03-18)

| Test | Result |
|------|--------|
| All 5 Role Logins | PASS |
| Language Switching (EN/SI/TA) | PASS |
| Academic Logo Translation | PASS |
| Admin Dashboard (4 tabs) | PASS |
| Admin Statistics API | PASS |
| User Management | PASS |
| Batch Management | PASS |
| Teaching Sessions Tab | PASS |
| Student Dashboard | PASS |
| Teacher Dashboard | PASS |
| Backend API 100% | PASS |
| Frontend UI 100% | PASS |

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@exam.lk | admin123 |
| Marker | marker@exam.lk | marker123 |
| Student | student@test.lk | pass123 |
| Parent | parent@test.lk | pass123 |
| Teacher | teacher@test.lk | pass123 |

## Tech Stack
- **Backend**: FastAPI (Python 3.11) + MongoDB Atlas
- **Frontend**: React 18 + Tailwind CSS + i18next
- **Database**: MongoDB Atlas (cluster0.0cisjyt.mongodb.net)
- **DB Name**: exam_bureau_db

## What's Been Implemented

### Phase 1 - Bug Fixes & Branding (Completed 2026-03-18)
- [x] Fixed AcademicLogo.js to use i18next translations
- [x] Updated Sinhala title to "විභාග ඇගැයුම් කාර්යාංශය"
- [x] Made Login page generic for all roles (not parent-specific)
- [x] Translated all hardcoded text (registration link, email hints)
- [x] Verified login works for all 5 roles
- [x] Fixed admin dashboard to load users from API

### Phase 2 - Core Features (Completed 2026-03-18)
- [x] Fixed ExamCreator field name bug (paper1_questions → mcq_questions)
- [x] Fixed TeacherDashboard question count display
- [x] Added Batch/Class Management (CRUD endpoints + UI)
- [x] Added MCQ Teaching Session provisions (backend models + API + admin UI)
- [x] Added Teaching purchase/payment tracking (bank transfer)
- [x] Enhanced Admin Dashboard with 4 tabs (Overview, Users, Batches, Teaching)
- [x] Admin statistics now include batches and teaching data

## Remaining Tasks

### P0 - Desktop App (.exe)
- [ ] Network-based desktop app using Electron
- [ ] Connects to grade5exam.com server
- [ ] For island-wide admin/staff use

### P1 - End-to-End Exam Flow Testing
- [ ] Full walkthrough on live system
- [ ] Student takes exam → Parent uploads → Teacher marks

### P1 - MCQ Teaching Feature (Full Implementation)
- [ ] Audio upload UI for admin/teachers
- [ ] Student teaching session access after exam + payment
- [ ] Payment verification workflow (admin verifies bank transfers)
- [ ] Audio player in student dashboard

### P2 - Teacher Payments
- [ ] Direct bank transfer to teachers' various bank accounts
- [ ] Payment tracking and reporting

### P2 - Marketing Provisions
- [ ] Marketing canvas support for classes
- [ ] Not immediate but provisions in place

## API Endpoints

### Auth
- `POST /api/login` - Login (blocks parent during student exam)
- `POST /api/register` - Register user (admin)
- `POST /api/register-student-parent` - Combined registration

### Exam Flow
- `POST /api/exams/create` - Create exam
- `GET /api/exams` - List exams
- `PUT /api/exams/{id}/publish` - Publish exam
- `POST /api/exams/{id}/start` - Start exam
- `POST /api/attempts/{id}/save-mcq` - Auto-save answer
- `POST /api/attempts/{id}/submit-mcq` - Submit MCQ section
- `POST /api/attempts/{id}/submit-written` - Submit written

### Parent
- `GET /api/parent/upload-status/{id}` - Check upload window
- `POST /api/parent/upload-photos` - Upload paper photos

### Marker
- `GET /api/marker/pending-papers` - Get anonymous papers
- `POST /api/marker/claim-paper/{id}` - Claim paper
- `POST /api/marker/submit-marks/{id}` - Submit marks
- `GET /api/marker/my-payments` - Payment history

### Batches (NEW)
- `POST /api/batches/create` - Create batch
- `GET /api/batches` - List batches
- `GET /api/batches/{id}` - Get batch details
- `POST /api/batches/{id}/students` - Add students
- `DELETE /api/batches/{id}/students/{sid}` - Remove student
- `DELETE /api/batches/{id}` - Delete batch

### Teaching Sessions (NEW)
- `POST /api/teaching/sessions/create` - Create session
- `GET /api/teaching/sessions` - List sessions
- `POST /api/teaching/sessions/{id}/upload-audio` - Upload MP3
- `POST /api/teaching/purchase` - Purchase session
- `GET /api/teaching/my-sessions` - My purchased sessions
- `PUT /api/teaching/purchases/{id}/verify` - Admin verify payment
- `GET /api/teaching/purchases/pending` - Pending payments

### Admin
- `GET /api/admin/statistics` - Dashboard stats
- `GET /api/admin/users` - List all users
