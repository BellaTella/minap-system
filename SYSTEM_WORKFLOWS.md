# MiNaP PTSD System - Workflow Diagrams

## Complete System Workflows

---

## 1. Student Registration Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                    STUDENT REGISTRATION                      │
└─────────────────────────────────────────────────────────────┘

User                    Frontend                Backend                Database
  │                        │                        │                      │
  │  Visit /trainee/       │                        │                      │
  │  register/             │                        │                      │
  ├────────────────────────>                        │                      │
  │                        │                        │                      │
  │  Fill registration     │                        │                      │
  │  form                  │                        │                      │
  │                        │                        │                      │
  │  Click "Create         │                        │                      │
  │  Account"              │                        │                      │
  ├────────────────────────>                        │                      │
  │                        │                        │                      │
  │                        │  POST /api/auth/       │                      │
  │                        │  register/student/     │                      │
  │                        ├───────────────────────>│                      │
  │                        │                        │                      │
  │                        │                        │  Validate data       │
  │                        │                        │  - Username unique?  │
  │                        │                        │  - Email unique?     │
  │                        │                        │  - Student ID unique?│
  │                        │                        │  - Passwords match?  │
  │                        │                        │                      │
  │                        │                        │  Create User         │
  │                        │                        ├─────────────────────>│
  │                        │                        │                      │
  │                        │                        │  User saved          │
  │                        │                        │<─────────────────────┤
  │                        │                        │                      │
  │                        │                        │  Generate Token      │
  │                        │                        ├─────────────────────>│
  │                        │                        │                      │
  │                        │  Response:             │                      │
  │                        │  - token               │                      │
  │                        │  - user data           │                      │
  │                        │<───────────────────────┤                      │
  │                        │                        │                      │
  │                        │  Store token in        │                      │
  │                        │  localStorage          │                      │
  │                        │                        │                      │
  │  Success message       │                        │                      │
  │  Redirect to           │                        │                      │
  │  dashboard             │                        │                      │
  │<───────────────────────┤                        │                      │
  │                        │                        │                      │
```

---

## 2. Student Login Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                      STUDENT LOGIN                           │
└─────────────────────────────────────────────────────────────┘

User                    Frontend                Backend                Database
  │                        │                        │                      │
  │  Visit /trainee/       │                        │                      │
  │  login/                │                        │                      │
  ├────────────────────────>                        │                      │
  │                        │                        │                      │
  │  Enter username        │                        │                      │
  │  and password          │                        │                      │
  │                        │                        │                      │
  │  Click "Login"         │                        │                      │
  ├────────────────────────>                        │                      │
  │                        │                        │                      │
  │                        │  POST /api/auth/       │                      │
  │                        │  login/                │                      │
  │                        ├───────────────────────>│                      │
  │                        │                        │                      │
  │                        │                        │  Authenticate        │
  │                        │                        │  - Check username    │
  │                        │                        │  - Verify password   │
  │                        │                        ├─────────────────────>│
  │                        │                        │                      │
  │                        │                        │  User found          │
  │                        │                        │<─────────────────────┤
  │                        │                        │                      │
  │                        │                        │  Check role          │
  │                        │                        │  (must be 'student') │
  │                        │                        │                      │
  │                        │                        │  Get/Create Token    │
  │                        │                        ├─────────────────────>│
  │                        │                        │                      │
  │                        │  Response:             │                      │
  │                        │  - token               │                      │
  │                        │  - user data           │                      │
  │                        │<───────────────────────┤                      │
  │                        │                        │                      │
  │                        │  Validate role         │                      │
  │                        │  = 'student'           │                      │
  │                        │                        │                      │
  │                        │  Store token           │                      │
  │                        │                        │                      │
  │  Redirect to           │                        │                      │
  │  dashboard             │                        │                      │
  │<───────────────────────┤                        │                      │
  │                        │                        │                      │
```

---

## 3. Anonymous Screening Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                  ANONYMOUS SCREENING                         │
└─────────────────────────────────────────────────────────────┘

User            Frontend          Backend          ML Engine       NLP Engine      Database
  │                 │                 │                 │               │               │
  │  Visit          │                 │                 │               │               │
  │  /screening/    │                 │                 │               │               │
  ├─────────────────>                 │                 │               │               │
  │                 │                 │                 │               │               │
  │  Accept consent │                 │                 │               │               │
  │  Fill demo info │                 │                 │               │               │
  │                 │                 │                 │               │               │
  │  Complete 20    │                 │                 │               │               │
  │  PCL-5 items    │                 │                 │               │               │
  │                 │                 │                 │               │               │
  │  Optional:      │                 │                 │               │               │
  │  Add narrative  │                 │                 │               │               │
  │                 │                 │                 │               │               │
  │  Submit         │                 │                 │               │               │
  ├─────────────────>                 │                 │               │               │
  │                 │                 │                 │               │               │
  │                 │  POST /api/     │                 │               │               │
  │                 │  screening/     │                 │               │               │
  │                 │  submit/        │                 │               │               │
  │                 ├────────────────>│                 │               │               │
  │                 │                 │                 │               │               │
  │                 │                 │  Generate UUID  │               │               │
  │                 │                 │  token          │               │               │
  │                 │                 │                 │               │               │
  │                 │                 │  Create         │               │               │
  │                 │                 │  TraineeSession │               │               │
  │                 │                 ├────────────────────────────────────────────────>│
  │                 │                 │                 │               │               │
  │                 │                 │  Create         │               │               │
  │                 │                 │  ScreeningResult│               │               │
  │                 │                 │  with PCL-5     │               │               │
  │                 │                 │  items          │               │               │
  │                 │                 ├────────────────────────────────────────────────>│
  │                 │                 │                 │               │               │
  │                 │                 │  Compute        │               │               │
  │                 │                 │  cluster scores │               │               │
  │                 │                 │  (4 DSM-5)      │               │               │
  │                 │                 │                 │               │               │
  │                 │                 │  If narrative   │               │               │
  │                 │                 │  provided:      │               │               │
  │                 │                 ├────────────────────────────────>│               │
  │                 │                 │                 │  Analyze text │               │
  │                 │                 │                 │  - Sentiment  │               │
  │                 │                 │                 │  - Trauma     │               │
  │                 │                 │                 │  - Crisis     │               │
  │                 │                 │                 │               │               │
  │                 │                 │  NLP results    │               │               │
  │                 │                 │<────────────────────────────────┤               │
  │                 │                 │                 │               │               │
  │                 │                 │  Classify       │               │               │
  │                 │                 │  severity       │               │               │
  │                 │                 ├────────────────>│               │               │
  │                 │                 │  - PCL-5 score  │               │               │
  │                 │                 │  - Clusters     │               │               │
  │                 │                 │  - DTS score    │               │               │
  │                 │                 │  - NLP flags    │               │               │
  │                 │                 │                 │               │               │
  │                 │                 │  Severity +     │               │               │
  │                 │                 │  Confidence     │               │               │
  │                 │                 │<────────────────┤               │               │
  │                 │                 │                 │               │               │
  │                 │                 │  Save results   │               │               │
  │                 │                 ├────────────────────────────────────────────────>│
  │                 │                 │                 │               │               │
  │                 │                 │  If severity    │               │               │
  │                 │                 │  >= moderate:   │               │               │
  │                 │                 │  Create Referral│               │               │
  │                 │                 ├────────────────────────────────────────────────>│
  │                 │                 │                 │               │               │
  │                 │  Response:      │                 │               │               │
  │                 │  - severity     │                 │               │               │
  │                 │  - scores       │                 │               │               │
  │                 │  - feedback     │                 │               │               │
  │                 │  - referral     │                 │               │               │
  │                 │<────────────────┤                 │               │               │
  │                 │                 │                 │               │               │
  │  Display        │                 │                 │               │               │
  │  personalized   │                 │                 │               │               │
  │  feedback +     │                 │                 │               │               │
  │  resources      │                 │                 │               │               │
  │<────────────────┤                 │                 │               │               │
  │                 │                 │                 │               │               │
```

---

## 4. Authenticated Screening Workflow

```
┌─────────────────────────────────────────────────────────────┐
│               AUTHENTICATED SCREENING                        │
└─────────────────────────────────────────────────────────────┘

Logged-in      Frontend          Backend          ML/NLP          Database
 Student           │                 │                 │               │
    │              │                 │                 │               │
    │  Click "Take │                 │                 │               │
    │  Screening"  │                 │                 │               │
    │  from        │                 │                 │               │
    │  dashboard   │                 │                 │               │
    ├──────────────>                 │                 │               │
    │              │                 │                 │               │
    │              │  Navigate to    │                 │               │
    │              │  /screening/    │                 │               │
    │              │  (with token)   │                 │               │
    │              │                 │                 │               │
    │  Complete    │                 │                 │               │
    │  screening   │                 │                 │               │
    │              │                 │                 │               │
    │  Submit      │                 │                 │               │
    ├──────────────>                 │                 │               │
    │              │                 │                 │               │
    │              │  POST /api/     │                 │               │
    │              │  screening/     │                 │               │
    │              │  submit/        │                 │               │
    │              │  Authorization: │                 │               │
    │              │  Token XXX      │                 │               │
    │              ├────────────────>│                 │               │
    │              │                 │                 │               │
    │              │                 │  Detect auth    │               │
    │              │                 │  token          │               │
    │              │                 │                 │               │
    │              │                 │  Get user from  │               │
    │              │                 │  token          │               │
    │              │                 ├────────────────────────────────>│
    │              │                 │                 │               │
    │              │                 │  User object    │               │
    │              │                 │<────────────────────────────────┤
    │              │                 │                 │               │
    │              │                 │  Create         │               │
    │              │                 │  TraineeSession │               │
    │              │                 │  WITH student   │               │
    │              │                 │  link ←──       │               │
    │              │                 ├────────────────────────────────>│
    │              │                 │                 │               │
    │              │                 │  [Continue as   │               │
    │              │                 │   anonymous     │               │
    │              │                 │   workflow...]  │               │
    │              │                 │                 │               │
    │              │                 │  ML + NLP       │               │
    │              │                 │  processing     │               │
    │              │                 ├────────────────>│               │
    │              │                 │                 │               │
    │              │                 │  Results        │               │
    │              │                 │<────────────────┤               │
    │              │                 │                 │               │
    │              │                 │  Save with      │               │
    │              │                 │  student link   │               │
    │              │                 ├────────────────────────────────>│
    │              │                 │                 │               │
    │              │  Response       │                 │               │
    │              │<────────────────┤                 │               │
    │              │                 │                 │               │
    │  Feedback    │                 │                 │               │
    │  displayed   │                 │                 │               │
    │<─────────────┤                 │                 │               │
    │              │                 │                 │               │
    │  Return to   │                 │                 │               │
    │  dashboard   │                 │                 │               │
    ├──────────────>                 │                 │               │
    │              │                 │                 │               │
    │              │  GET /api/      │                 │               │
    │              │  student/       │                 │               │
    │              │  dashboard/     │                 │               │
    │              ├────────────────>│                 │               │
    │              │                 │                 │               │
    │              │                 │  Query          │               │
    │              │                 │  screenings for │               │
    │              │                 │  this student   │               │
    │              │                 ├────────────────────────────────>│
    │              │                 │                 │               │
    │              │                 │  Screening      │               │
    │              │                 │  history        │               │
    │              │                 │<────────────────────────────────┤
    │              │                 │                 │               │
    │              │  Dashboard data │                 │               │
    │              │  (with new      │                 │               │
    │              │   screening!)   │                 │               │
    │              │<────────────────┤                 │               │
    │              │                 │                 │               │
    │  Updated     │                 │                 │               │
    │  dashboard   │                 │                 │               │
    │  with history│                 │                 │               │
    │<─────────────┤                 │                 │               │
    │              │                 │                 │               │
```

---

## 5. Counsellor Referral Management

```
┌─────────────────────────────────────────────────────────────┐
│               COUNSELLOR REFERRAL WORKFLOW                   │
└─────────────────────────────────────────────────────────────┘

Counsellor      Frontend          Backend          Database
    │               │                 │                 │
    │  Login        │                 │                 │
    ├───────────────>                 │                 │
    │               │                 │                 │
    │               │  POST /api/     │                 │
    │               │  auth/login/    │                 │
    │               ├────────────────>│                 │
    │               │                 │                 │
    │               │  Token + user   │                 │
    │               │<────────────────┤                 │
    │               │                 │                 │
    │  Dashboard    │                 │                 │
    │  loads        │                 │                 │
    │               │                 │                 │
    │               │  GET /api/      │                 │
    │               │  dashboard/     │                 │
    │               │  summary/       │                 │
    │               ├────────────────>│                 │
    │               │                 │                 │
    │               │                 │  Aggregate      │
    │               │                 │  statistics     │
    │               │                 ├────────────────>│
    │               │                 │                 │
    │               │  Stats data     │                 │
    │               │<────────────────┤                 │
    │               │                 │                 │
    │  View high-   │                 │                 │
    │  priority     │                 │                 │
    │  alerts       │                 │                 │
    ├───────────────>                 │                 │
    │               │                 │                 │
    │               │  GET /api/      │                 │
    │               │  dashboard/     │                 │
    │               │  alerts/        │                 │
    │               ├────────────────>│                 │
    │               │                 │                 │
    │               │                 │  Query          │
    │               │                 │  unresolved     │
    │               │                 │  severe/critical│
    │               │                 ├────────────────>│
    │               │                 │                 │
    │               │  Alert list     │                 │
    │               │<────────────────┤                 │
    │               │                 │                 │
    │  Click on     │                 │                 │
    │  referral     │                 │                 │
    ├───────────────>                 │                 │
    │               │                 │                 │
    │               │  GET /api/      │                 │
    │               │  referrals/X/   │                 │
    │               ├────────────────>│                 │
    │               │                 │                 │
    │               │                 │  Get referral   │
    │               │                 │  + screening    │
    │               │                 ├────────────────>│
    │               │                 │                 │
    │               │  Referral       │                 │
    │               │  details        │                 │
    │               │<────────────────┤                 │
    │               │                 │                 │
    │  Update:      │                 │                 │
    │  - Status     │                 │                 │
    │  - Notes      │                 │                 │
    │  - Follow-up  │                 │                 │
    ├───────────────>                 │                 │
    │               │                 │                 │
    │               │  POST /api/     │                 │
    │               │  referrals/X/   │                 │
    │               │  update/        │                 │
    │               ├────────────────>│                 │
    │               │                 │                 │
    │               │                 │  Update         │
    │               │                 │  referral       │                 │
    │               │                 ├────────────────>│
    │               │                 │                 │
    │               │  Success        │                 │
    │               │<────────────────┤                 │
    │               │                 │                 │
    │  Confirmation │                 │                 │
    │<──────────────┤                 │                 │
    │               │                 │                 │
```

---

## 6. Data Flow Summary

```
┌─────────────────────────────────────────────────────────────┐
│                    DATA FLOW OVERVIEW                        │
└─────────────────────────────────────────────────────────────┘

INPUT                  PROCESSING               OUTPUT
═════                  ══════════               ══════

PCL-5 Responses   →   Scoring Engine      →   Total Score (0-80)
(20 items, 0-4)       (Sum items)             

Total Score       →   Cluster Calculator  →   4 Cluster Sub-scores
                      (DSM-5 grouping)         - Intrusion (1-5)
                                               - Avoidance (6-7)
                                               - Cognition/Mood (8-14)
                                               - Arousal (15-20)

Cluster Scores    →   ML Classifier       →   Severity Level
DTS Score             (Random Forest)          - Minimal (0-19)
NLP Flags                                      - Mild (20-31)
                                               - Moderate (32-43)
                                               - Severe (44-59)
                                               - Critical (60-80)

Narrative Text    →   NLP Processor       →   Derived Signals
(optional)            (Sentiment +              - Sentiment score
                       Keyword detect)          - Trauma flag
                                               - Crisis flag

Severity Level    →   Referral Engine     →   Counsellor Referral
(if >= moderate)      (Auto-trigger)           - Status: Pending
                                               - Priority level
                                               - Alert counsellor

All Results       →   Feedback Generator  →   Personalized Feedback
                      (Language-aware)         - Severity explanation
                                               - Coping resources
                                               - Next steps
                                               - Contact info
```

---

## 7. Security & Privacy Flow

```
┌─────────────────────────────────────────────────────────────┐
│              SECURITY & PRIVACY WORKFLOW                     │
└─────────────────────────────────────────────────────────────┘

User Action              Security Layer              Data Storage
═══════════              ══════════════              ════════════

Register            →    Password Hashing       →    Hashed password
                         (PBKDF2)                    in User table

Provide Student ID  →    SHA-256 Hashing        →    Hashed ID only
                         (one-way)                   stored

Anonymous Screening →    UUID Token Generation  →    No PII stored,
                         (random)                    only token

Narrative Text      →    NLP Processing         →    Raw text NOT
                         Extract signals only        stored, only
                                                     flags/scores

API Request         →    Token Authentication   →    Token validated
                         (DRF)                       against DB

Data Transmission   →    TLS/HTTPS              →    Encrypted in
                         (SSL)                       transit

Session Data        →    Encrypted Session      →    Secure cookie
                         Cookie                      with timeout

Counsellor Access   →    Role-Based             →    Anonymous data
                         Permissions                 only, no PII
```

---

## 8. System States

```
┌─────────────────────────────────────────────────────────────┐
│                    USER STATES                               │
└─────────────────────────────────────────────────────────────┘

[Anonymous User]
      │
      ├──> Take Screening ──> [Screening Complete] ──> Exit
      │
      └──> Register ──> [Registered Student]
                              │
                              ├──> Login ──> [Logged In]
                              │                  │
                              │                  ├──> View Dashboard
                              │                  ├──> Take Screening
                              │                  ├──> View History
                              │                  ├──> Book Appointment
                              │                  └──> Logout ──> [Anonymous]
                              │
                              └──> Forgot Password ──> Reset ──> Login


[Counsellor User]
      │
      └──> Login ──> [Logged In]
                        │
                        ├──> View Dashboard
                        ├──> View Referrals
                        ├──> Update Cases
                        ├──> View Analytics
                        └──> Logout ──> Exit
```

---

## 9. Severity Classification Logic

```
┌─────────────────────────────────────────────────────────────┐
│            SEVERITY CLASSIFICATION DECISION TREE             │
└─────────────────────────────────────────────────────────────┘

PCL-5 Score
     │
     ├──> 0-19   ──> MINIMAL    ──> No referral
     │                              Self-care resources
     │
     ├──> 20-31  ──> MILD       ──> Voluntary counselling
     │                              Psychoeducation
     │
     ├──> 32-43  ──> MODERATE   ──> AUTO-REFERRAL
     │                              CBT workbook
     │                              Counsellor contact
     │
     ├──> 44-59  ──> SEVERE     ──> URGENT REFERRAL
     │                              Immediate counsellor alert
     │                              Crisis contacts
     │
     └──> 60-80  ──> CRITICAL   ──> HIGH-PRIORITY ALERT
                                    Go to office NOW
                                    Emergency services


Additional Flags:
     │
     ├──> Crisis Flag = True  ──> IMMEDIATE ALERT
     │                            Override severity
     │                            Counsellor notified
     │
     └──> Trauma Flag = True   ──> Enhanced resources
                                  Trauma-specific guidance
```

---

## 10. Database Relationships

```
┌─────────────────────────────────────────────────────────────┐
│               DATABASE ENTITY RELATIONSHIPS                  │
└─────────────────────────────────────────────────────────────┘

User (Student)
    │
    │ 1:N
    ├──────────> TraineeSession
    │                   │
    │                   │ 1:N
    │                   └──────────> ScreeningResult
    │                                      │
    │                                      │ 1:1
    │                                      ├──────> NLPResult
    │                                      │
    │                                      │ 1:1
    │                                      └──────> Referral
    │                                                   │
    │ 1:N                                              │ N:1
    ├──────────> WellnessCheckIn                       │
    │                                                   │
    │ 1:N                                              │
    └──────────> CounsellingAppointment                │
                         │                             │
                         │ N:1                         │
                         └────────────────────────────>│
                                                        │
User (Counsellor) ──────────────────────────────────>│
    │                                                  │
    │ 1:N                                             │
    └──────────────────────────────────────────────────┘
```

---

**Version**: 1.0.0  
**Last Updated**: June 22, 2026  
**Status**: Documentation Complete ✅
