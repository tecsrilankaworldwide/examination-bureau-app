# Grade 5 Scholarship Examination Platform - PRD v2.0

## Original Problem Statement
User wanted to restore Grade 5 Scholarship Exam platform that was mixed with another app. The platform should support:
- Grade 2, 3, 4, 5 monthly exam papers
- Sinhala, Tamil, English medium support
- Monthly marks recording & comparison reports
- **Complete Exam Flow:**
  - MCQ: 60 questions, 60 minutes, auto-graded
  - Written: 1 Essay + 5-15 short questions (by grade)
  - Parent uploads photos of written paper (5-minute window only)
  - Anonymous marking with secret codes
  - Marker payment tracking

## User Personas
1. **Students (Grade 2-5)**: Take MCQ exam → Complete written paper → Wait for results
2. **Parents**: Upload photos of child's written paper within 5 minutes after exam
3. **Markers/Teachers**: Mark papers anonymously (see only secret code, no student name)
4. **Admin**: Manage users, exams, system settings

## Core Requirements (Static)

### Exam Flow
1. Student logs in → Sees available exams
2. Student starts exam → MCQ section (60 questions, 60 min timer)
3. Student submits MCQ → Auto-graded by system
4. Student completes written section → Submits
5. Parent upload window opens IMMEDIATELY after student finishes
6. Parent has exactly 5 MINUTES to upload photos of written paper
7. Window closes automatically after 5 minutes
8. Papers go to marking queue with SECRET CODE only
9. Markers see only: secret code + paper photos (NO student name)
10. One marker per paper → Marks submitted → Payment recorded

### Anonymous Marking System
- Secret code format: `EXM-2026-XXXXXX` (auto-generated)
- Only computer knows the mapping between student and secret code
- Teachers NEVER see student identity during marking
- Payment tracked per paper marked

### Multi-Language Support
- Sinhala (primary)
- Tamil
- English

## What's Been Implemented
### Date: 2026-01-17

**Backend (server.py - v2.0):**
- ✅ Student-Parent registration API
- ✅ MCQ auto-grading system
- ✅ Written paper submission flow
- ✅ Parent upload with 5-minute window
- ✅ Anonymous marking with secret codes
- ✅ Marker payment tracking
- ✅ Admin statistics dashboard
- ✅ MongoDB Atlas integration

**Frontend Pages:**
- ✅ Login.js - With registration link
- ✅ Register.js - Student + Parent combined registration
- ✅ StudentDashboard.js - View/start exams
- ✅ ParentDashboard.js - Upload alert & progress view
- ✅ ParentUpload.js - 5-minute countdown upload interface
- ✅ MarkerDashboard.js - Anonymous paper marking
- ✅ App.js - All routes configured

**Test Accounts:**
- Admin: admin@exam.lk / admin123
- Marker: marker@exam.lk / marker123
- Test Student: student1@test.lk / student123
- Test Parent: parent1@test.lk / parent123

## Known Issues
1. **External URL Routing (Platform Issue)**
   - Backend works perfectly on localhost:8001
   - External URL (https://...preview.emergentagent.com/api/) returns 404
   - This is a Kubernetes/platform routing configuration issue
   - Not fixable in code - requires platform infrastructure support

## Tech Stack
- **Backend**: FastAPI (Python 3.11) + MongoDB Atlas
- **Frontend**: React 18 + Tailwind CSS + i18next
- **Database**: MongoDB Atlas (cluster0.0cisjyt.mongodb.net)
- **Auth**: JWT tokens

## API Endpoints (v2.0)

### Authentication
- `POST /api/login` - User login
- `POST /api/register` - Single user registration
- `POST /api/register-student-parent` - Student + Parent registration

### Exam Management
- `GET /api/exams` - List exams
- `POST /api/exams/create` - Create exam (admin)
- `PUT /api/exams/{id}/publish` - Publish exam

### Student Flow
- `POST /api/exams/{id}/start` - Start exam
- `POST /api/attempts/{id}/save-mcq` - Auto-save MCQ answer
- `POST /api/attempts/{id}/submit-mcq` - Submit MCQ
- `POST /api/attempts/{id}/submit-written` - Submit written

### Parent Flow
- `GET /api/parent/upload-status/{student_id}` - Check upload window
- `POST /api/parent/upload-photos` - Upload paper photos

### Marker Flow
- `GET /api/marker/pending-papers` - Get papers to mark (anonymous)
- `POST /api/marker/claim-paper/{id}` - Claim paper
- `POST /api/marker/submit-marks/{id}` - Submit marks
- `GET /api/marker/my-payments` - View payment history

### Admin
- `GET /api/admin/statistics` - Dashboard stats
- `GET /api/admin/users` - List all users

## Next Tasks (Backlog)

### P0 - Critical
- [ ] Desktop App (.exe) build for academic staff
- [ ] Resolve external URL routing (platform support)

### P1 - High Priority
- [ ] Create sample exams with MCQ questions
- [ ] Test complete exam flow end-to-end
- [ ] Implement ExamInterface page (MCQ + Written sections)

### P2 - Medium Priority
- [ ] Monthly progress comparison charts
- [ ] Export results to PDF/Excel
- [ ] Email notifications

### Future Enhancements
- [ ] Mobile app version
- [ ] Real-time exam monitoring
- [ ] AI-powered question generation
- [ ] WhatsApp notifications for parents
