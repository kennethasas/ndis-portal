ndis-portal/
├── NDISPortal.API/                 # .NET Backend Solution
│   ├── Controllers/                # API Endpoints
│   │   ├── AuthController.cs
│   │   ├── ServicesController.cs
│   │   ├── ServiceCategoriesController.cs
│   │   ├── BookingsController.cs
│   │   ├── SupportWorkersController.cs
│   │   └── ChatController.cs
│   ├── Models/                     # Database Entities (EF Core)
│   │   ├── User.cs
│   │   ├── Service.cs
│   │   ├── ServiceCategory.cs
│   │   ├── Booking.cs
│   │   └── SupportWorker.cs
│   ├── DTOs/                       # Data Transfer Objects
│   │   ├── Auth/
│   │   ├── Services/
│   │   ├── Bookings/
│   │   └── Chat/
│   ├── Data/                       # Persistence Layer
│   │   └── ApplicationDbContext.cs
│   ├── Services/                   # Business Logic (Interface/Implementation)
│   │   ├── IAuthService.cs / AuthService.cs
│   │   ├── IBookingService.cs / BookingService.cs
│   │   └── IChatService.cs / ChatService.cs
│   ├── Middleware/                 # Custom Request Pipeline
│   │   └── ErrorHandlingMiddleware.cs
│   └── Program.cs                  # API Entry & Dependency Injection
│
├── ndis-portal-ui/                 # Angular Frontend Project
│   ├── src/app/
│   │   ├── core/                   # Global Singletons (Guards, Interceptors)
│   │   │   ├── interceptors/
│   │   │   │   └── auth.interceptor.ts
│   │   │   ├── guards/
│   │   │   │   ├── auth.guard.ts
│   │   │   │   └── role.guard.ts
│   │   │   └── services/
│   │   │       └── auth.service.ts
│   │   ├── features/               # Lazy-loaded Modules/Domains
│   │   │   ├── auth/ (login/register)
│   │   │   ├── services/ (list/detail)
│   │   │   ├── bookings/ (my-bookings/book-service)
│   │   │   ├── coordinator/ (dashboard/manage-services)
│   │   │   └── chat/ (chat.component.ts)
│   │   └── shared/                 # Reusable Components
│   │       ├── components/ (spinner/dialogs/empty-states)
│   │       └── models/             # Frontend Interfaces
│
├── NDISPortal.ETL/                 # SSIS Project for Data Integration
│
├── scripts/                        # Database & Automation Scripts
│   ├── database_setup.sql          # Schema + Seed Data
│   ├── queries.sql                 # Required SQL Queries (Business Analytics)
│   ├── generate_report.py          # Reporting Automation
│   ├── api_smoke_test.py           # Quick API Validation
│   └── seed_data.py                # Python-based Data Seeding
│
├── tests/                          # Playwright E2E Test Suite
│   ├── auth.spec.ts
│   ├── services.spec.ts
│   ├── bookings.spec.ts
│   ├── coordinator.spec.ts
│   ├── chatbot.spec.ts
│   └── helpers/
│       └── auth.helper.ts
│
└── README.md                       # Setup and Run Guide
