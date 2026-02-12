# Real-World Diagram Examples

16 real-world examples demonstrating when and how to use each Mermaid diagram type. Each example shows the Mermaid source code, the scenario it documents, and the rationale for choosing that diagram type.

## Table of Contents

1. [REST API Request/Response Flow](#1-rest-api-requestresponse-flow)
2. [Microservices Architecture](#2-microservices-architecture)
3. [Database Schema](#3-database-schema)
4. [Authentication Flow with Error Handling](#4-authentication-flow-with-error-handling)
5. [CI/CD Pipeline](#5-cicd-pipeline)
6. [Order Processing State Machine](#6-order-processing-state-machine)
7. [System Architecture Overview (C4 Context)](#7-system-architecture-overview-c4-context)
8. [Service Internals (C4 Component)](#8-service-internals-c4-component)
9. [User Signup Journey](#9-user-signup-journey)
10. [Sprint Timeline](#10-sprint-timeline)
11. [Feature Prioritization](#11-feature-prioritization)
12. [Technology Decision Tree](#12-technology-decision-tree)
13. [Project Milestones](#13-project-milestones)
14. [Git Branching Strategy](#14-git-branching-strategy)
15. [Error Distribution](#15-error-distribution)
16. [Deployment Architecture](#16-deployment-architecture)

---

## 1. REST API Request/Response Flow

**Scenario:** Documenting how a client creates a new order through the API, including payment processing and notification.

**Diagram type:** Sequence Diagram -- best for showing temporal message ordering between multiple services.

```mermaid
sequenceDiagram
    autonumber
    actor Client
    participant API as API Gateway
    participant OrderSvc as OrderService
    participant PaySvc as PaymentService
    participant DB as Database
    participant Queue as Message Queue
    participant NotifSvc as NotificationService

    Client ->>+ API : POST /api/orders {items, paymentMethod}
    API ->> API : Validate JWT token
    API ->>+ OrderSvc : createOrder(userId, items)
    OrderSvc ->>+ DB : INSERT INTO orders
    DB -->>- OrderSvc : order record (status: pending)
    OrderSvc ->>+ PaySvc : chargePayment(orderId, amount, method)

    alt Payment succeeds
        PaySvc -->>- OrderSvc : paymentConfirmation
        OrderSvc ->> DB : UPDATE orders SET status = 'confirmed'
        OrderSvc ->> Queue : publish("order.confirmed", orderId)
        Queue -) NotifSvc : order.confirmed event
        NotifSvc -) Client : Email: "Order confirmed"
        OrderSvc -->>- API : 201 Created {orderId, status}
        API -->>- Client : 201 Created
    else Payment fails
        PaySvc -->> OrderSvc : PaymentError
        OrderSvc ->> DB : UPDATE orders SET status = 'payment_failed'
        OrderSvc -->> API : 402 Payment Required
        API -->> Client : 402 Payment Required {error}
    end
```

**Why Sequence Diagram:** The temporal ordering of messages across six services is critical to understanding this flow. The `alt` block clearly shows the diverging paths for success vs. failure.

---

## 2. Microservices Architecture

**Scenario:** Documenting the high-level architecture of an e-commerce platform with multiple backend services.

**Diagram type:** Flowchart with subgraphs -- best for showing service boundaries and communication paths.

```mermaid
flowchart TD
    subgraph clients [Client Layer]
        WebApp[Web App<br/>React SPA]
        MobileApp[Mobile App<br/>React Native]
    end

    subgraph gateway [API Gateway]
        Kong[Kong Gateway<br/>Rate Limiting + Auth]
    end

    subgraph services [Microservices]
        UserSvc[User Service<br/>Node.js]
        ProductSvc[Product Service<br/>Go]
        OrderSvc[Order Service<br/>Node.js]
        PaymentSvc[Payment Service<br/>Java]
        SearchSvc[Search Service<br/>Python]
        NotifSvc[Notification Service<br/>Node.js]
    end

    subgraph data [Data Layer]
        UserDB[(Users DB<br/>PostgreSQL)]
        ProductDB[(Products DB<br/>PostgreSQL)]
        OrderDB[(Orders DB<br/>PostgreSQL)]
        Redis[(Cache<br/>Redis)]
        Elastic[(Search Index<br/>Elasticsearch)]
        S3[(Object Storage<br/>S3)]
    end

    subgraph messaging [Event Bus]
        Kafka[Apache Kafka]
    end

    WebApp & MobileApp --> Kong
    Kong --> UserSvc & ProductSvc & OrderSvc & PaymentSvc & SearchSvc
    UserSvc --> UserDB
    ProductSvc --> ProductDB & S3
    OrderSvc --> OrderDB
    PaymentSvc --> OrderDB
    SearchSvc --> Elastic
    UserSvc & ProductSvc & OrderSvc --> Redis

    OrderSvc --> Kafka
    Kafka --> NotifSvc & SearchSvc
    NotifSvc -.-> WebApp & MobileApp

    style clients fill:#e3f2fd,stroke:#1565c0
    style services fill:#e8f5e9,stroke:#2e7d32
    style data fill:#fff3e0,stroke:#e65100
    style messaging fill:#f3e5f5,stroke:#6a1b9a
```

**Why Flowchart with Subgraphs:** Subgraphs naturally represent service boundaries (client, gateway, services, data, messaging). The color-coded groups make the layers instantly recognizable.

---

## 3. Database Schema

**Scenario:** Documenting the relational schema for a SaaS project management tool.

**Diagram type:** ER Diagram -- the standard for showing entities, attributes, and relationships with cardinality.

```mermaid
erDiagram
    ORGANIZATIONS {
        uuid id PK
        varchar name
        varchar plan "free|pro|enterprise"
        timestamp created_at
    }
    USERS {
        uuid id PK
        uuid org_id FK
        varchar email UK
        varchar name
        varchar role "owner|admin|member"
        timestamp last_login
    }
    PROJECTS {
        uuid id PK
        uuid org_id FK
        varchar name
        text description
        varchar status "active|archived"
        timestamp created_at
    }
    BOARDS {
        uuid id PK
        uuid project_id FK
        varchar name
        int position
    }
    COLUMNS {
        uuid id PK
        uuid board_id FK
        varchar name
        int position
        int wip_limit "work-in-progress limit"
    }
    TASKS {
        uuid id PK
        uuid column_id FK
        uuid assignee_id FK
        varchar title
        text description
        varchar priority "critical|high|medium|low"
        date due_date
        int position
        timestamp created_at
    }
    COMMENTS {
        uuid id PK
        uuid task_id FK
        uuid author_id FK
        text body
        timestamp created_at
    }
    LABELS {
        uuid id PK
        uuid project_id FK
        varchar name
        varchar color
    }
    TASK_LABELS {
        uuid task_id FK
        uuid label_id FK
    }

    ORGANIZATIONS ||--|{ USERS : "has members"
    ORGANIZATIONS ||--|{ PROJECTS : "owns"
    PROJECTS ||--|{ BOARDS : "contains"
    BOARDS ||--|{ COLUMNS : "has"
    COLUMNS ||--o{ TASKS : "contains"
    USERS ||--o{ TASKS : "assigned to"
    TASKS ||--o{ COMMENTS : "has"
    USERS ||--o{ COMMENTS : "authored"
    PROJECTS ||--o{ LABELS : "defines"
    TASKS }o--o{ LABELS : "tagged with"
```

**Why ER Diagram:** Cardinality notation (one-to-many, many-to-many) is essential for database documentation. ER diagrams show the full data model at a glance with attribute types and keys.

---

## 4. Authentication Flow with Error Handling

**Scenario:** Documenting OAuth 2.0 authorization code flow with PKCE, including token refresh and error paths.

**Diagram type:** Sequence Diagram with alt/opt/loop blocks -- best for multi-party authentication flows with conditional branches.

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant App as Client App
    participant Auth as Auth Server
    participant API as Resource API

    Note over App : Generate code_verifier + code_challenge

    User ->>+ App : Click "Login"
    App ->> Auth : GET /authorize?response_type=code<br/>&code_challenge=X&method=S256
    Auth ->>+ User : Show login form
    User ->> Auth : Enter credentials

    alt Valid credentials
        Auth ->> Auth : Generate authorization code
        Auth -->>- App : Redirect with ?code=AUTH_CODE
        App ->>+ Auth : POST /token {code, code_verifier}
        Auth ->> Auth : Verify code_verifier matches code_challenge
        Auth -->>- App : {access_token, refresh_token, expires_in}
        App ->> App : Store tokens securely

        loop API requests
            App ->>+ API : GET /resource (Bearer access_token)
            alt Token valid
                API -->>- App : 200 OK {data}
            else Token expired
                API -->> App : 401 Unauthorized
                App ->>+ Auth : POST /token {grant_type=refresh, refresh_token}
                alt Refresh token valid
                    Auth -->>- App : New {access_token, refresh_token}
                    App ->> API : Retry with new token
                else Refresh token expired
                    Auth -->> App : 401 Invalid refresh token
                    App -->> User : Redirect to login
                end
            end
        end
    else Invalid credentials
        Auth -->> User : Show error message
    end

    deactivate App
```

**Why Sequence Diagram with alt/opt:** Authentication flows involve multiple parties exchanging tokens. The `alt` blocks clearly document the success vs. failure paths, and the `loop` block shows the ongoing token refresh cycle.

---

## 5. CI/CD Pipeline

**Scenario:** Documenting a GitHub Actions CI/CD pipeline with parallel test jobs and conditional deployment.

**Diagram type:** Flowchart -- best for showing pipeline stages, parallelism, and conditional gates.

```mermaid
flowchart LR
    Push([Push to Branch]) --> Lint

    subgraph ci [CI Pipeline]
        direction TB
        Lint[Lint & Format<br/>ESLint + Prettier] --> Build[Build<br/>TypeScript Compile]
        Build --> Tests

        subgraph Tests [Parallel Test Suite]
            direction LR
            Unit[Unit Tests<br/>Vitest]
            Integration[Integration Tests<br/>Playwright]
            E2E[E2E Tests<br/>Cypress]
        end
    end

    Tests --> Coverage{Coverage<br/>> 80%?}
    Coverage -->|Yes| SecurityScan[Security Scan<br/>Snyk + CodeQL]
    Coverage -->|No| FailBuild([Build Failed])

    SecurityScan --> Vulnerabilities{Critical<br/>Vulns?}
    Vulnerabilities -->|None| Gate{Branch?}
    Vulnerabilities -->|Found| FailBuild

    Gate -->|main| Staging
    Gate -->|develop| Preview
    Gate -->|feature/*| Done([Pipeline Complete])

    subgraph cd [CD Pipeline]
        direction TB
        Staging[Deploy to Staging<br/>AWS ECS] --> SmokeTest[Smoke Tests]
        SmokeTest --> Approve{Manual<br/>Approval}
        Approve -->|Approved| Prod[Deploy to Production<br/>AWS ECS Blue/Green]
        Approve -->|Rejected| Rollback([Rollback])
        Prod --> HealthCheck[Health Check]
        HealthCheck --> Notify([Slack Notification])
    end

    Preview[Deploy Preview<br/>Vercel] --> PreviewUrl([Preview URL Comment])

    style ci fill:#e8f5e9,stroke:#4caf50
    style cd fill:#e3f2fd,stroke:#2196f3
    style FailBuild fill:#ffebee,stroke:#f44336
```

**Why Flowchart:** CI/CD pipelines are inherently sequential with branching conditions. Subgraphs separate CI from CD stages, and the parallel test suite is clearly visible.

---

## 6. Order Processing State Machine

**Scenario:** Documenting all possible states and transitions for an e-commerce order lifecycle.

**Diagram type:** State Diagram -- the standard for modeling lifecycle states, events, and transitions.

```mermaid
stateDiagram-v2
    [*] --> Draft : Customer starts order

    Draft --> Submitted : submit()
    Draft --> Cancelled : cancel()

    Submitted --> PaymentPending : initiate_payment()

    state PaymentPending {
        [*] --> Processing
        Processing --> Authorized : payment_authorized()
        Processing --> Declined : payment_declined()
        Declined --> Processing : retry_payment()
    }

    PaymentPending --> PaymentFailed : max_retries_exceeded()
    PaymentPending --> Confirmed : payment_captured()
    PaymentFailed --> Cancelled : auto_cancel()

    Confirmed --> Preparing : begin_fulfillment()

    state Preparing {
        [*] --> PickingItems
        PickingItems --> Packing : items_picked()
        Packing --> ReadyToShip : packed()
    }

    Preparing --> Shipped : hand_to_carrier()
    Shipped --> InTransit : carrier_scan()
    InTransit --> Delivered : delivery_confirmed()
    InTransit --> DeliveryFailed : delivery_failed()
    DeliveryFailed --> InTransit : rescheduled()

    Delivered --> [*]

    state refund <<choice>>
    Confirmed --> refund : request_refund()
    Shipped --> refund : request_refund()
    refund --> FullRefund : before_shipping
    refund --> PartialRefund : after_shipping
    FullRefund --> Cancelled
    PartialRefund --> Delivered

    Cancelled --> [*]

    note right of Draft : Customer can edit items
    note left of Confirmed : Inventory reserved
    note right of Shipped : Tracking number generated
```

**Why State Diagram:** Order lifecycles have well-defined states and transitions with business rules governing each transition. Composite states (PaymentPending, Preparing) group related sub-states cleanly.

---

## 7. System Architecture Overview (C4 Context)

**Scenario:** Documenting the system context for a healthcare appointment booking platform, showing external users and systems.

**Diagram type:** C4 Context -- shows the system boundary, users, and external system dependencies at the highest level.

```mermaid
C4Context
    title System Context - Healthcare Booking Platform

    Person(patient, "Patient", "Books appointments, views medical records, receives reminders")
    Person(doctor, "Doctor", "Manages schedule, views patient records, conducts consultations")
    Person(admin, "Clinic Admin", "Manages doctors, configures availability, runs reports")

    Enterprise_Boundary(platform, "Healthcare Booking Platform") {
        System(bookingSystem, "Booking System", "Core platform for appointment scheduling, patient management, and telehealth")
    }

    System_Ext(ehr, "EHR System", "Electronic Health Records - stores patient medical data")
    System_Ext(payment, "Stripe", "Payment processing for consultation fees")
    System_Ext(sms, "Twilio", "SMS notifications and appointment reminders")
    System_Ext(video, "Vonage", "Video conferencing for telehealth consultations")
    System_Ext(calendar, "Google Calendar", "Calendar sync for doctors and patients")

    Rel(patient, bookingSystem, "Books appointments, views records", "HTTPS")
    Rel(doctor, bookingSystem, "Manages schedule, conducts consultations", "HTTPS")
    Rel(admin, bookingSystem, "Configures system, manages users", "HTTPS")

    Rel(bookingSystem, ehr, "Reads/writes patient records", "HL7 FHIR API")
    Rel(bookingSystem, payment, "Processes payments", "Stripe API")
    Rel(bookingSystem, sms, "Sends notifications", "Twilio API")
    Rel(bookingSystem, video, "Creates video sessions", "Vonage API")
    Rel(bookingSystem, calendar, "Syncs appointments", "Google Calendar API")

    UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="1")
```

**Why C4 Context:** At the start of any architecture documentation, you need a "zoomed out" view showing who uses the system and what external systems it depends on. C4 Context diagrams are the standard for this.

---

## 8. Service Internals (C4 Component)

**Scenario:** Documenting the internal component structure of the Booking Service from the healthcare platform above.

**Diagram type:** C4 Component -- shows the internal components within a container, their responsibilities, and relationships.

```mermaid
C4Component
    title Component Diagram - Booking Service

    Container_Boundary(bookingSvc, "Booking Service") {
        Component(apiRouter, "API Router", "Express.js", "Routes HTTP requests to appropriate controllers")
        Component(apptCtrl, "Appointment Controller", "TypeScript", "Handles CRUD operations for appointments")
        Component(schedCtrl, "Schedule Controller", "TypeScript", "Manages doctor availability and time slots")
        Component(waitlistCtrl, "Waitlist Controller", "TypeScript", "Manages cancellation waitlist")

        Component(apptSvc, "Appointment Service", "TypeScript", "Business logic for booking, rescheduling, cancellation")
        Component(slotSvc, "Slot Service", "TypeScript", "Calculates available time slots from schedules")
        Component(conflictChecker, "Conflict Checker", "TypeScript", "Detects double-bookings and overlap conflicts")
        Component(reminderSvc, "Reminder Service", "TypeScript", "Schedules and dispatches appointment reminders")

        ComponentDb(apptRepo, "Appointment Repository", "TypeORM", "Data access for appointments table")
        ComponentDb(schedRepo, "Schedule Repository", "TypeORM", "Data access for schedules table")
    }

    ContainerDb_Ext(db, "PostgreSQL", "Booking database")
    ContainerQueue_Ext(queue, "RabbitMQ", "Event queue")
    Container_Ext(notifSvc, "Notification Service", "Sends SMS/email")

    Rel(apiRouter, apptCtrl, "Routes /appointments")
    Rel(apiRouter, schedCtrl, "Routes /schedules")
    Rel(apiRouter, waitlistCtrl, "Routes /waitlist")
    Rel(apptCtrl, apptSvc, "Delegates to")
    Rel(schedCtrl, slotSvc, "Delegates to")
    Rel(apptSvc, conflictChecker, "Checks conflicts")
    Rel(apptSvc, slotSvc, "Queries availability")
    Rel(apptSvc, apptRepo, "Persists data")
    Rel(slotSvc, schedRepo, "Reads schedules")
    Rel(apptSvc, queue, "Publishes appointment.created")
    Rel(reminderSvc, queue, "Consumes reminder.schedule")
    Rel(reminderSvc, notifSvc, "Triggers notification")
    Rel(apptRepo, db, "SQL queries")
    Rel(schedRepo, db, "SQL queries")
```

**Why C4 Component:** After the context view, engineers need to understand what is inside a service. The component diagram shows controllers, services, and repositories -- the building blocks of the implementation.

---

## 9. User Signup Journey

**Scenario:** Documenting the user experience of signing up for a SaaS product, with satisfaction scoring to identify pain points.

**Diagram type:** User Journey -- shows tasks, satisfaction scores, and actors across experience phases.

```mermaid
journey
    title New User Signup Journey
    section Awareness
        See social media ad: 4: Marketing
        Visit landing page: 5: User
        Read feature comparison: 4: User
        Watch product demo: 5: User
    section Signup
        Click "Start Free Trial": 5: User
        Choose email or SSO: 4: User
        Fill in company details: 3: User
        Accept terms of service: 3: User
        Wait for verification email: 2: User
        Click verification link: 4: User
    section Onboarding
        See welcome dashboard: 5: User
        Follow interactive tutorial: 4: User, Support
        Import existing data: 2: User
        Invite first team member: 3: User
        Configure integrations: 2: User, Support
    section Activation
        Complete first workflow: 4: User
        See value metric dashboard: 5: User
        Receive "first win" email: 4: Marketing
```

**Why User Journey:** The satisfaction scores (1-5) immediately highlight pain points in the signup flow. The "Import existing data" step scoring a 2 tells the product team exactly where users struggle. UX researchers and product managers find this format actionable.

---

## 10. Sprint Timeline

**Scenario:** Documenting the planned timeline for a two-week sprint with task dependencies and milestones.

**Diagram type:** Gantt Chart -- the standard for project scheduling with durations, dependencies, and progress tracking.

```mermaid
gantt
    title Sprint 14 - User Dashboard Feature
    dateFormat YYYY-MM-DD
    excludes weekends

    section Design
    User research & wireframes     :done,    design1, 2026-02-02, 2d
    UI mockups in Figma            :done,    design2, after design1, 2d
    Design review                  :done,    design3, after design2, 1d

    section Backend
    Dashboard API endpoints        :active,  be1, after design3, 3d
    Widget data aggregation        :         be2, after be1, 2d
    Caching layer for widgets      :         be3, after be2, 2d
    API documentation              :         be4, after be1, 1d

    section Frontend
    Dashboard layout component     :active,  fe1, after design3, 2d
    Widget components              :         fe2, after fe1, 3d
    Drag-and-drop reordering       :         fe3, after fe2, 2d
    Responsive adjustments         :         fe4, after fe3, 1d

    section QA
    Unit test coverage             :         qa1, after be2, 2d
    Integration tests              :crit,    qa2, after fe3, 2d
    UAT session                    :crit,    qa3, after qa2, 1d

    section Milestones
    Backend API ready              :milestone, m1, after be3, 0d
    Feature complete               :milestone, m2, after fe4, 0d
    Sprint demo                    :milestone, m3, after qa3, 0d
```

**Why Gantt Chart:** Sprint planning requires visualizing task durations, parallel workstreams, dependencies, and milestones. The Gantt format is universally understood by engineering teams and project managers.

---

## 11. Feature Prioritization

**Scenario:** Documenting a product team's prioritization of potential features using an effort vs. impact matrix.

**Diagram type:** Quadrant Chart -- ideal for two-axis comparisons and categorization.

```mermaid
quadrantChart
    title Feature Prioritization - Q2 2026
    x-axis "Low Effort" --> "High Effort"
    y-axis "Low Impact" --> "High Impact"
    quadrant-1 "Quick Wins"
    quadrant-2 "Strategic Bets"
    quadrant-3 "Fill-ins"
    quadrant-4 "Reconsider"
    SSO/SAML Integration: [0.7, 0.9]
    Dark Mode: [0.2, 0.5]
    Bulk CSV Export: [0.3, 0.7]
    Mobile App: [0.9, 0.85]
    Keyboard Shortcuts: [0.15, 0.4]
    Real-time Collaboration: [0.85, 0.95]
    Custom Dashboard Widgets: [0.6, 0.6]
    Email Digest Settings: [0.25, 0.3]
    API Rate Limit Dashboard: [0.4, 0.35]
    Webhook Management UI: [0.5, 0.65]
    Two-factor Auth: [0.35, 0.8]
    Audit Log Export: [0.45, 0.55]
```

**Why Quadrant Chart:** Product prioritization is inherently a two-dimensional problem (effort vs. impact). The quadrant labels provide instant categorization, making it easy to communicate decisions in product review meetings.

---

## 12. Technology Decision Tree

**Scenario:** Documenting the decision framework for choosing a state management solution in a React application.

**Diagram type:** Mindmap -- best for hierarchical exploration of options and their trade-offs.

```mermaid
mindmap
    root((State Management<br/>Decision))
        Local State
            useState
                Simple counters
                Form inputs
                Toggle visibility
            useReducer
                Complex state logic
                Multiple sub-values
                Next state depends on previous
        Shared State
            React Context
                Theme preferences
                Auth status
                Locale settings
                Caveat: re-render on any change
            Zustand
                Medium complexity
                No boilerplate
                Middleware support
                Good DevTools
            Redux Toolkit
                Large applications
                Complex state shape
                Time-travel debugging
                Team familiarity
        Server State
            TanStack Query
                REST API caching
                Automatic refetch
                Optimistic updates
                Pagination and infinite scroll
            SWR
                Simple fetching
                Lightweight
                Next.js integration
            tRPC
                Full-stack TypeScript
                End-to-end type safety
                Works with TanStack Query
        URL State
            Search Params
                Filter and sort state
                Shareable URLs
                nuqs library
```

**Why Mindmap:** Decision trees with nested criteria naturally form a hierarchical structure. The mindmap format lets you explore options at each level without the rigidity of a flowchart, making it ideal for technology evaluation documents.

---

## 13. Project Milestones

**Scenario:** Documenting the key milestones and events across the first year of a startup product launch.

**Diagram type:** Timeline -- shows chronological events grouped by period.

```mermaid
timeline
    title Product Launch Roadmap 2026
    section Foundation (Q1)
        January : Team assembled (5 engineers)
                : Architecture design complete
                : Tech stack finalized
        February : Core API built
                 : Database schema v1
                 : CI/CD pipeline operational
        March : Internal alpha release
              : First 10 beta testers onboarded
    section Growth (Q2)
        April : Public beta launch
              : 100 beta users
              : Feedback collection system live
        May : Payment integration
            : Pricing page launched
            : First paying customer
        June : GA release v1.0
             : Product Hunt launch
             : 500 users milestone
    section Scale (Q3)
        July : Series A fundraise begins
            : SOC 2 compliance started
        August : Enterprise tier launched
               : API rate limiting
               : 2000 users
        September : Mobile app beta
                  : International expansion
    section Maturity (Q4)
        October : Mobile app GA
                : 5000 users
        November : Marketplace integrations
                 : Partner program launch
        December : Year-in-review report
                 : 10000 users target
```

**Why Timeline:** Project milestones are chronological by nature. The section grouping (quarters) provides structure, and multiple events per period show the density of activities.

---

## 14. Git Branching Strategy

**Scenario:** Documenting a team's Git branching strategy based on a simplified Git Flow model.

**Diagram type:** Git Graph -- the only diagram type that directly models Git operations.

```mermaid
gitGraph
    commit id: "initial" tag: "v1.0.0"
    branch develop
    commit id: "setup-ci"
    commit id: "add-linting"

    branch feature/user-auth
    commit id: "auth-models"
    commit id: "auth-endpoints"
    commit id: "auth-tests"
    checkout develop
    merge feature/user-auth id: "merge-auth"

    branch feature/dashboard
    commit id: "dashboard-ui"
    commit id: "dashboard-api"
    checkout develop
    commit id: "fix-ci-config"
    merge feature/dashboard id: "merge-dashboard"

    checkout main
    merge develop id: "release-1.1" tag: "v1.1.0"

    checkout develop
    commit id: "post-release-cleanup"

    checkout main
    branch hotfix/security-patch
    commit id: "patch-xss" type: HIGHLIGHT
    checkout main
    merge hotfix/security-patch id: "apply-hotfix" tag: "v1.1.1"

    checkout develop
    merge main id: "sync-hotfix"
```

**Why Git Graph:** No other diagram type can accurately represent branches, merges, cherry-picks, and tags. This format is essential for documenting branching strategies in team onboarding guides.

---

## 15. Error Distribution

**Scenario:** Documenting the distribution of production errors by category from the last month's monitoring data.

**Diagram type:** Pie Chart -- best for showing proportional distribution of a single metric.

```mermaid
pie showData
    title Production Errors - January 2026
    "Timeout (504)" : 142
    "Bad Request (400)" : 89
    "Unauthorized (401)" : 67
    "Not Found (404)" : 234
    "Internal Error (500)" : 38
    "Rate Limited (429)" : 56
    "Service Unavailable (503)" : 21
```

**Why Pie Chart:** When you need to communicate "what percentage of errors fall into each category," a pie chart provides instant visual proportions. The `showData` option adds raw counts for precision.

---

## 16. Deployment Architecture

**Scenario:** Documenting the cloud infrastructure layout for a production application.

**Diagram type:** Block Diagram -- best for showing layered system composition with visual hierarchy.

```mermaid
block-beta
    columns 5

    space:2 Users["Users / Clients"]:1 space:2

    space:5

    space:1 CDN["CloudFront CDN"]:3 space:1

    space:5

    space:1 LB["Application Load Balancer"]:3 space:1

    space:5

    block:compute:5
        columns 3
        App1["App Server 1<br/>t3.large"] App2["App Server 2<br/>t3.large"] App3["App Server 3<br/>t3.large"]
    end

    space:5

    block:data:5
        columns 3
        PG[("PostgreSQL<br/>db.r6g.xlarge")] Redis[("Redis Cluster<br/>cache.r6g.large")] S3[("S3 Bucket<br/>Static Assets")]
    end

    Users --> CDN
    CDN --> LB
    LB --> App1
    LB --> App2
    LB --> App3
    App1 --> PG
    App2 --> PG
    App3 --> PG
    App1 --> Redis
    App2 --> Redis
    App3 --> Redis
    App1 --> S3
```

**Why Block Diagram:** Infrastructure layouts are inherently layered (client > CDN > load balancer > compute > data). The block diagram's column system and spanning create a natural top-to-bottom infrastructure view that resembles traditional cloud architecture diagrams.
