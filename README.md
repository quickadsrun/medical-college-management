# Medical College Management & LMS

Production-oriented starter architecture for a Medical College Management System focused on Fee Management, Student Ledgers, Concessions/Scholarships, Faculty Salaries, Expenses, Attendance, and LMS.

## Stack
- Next.js 15 / React / TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL
- Recharts
- Zod

## Core fee rules
- Every student has a monthly fee ledger for the program cycle.
- Fee structure can be class/program/batch based, with student-level overrides.
- Concession/scholarship is stored per fee record, so it can change month-to-month.
- Payments are separate transactions and can be allocated to specific months or oldest dues first.
- Partial payments are supported.
- Reports distinguish fee records from unique students to avoid double-counting multi-month defaulters.

## Suggested production modules
Dashboard, Students, Fee Structures, Fee Collection, Student Ledger, Defaulters, Concessions, Faculty/Staff, Attendance, Salaries, Expenses, Labs, Departments, Subjects, Timetable, Lectures, LMS Materials, Exams, Results, Reports, Users/Roles, Settings.

## Run
1. `npm install`
2. Copy `.env.example` to `.env` and set `DATABASE_URL`.
3. `npx prisma generate`
4. `npx prisma migrate dev --name init`
5. `npm run dev`

This package is a strong developer handoff/starter, not a claim that all production integrations (authentication provider, bank gateway, biometric device, cloud storage, backups, audit logging) are already wired.
