# Grade 5 Scholarship Examination Platform - PRD v2.1

## Original Problem Statement
Complete exam system for Grade 2-5 scholarship preparation with strict flow control:
- Student takes MCQ (60 questions, 60 min) then Written paper
- Parent CANNOT login while student is taking exam  
- Parent has 5 minutes to upload photos AFTER student finishes
- Anonymous marking with secret codes
- Marker payment tracking

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

## Verified Test Results (2026-03-17)

| Test | Result |
|------|--------|
| Student-Parent Registration | ✅ PASS |
| Parent blocked during MCQ | ✅ PASS |
| Parent blocked during Written | ✅ PASS |
| Parent allowed after exam | ✅ PASS |
| 5-minute upload window | ✅ PASS |
| MCQ Auto-grading | ✅ PASS |
| Secret code generation | ✅ PASS |
| Sample exam with 60 questions | ✅ PASS |
| Backend API (localhost:8001) | ✅ 100% |

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@exam.lk | admin123 |
| Marker | marker@exam.lk | marker123 |
| Test Student | flow_student@test.lk | pass123 |
| Test Parent | flow_parent@test.lk | pass123 |

## Known Issues

### Platform Infrastructure Issue (Not Code):
- External URL (https://...preview.emergentagent.com/api/) returns 404
- This is Kubernetes/ingress routing configuration
- Backend works 100% on localhost:8001

## Tech Stack
- **Backend**: FastAPI (Python 3.11) + MongoDB Atlas
- **Frontend**: React 18 + Tailwind CSS + i18next
- **Database**: MongoDB Atlas (cluster0.0cisjyt.mongodb.net)

## Next Steps

### Ready for Desktop App (.exe):
- All backend logic verified and working
- Complete exam flow tested
- Ready to package as Electron desktop app

### P0 - Build Desktop App
- [ ] Create Electron wrapper
- [ ] Package with embedded MongoDB
- [ ] Build Windows .exe installer
- [ ] Build Mac .dmg installer

### P1 - Testing
- [ ] End-to-end test on Windows PC
- [ ] Load test with 1000+ users
- [ ] Test parent photo upload on mobile

## API Documentation

### Auth
- `POST /api/login` - Login (blocks parent during student exam)
- `POST /api/register-student-parent` - Combined registration

### Exam Flow
- `POST /api/exams/{id}/start` - Start exam
- `POST /api/attempts/{id}/save-mcq` - Auto-save answer
- `POST /api/attempts/{id}/submit-mcq` - Submit MCQ section
- `POST /api/attempts/{id}/submit-written` - Submit written (opens parent window)

### Parent
- `GET /api/parent/upload-status/{id}` - Check upload window
- `POST /api/parent/upload-photos` - Upload paper photos

### Marker
- `GET /api/marker/pending-papers` - Get papers (anonymous)
- `POST /api/marker/claim-paper/{id}` - Claim paper
- `POST /api/marker/submit-marks/{id}` - Submit marks
