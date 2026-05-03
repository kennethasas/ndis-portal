# Test Plan

**Project:** NDIS Participant Service Portal
**Version:** 1.0
**Date:** April 27, 2026
**Author:** Jenny Rose Y. Ardais
**Status:** In Review 

---

## 1. Introduction

### 1.1 Purpose
This document defines the complete testing strategy, scope, tools, environments, and responsibilities for validating the NDIS Participant Service Portal before final demo and deployment.

### 1.2 Background
The NDIS Participant Service Portal is a web-based system that allows participants to browse available services and submit booking requests, while coordinators manage services and approve or cancel bookings. The system uses an Angular frontend, a .NET API backend, and a SQL Server database, and supports API testing with Postman and UI automation using Playwright.

---

## 2. Objectives

- Verify that login and registration work correctly.
- Validate participant and coordinator role-based access.
- Ensure participants can browse services and submit bookings.
- Confirm coordinators can approve and cancel bookings.
- Check that API responses, validation messages, and UI behavior follow the requirements.
- Verify that Playwright automation tests pass.

---

## 3. Scope

### In Scope
- Login and registration 
- Services list and filtering
- Booking creation and cancellation
- Coordinator dashboard
- Role-based access control
- API testing using Postman
- UI automation using Playwright
- AI chatbot basic validation
- Bug logging and retesting

### Out of Scope
- Mobile native apps (web only)
- Security penetration testing
- Load testing above normal usage
- Third-party API reliability (AI chatbot service)

---

## 4. Test Types

|        Type         |                       Description                           |        Tool          |
|    Manual Testing   |      Execute test cases manually based on requirements      |   Test Cases MD      |
|     API Testing     |    Validate backend endpoints, status codes, and response   |      Postman         |
|     UI Testing      |Validate Angular pages, forms, buttons, tables, and messages |      Browser         |
|  Automation Testing |                Automate key user workflows                  |Playwright TypeScript |
|  Regression Testing |                 Re-test after bug fixes                     |  Manual / Playwright |
| Database Validation |                Verify data in SQL Server                    |        SSMS          |

---

## 5. Test Environment

| Environment |          URL          |                             Purpose                                     |
|-------------|-----------------------|-------------------------------------------------------------------------|
|     DEV     | http://localhost:4200 |             Developer testing of UI and basic features                  |
|     SIT     | http://localhost:4200 | End-to-end testing of integrated system (frontend + backend + database) |
|     UAT     | http://localhost:4200 |           User validation of complete workflows before demo             |

**Test Data:**
- Use anonymized/synthetic data only — no real customer data in DEV/SIT/UAT
- Test data scripts located in `/tests/data/seed.sql`

---

## 6. Entry & Exit Criteria

### Entry Criteria (before testing begins)
- [ ] Requirements document is available.
- [ ] Database is created and seeded.
- [ ] Backend API is running without errors.
- [ ] Angular frontend is accessible.
- [ ] Test accounts are available.
- [ ] Test cases are reviewed.
- [ ] Postman and Playwright are installed.

### Exit Criteria (before sign-off)
- [ ] All critical features are tested.
- [ ] All P1 and P2 bugs are fixed and verified.
- [ ] All test cases are executed.
- [ ] API endpoints return correct responses.
- [ ] Playwright tests are written and passing.
- [ ] Bug log is updated.
- [ ] Test summary report is completed.
---

## 7. Risk & Mitigation

|        Risk         | Likelihood | Impact |         Mitigation          |
|---------------------|------------|--------|-----------------------------|
|   API not running   |   Medium   |  High  |    Check and restart API    |
| Database not seeded |   Medium   |  High  |     Run seed data setup     |
|  Role access issues |   Medium   |  High  |    Test roles separately    |
| Missing data-testid |   Medium   | Medium |  Coordinate with developer  |
|     Token errors    |   Medium   |  High  | Re-login and validate token |
|  Integration issues |   Medium   |  High  |     Perform SIT testing     |
|   Many bugs found   |    High    |  High  |    Prioritize P1 and P2     |
| Automation failures |   Medium   | Medium |   Update scripts/selectors  |

---

## 8. Roles & Responsibilities

## QA Tester
- Names: Honey Bell Dayanan, Daryll Joy Vallagar, Kristine Mae Tabbuga, Jenny Rose Ardais
- Responsibility: Create and execute test cases, report bugs, retest fixes
## Developer
Names: Kenneth Wayne Asas, John Brian Barte, CJ Adrian Sanquilos
Responsibility: Fix reported bugs and support environment issues
## QA Lead
- Names: Jenny Rose Y. Ardais
- Responsibility: Review test plan, test cases, and test results
## Product Owner
- Names: Daryll Joy C. Vallagar
- Responsibility: Understands project requirements, assigns tasks, and gives final UAT approval


---

## 9. Schedule

|        Phase       |  Start |  End   |
|--------------------|--------|--------|
|    Test Planning   | Apr 27 | Apr 30 |
|  Test Case Writing |  May 1 |  May 5 |
|    SIT Execution   |  May 6 | May 13 |
|  Bug Fix & Retest  | May 14 | May 16 |
|         UAT        | May 17 | May 21 |
|      Sign-off      | May 22 | May 22 |
| Production Release | May 26 | May 26 |

---

## 10. Deliverables

- [ ] Test Plan (`test_plan.md`)
- [ ] Test Cases (`test_cases.md`)
- [ ] Bug Report (tracked in Jira)
- [ ] Test Summary Report
- [ ] UAT Sign-off Form

---

## 11. Sign-off

QA Approver: Daryll Joy C. Vallagar
Dev Approver: Jimwell T. Buensalida
Product Owner: Daryll Joy C. Vallagar
Date: May 22, 2026