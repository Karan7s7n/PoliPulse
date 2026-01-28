PoliPulse – Policy Management & Tracking System

🚀 Project Overview

PoliPulse is a full-stack policy management and tracking system built with React, TypeScript, and Supabase.
It allows insurance agents and clients to manage policies, track renewals, and receive alerts for upcoming expirations in a clean, responsive, and interactive dashboard.

🔑 Key Features

User Authentication 

Policy Management

CRUD operations for policies

Automatic validation for policy fields (premium, dates, email, etc.)

Real-Time Alerts & Notifications

Expiring policies notifications via toast alerts

Search & Filter

Search policies by client, policy number, or status

Responsive UI

Built with React-Bootstrap and Tailwind CSS for mobile-first responsiveness

🛠️ Tech Stack
Layer	Technologies
Frontend	React, TypeScript, TailwindCSS, React-Bootstrap
Backend / Database	Supabase (PostgreSQL)
Authentication	Supabase Auth
State Management	React Hooks
Hosting / Deployment	Vercel (Frontend), Supabase (Backend/DB)
Version Control	Git, GitHub
⚡ Functional Highlights
Admin Dashboard

View all policies and users

Manage agents and clients

Full CRUD access

Agent Dashboard

Add new policies

Track clients’ policies

Receive alerts for expiring policies

Client Dashboard

View personal policies

Check renewal dates

Download policy details

🔒 Security & Validations

Role-based route protection with ProtectedRoute component

Strong form validations for policy entries:

Email format, phone number length

Premium > 0

Policy & renewal dates validation

.env variables secured via .gitignore

📦 Setup Instructions (Local Development)

Clone the repo:

git clone https://github.com/Karan7s7n/PoliPulse.git
cd PoliPulse


Install dependencies:

npm install


Create .env file in project root:

VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key


Start development server:

npm run dev


Open http://localhost:5173 in your browser.

📁 Database Schema (Supabase)

Tables used:

profiles → Users (id, full_name, role)

policies → Policy details (policy_no, client_name, company, premium, dates, etc.)

alerts → Expiration notifications

other related tables → e.g., agents, clients (if implemented)

🎯 Project Highlights for Recruiters

React + TypeScript expertise

Supabase integration with authentication and database

Role-based access control

Form validation & error handling

Responsive UI & dashboard creation

Clean Git history & deployable on Vercel

🌐 Deployment

Frontend hosted on Vercel

Backend (database & auth) hosted on Supabase

Continuous deployment via GitHub → Vercel integration

🛠️ Future Enhancements

Email notifications for expiring policies

Export policies to PDF/Excel

Integrate charts for policy statistics

Multi-language support

📄 License

Made by Karan Singh Negi 
All rights Reserved
