# Plan — Grade 5 Scholarship Platform Enhancements (Mobile, Analytics, Email, Reporting, Branding)

## Objectives
- Improve UX on phones/tablets (students/parents/teachers) without breaking existing flows.
- Add deeper month-to-month analytics on 10 skill areas ("blood test" concept).
- Add parent email notifications (exam published, results ready, monthly summary).
- Add advanced reporting: Excel export + printable PDF report.
- Add configurable branding (logo/colors/name) for Education Reforms Bureau / customer instances.
- End every phase with e2e test + GitHub push checkpoint.

---

## Phase 1 — POC: Email + Reporting Exports (core risky integrations)
> External integrations + file generation are most failure-prone; validate in isolation first.

### User stories
1. As an admin, I want to send a test email so I can confirm deliverability before enabling notifications.
2. As a parent, I want to receive an email when results are ready so I don’t miss progress updates.
3. As a teacher, I want to export an exam’s results to Excel so I can share with academics.
4. As a parent, I want a PDF report of monthly skill performance so I can print/share.
5. As an admin, I want failures logged clearly so issues can be fixed quickly.

### Implementation steps
- Web research: best practice for FastAPI email (SendGrid vs SMTP), rate limits, templates.
- Add isolated backend scripts:
  - `scripts/test_email_send.py` (SendGrid or SMTP) using env vars only.
  - `scripts/test_export_excel.py` create XLSX from sample aggregation.
  - `scripts/test_export_pdf.py` generate a minimal PDF report.
- Choose libraries:
  - Email: SendGrid SDK **or** SMTP via `aiosmtplib` (decide based on ops).
  - Excel: `openpyxl`.
  - PDF: `reportlab` (simple) or `weasyprint` (html->pdf; heavier).
- Define env template additions (no secrets committed).
- Success gate: scripts run successfully in this environment.

### Success criteria
- Test email arrives to a real mailbox.
- Excel export opens with correct columns + sample rows.
- PDF renders and downloads with correct headings + a small chart/table.

---

## Phase 2 — V1 App Development: Mobile Responsiveness + Analytics (no new auth)

### User stories
1. As a student, I want the MCQ exam UI to fit my phone screen so I can answer without zooming.
2. As a student, I want the question navigator to be usable on mobile so I can jump quickly.
3. As a parent, I want to see month-to-month skill trends so I understand improvement/decline.
4. As a teacher, I want a class/grade analytics view so I can spot weak skill areas.
5. As an admin, I want dashboards to load fast even with many attempts.

### Implementation steps
- Mobile-first UI pass (Tailwind):
  - Audit key pages: Login, Student exam, Results, Parent dashboard, Teacher dashboard.
  - Add responsive layouts: `flex-col` on small screens, sticky footer actions, collapsible sidebars.
  - Improve touch targets, font scaling, and horizontal overflow fixes.
- Analytics (backend + frontend):
  - Add optimized aggregation endpoints (Mongo pipelines) for:
    - student monthly trend per skill
    - overall score trend
    - grade-level distribution (optional)
  - Frontend: add charts (Recharts) for trends + skill radar comparison per month.
  - Cache heavy endpoints with TTL cache already present.
- Conclude with 1 round of e2e testing (student takes exam on mobile viewport + parent views trends).

### Success criteria
- All key screens usable at 360px width (no broken layout).
- Parent dashboard shows month comparison and per-skill trend.
- No major regression in exam-taking flow.

---

## Phase 3 — Add Features: Notifications + Exports in the App

### User stories
1. As a parent, I want an email when an exam is published so I can remind my child.
2. As a parent, I want an email summary after submission so I can track completion.
3. As a teacher, I want to export results to Excel filtered by grade/month.
4. As an admin, I want to download a PDF monthly report for a student.
5. As a user, I want downloads to work on mobile too.

### Implementation steps
- Email notifications:
  - Add backend notification service + template rendering.
  - Trigger points: exam publish, results ready, monthly summary (manual trigger first; scheduled later).
  - Add admin UI toggle: enable/disable notifications + test-send.
- Reporting:
  - Backend endpoints:
    - `GET /reports/student/{id}/month/{yyyy-mm}.pdf`
    - `GET /reports/grade/{grade}/month/{yyyy-mm}.xlsx`
  - Frontend buttons in Teacher/Admin/Parent dashboards.
- Conclude with e2e testing: publish exam → submit → email → export XLSX/PDF.

### Success criteria
- Emails send successfully and failures are visible in logs/UI.
- Exported XLSX/PDF match the selected filters and open reliably.

---

## Phase 4 — Branding Customization (MVP)

### User stories
1. As an admin, I want to upload a logo so the portal matches our institution.
2. As an admin, I want to set primary/secondary colors so UI matches branding.
3. As an admin, I want to edit portal name/tagline so it’s official.
4. As a user, I want branding to persist across sessions.
5. As a developer, I want branding config to be environment-based for deployments.

### Implementation steps
- Branding model in DB (single document): name, tagline, colors, logo URL.
- Backend endpoints: get/update branding, upload logo (store under `uploads/branding`).
- Frontend: apply theme vars (CSS variables) + logo in header/login.
- Conclude with e2e testing: update branding → refresh → persists.

### Success criteria
- Branding updates apply without rebuild and persist.
- No visual regressions across roles.

---

## Phase 5 — Hardening, QA, GitHub Push

### User stories
1. As a user, I want the app to remain stable after updates.
2. As an admin, I want a checklist to confirm features before launch.
3. As a teacher, I want exports to be accurate for official review.
4. As a parent, I want emails to be reliable and not spammy.
5. As an operator, I want secrets managed safely.

### Implementation steps
- Regression testing across roles + mobile viewport.
- Performance check on analytics endpoints; add indexes if needed.
- Security review for downloads + role-based access.
- Update docs: `.env.example`, QUICK_START, deployment notes.
- Push working changes to GitHub (commit per phase).

### Success criteria
- All new features pass e2e tests.
- GitHub contains latest working version with updated env templates/docs.

---

## Next actions (immediate)
1. Choose email provider for POC: **SendGrid** (recommended) or **SMTP** (Gmail/SES).
2. Provide a test email address to receive POC emails.
3. Confirm report scope for exports (Student monthly PDF + Grade monthly Excel as default).