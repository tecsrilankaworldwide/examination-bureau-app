# Examination Evaluation Bureau Platform — Recovery & Completion Plan

## 1) Objectives
- Restore the 85% complete application into this E2 environment and make it fully runnable with sample data and test credentials.
- Validate the core workflows end-to-end: Auth → Exam (Paper 1) → Auto-grading → Results/Progress.
- Implement the remaining 15% features: Paper 2 uploads, Teacher marking, Blood report charts, Sinhala UI, Hero section.
- Achieve production-readiness with comprehensive testing, clear error handling, and clean UI/UX.

## 2) Scope & POC Decision
- App Complexity: Level 2 (CRUD + JWT auth, file uploads, charts) → No external third-party integrations.
- Phase 1 POC: SKIPPED (not required). We will directly restore the working app and verify core flows using the testing agent.

## 3) Phase 1 — Restore & Verify Core (No POC)
### 3.1 Steps
1. Code Restore
   - Clone repo (public): https://github.com/tecsrilankaworldwide/examination-bureau-app
   - Map to E2 ingress rules: all backend routes must be prefixed with /api; backend binds 0.0.0.0:8001; frontend calls via REACT_APP_BACKEND_URL.
2. Environment
   - Backend: use MONGO_URL from backend/.env (do not modify), add DB_NAME if required, add JWT_SECRET, FILE_UPLOAD_DIR (uploads/paper2).
   - Frontend: ensure REACT_APP_BACKEND_URL is used in all API calls; avoid hardcoded URLs.
3. Data
   - Run create_comprehensive_data.py to seed Grades 2–5 exams, users, and sample attempts.
4. Hardening Compatibility
   - Ensure datetime serialization helpers for MongoDB responses.
   - Verify auth middleware/guards and role-based access (Student/Parent/Teacher/Admin).
   - Confirm exam timing, auto-save, flagging, navigation work with grade rules (40 Q for G2-3, 60 Q for G4-5).
5. Design Guidelines
   - Call design_agent to align with government-standard look and landing hero requirements (Sinhala + English tone).
6. Testing
   - Lint (backend + frontend) and run testing_agent_v3 for: Login → Dashboard → Start MCQ → Submit → Results.

### 3.2 Phase 1 User Stories
- As an Admin, I can log in with admin@exambureau.com/admin123 and see Admin Dashboard without errors.
- As a Student, I can start a Paper 1 exam for my grade, answer questions, and submit within 60 minutes.
- As a Student, I can pause/refresh and resume an ongoing exam with timer preserved and answers retained.
- As a Student, I see instant auto-grading results with a 10-skill breakdown.
- As a Parent, I can log in and view my child’s attempt history and progress summary.
- As a Teacher, I can log in and see assigned students and available exams to supervise.

### 3.3 Deliverables (Phase 1)
- Running app on preview URL with seeded data and all core flows validated.
- Test report from testing_agent_v3 showing pass on core scenarios.

## 4) Phase 2 — Complete Remaining 15%
### 4.1 Paper 2 Photo Upload (Student/Parent)
Backend
- POST /api/exams/{exam_id}/paper2/submit-file
  - Accept images (jpg/png/webp, max size per file configurable), multiple pages, store paths/metadata.
  - Persist: { examId, studentId, files[], submittedAt, status: "submitted"|"under_review"|"scored" }.
- GET /api/exams/{exam_id}/paper2/submission → latest submission status + files.
- Security: only Student/Parent for the matching student; validate exam ownership and submission window.
- Storage: uploads/paper2/{studentId}/{examId}/ or GridFS (config flag); virus/mime-type check; thumbnail generation (optional).

Frontend
- Paper2Submission page: drag-and-drop, file list with previews, progress bars, retry and cancel, success state with status panel.
- Clear errors for type/size; show current submission status; allow reupload until deadline.

### 4.2 Teacher Marking Interface
Backend
- GET /api/teacher/paper2/submissions?grade&month&status
- GET /api/teacher/paper2/submissions/{id}
- PUT /api/teacher/paper2/submissions/{id}/score { rubricScoresBySkill, total, feedback, status: "scored" }
- Auto-calc final score weighting with Paper 1 if needed; persist audit trail (scoredBy, scoredAt, changeLog[]).
- Optional: PDF export with ReportLab for submission summary.

Frontend (Teacher)
- TeacherDashboard → Submissions list with filters (grade/month/status), search by student.
- SubmissionDetail → image carousel/preview, rubric form (10 skills sliders or inputs), comment box, Save Draft/Finalize.
- After finalize, status changes to "scored" and result visible to student/parent.

### 4.3 Blood Report Visualization Enhancements (Student/Parent)
Backend
- GET /api/students/{student_id}/progress → monthly timeseries per skill (0–100), computed from historical exams + Paper 2 scores.
- Cache aggregates per month; normalization strategy documented.

Frontend
- Recharts-based visuals: per-skill line chart, radar overview, month filter, tooltips, export to PDF (ReportLab backend endpoint or client print-to-PDF).

### 4.4 Sinhala Language UI Integration
Frontend
- i18n (react-i18next or LanguageContext): translations.js with Sinhala/English; toggle in header; persist in localStorage.
- Translate major surfaces: Login, Dashboards, Exam UI, Paper2, Teacher views, Hero.
- Typography: Sinhala-friendly fonts and right line-height; ensure no layout shifts.
Backend
- Ensure UTF-8 everywhere; store/display Sinhala in content fields.

### 4.5 Hero Section Design (Landing)
- Government-standard hero: bilingual title/subtitle, CTA to Login/Register, key benefits, pricing (LKR per grade), LankaQR mention.
- Responsive, accessible, with structured navigation and footers.

### 4.6 Cross-Cutting
- Role-based route guards on frontend; consistent Axios client; loading states and error toasts.
- Strict date/time handling (UTC in DB, localize in UI).
- Serialization helpers for MongoDB ObjectId and datetimes.

### 4.7 Phase 2 User Stories
- As a Student, I can upload clear photos of my Paper 2 answers and see upload progress and success state.
- As a Parent, I can view my child’s Paper 2 submission status and files at any time.
- As a Teacher, I can score a Paper 2 submission via a rubric and finalize results with feedback.
- As a Student/Parent, I can view an enhanced monthly “blood report” chart of 10 skills.
- As a User, I can switch the UI to Sinhala and it persists across sessions.
- As a Visitor, I see a polished bilingual hero and can navigate to login/register smoothly.

### 4.8 Testing & Quality Gates (Phase 2)
- Unit: critical helpers (serialization, scoring normalization).
- E2E via testing_agent_v3: file upload workflow, teacher scoring, progress charts, language toggle, hero navigation.
- Skip camera/drag simulation if constrained; test upload via input selection.
- Lint (ruff, eslint) must pass; zero console errors; backend logs clean.

## 5) Implementation Steps (Condensed)
1. Restore codebase → configure envs → seed data.
2. Verify core flows with testing agent; fix any regressions.
3. Implement Paper 2 upload (backend + frontend) with robust validations.
4. Build Teacher marking (endpoints + UI + rubric + finalize flow).
5. Add progress aggregations and Recharts visuals; PDF export.
6. Add Sinhala i18n across key pages; toggle + persistence.
7. Design and implement hero section using design_agent guidelines.
8. Run comprehensive tests; address all issues; prepare deployment notes.

## 6) Next Actions (Immediate)
- Confirm permission to clone the GitHub repository now and restore into this E2 environment.
- If confirmed: clone → env setup → seed → run → share preview → begin Phase 2 implementation.

## 7) Success Criteria
- Core exam flow restored and verified on preview URL with seeded accounts.
- Paper 2 upload works reliably with status tracking and validations.
- Teacher marking flow produces saved scores/feedback and updates student results.
- Blood report charts display accurate monthly skill trends; export available.
- Sinhala UI toggle fully functional across major screens.
- Hero section meets government-standard aesthetic; responsive and accessible.
- All tests pass via testing_agent_v3; zero critical bugs; logs clean.
