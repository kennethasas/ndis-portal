## 📂 Project Structure

This project is organized as a monorepo containing the backend API, the Angular frontend, and data integration tools.

```text
ndis-portal/
├── NDISPortal.API/         # .NET 8 Web API (Backend)
│   ├── Controllers/        # API Endpoints (Auth, Bookings, etc.)
│   ├── Models/             # Database Entities (EF Core)
│   ├── DTOs/               # Data Transfer Objects for requests/responses
│   ├── Data/               # DB Context and Migrations
│   ├── Services/           # Business Logic (Interface/Implementation)
│   ├── Middleware/         # Custom Request Pipeline (Error Handling)
│   └── Program.cs          # Entry point & Dependency Injection
│
├── ndis-portal-ui/         # Angular 17+ Frontend
│   ├── src/app/
│   │   ├── core/           # Singletons (Auth Guards, Interceptors)
│   │   ├── features/       # Domain modules (Auth, Bookings, Coordinator)
│   │   ├── shared/         # Reusable Components (Spinners, Dialogs)
│   │   └── models/         # TypeScript Interfaces
│
├── NDISPortal.ETL/         # SSIS Project for Data Integration/Sync
│
├── scripts/                # Automation & Database Utility Scripts
│   ├── database_setup.sql  # SQL Schema and Initial Seed
│   ├── queries.sql         # Pre-defined Analytical Queries
│   └── *.py                # Python scripts for Smoke Testing & Reporting
│
└── tests/                  # Playwright End-to-End Test Suite
    ├── *.spec.ts           # Feature-specific test files
    └── helpers/            # Test authentication and setup helpers
