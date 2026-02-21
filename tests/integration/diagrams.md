---
theme: dark
---

# Diagram Rendering Tests

Testing Mermaid and PlantUML across diagram types and complexity levels.

---

# Mermaid Diagrams

---

## Mermaid — Flowchart (Simple)

```mermaid
flowchart TD
    A[Start] --> B{Valid input?}
    B -->|Yes| C[Process data]
    B -->|No| D[Show error]
    C --> E[(Save to DB)]
    D --> A
    E --> F[Done]
```

## Mermaid — Flowchart (Complex)

```mermaid
flowchart LR
    A([User Request]) --> B[API Gateway]
    B --> C{Auth check}
    C -->|Fail| D[401 Response]
    C -->|Pass| E{Rate limit?}
    E -->|Exceeded| F[429 Response]
    E -->|OK| G[Route request]
    G --> H[User Service]
    G --> I[Product Service]
    G --> J[Order Service]
    H --> K[(Postgres)]
    I --> K
    J --> K
    H --> L[(Redis Cache)]
    I --> L
    J --> L
    K --> M[Aggregate results]
    L --> M
    M --> N[200 Response]
    style D fill:#c0392b
    style F fill:#e67e22
    style N fill:#27ae60
```

## Mermaid — Sequence (Simple)

```mermaid
sequenceDiagram
    participant Alice
    participant Bob
    Alice->>Bob: Hello Bob, how are you?
    Bob-->>Alice: Fine, thanks!
    Note over Alice,Bob: A short conversation
```

## Mermaid — Sequence (Complex)

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant API
    participant Auth
    participant DB

    User->>Browser: Submit login form
    activate Browser
    Browser->>API: POST /login
    activate API
    API->>Auth: Validate credentials
    activate Auth
    Auth->>DB: SELECT user WHERE email=?
    DB-->>Auth: User record
    Auth->>Auth: Verify password hash
    alt Valid credentials
        Auth-->>API: Token payload
        API->>DB: INSERT session
        API-->>Browser: 200 OK + JWT
        Browser-->>User: Redirect dashboard
    else Invalid credentials
        Auth-->>API: Unauthorized
        API-->>Browser: 401 Unauthorized
        Browser-->>User: Show error
    end
    deactivate Auth
    deactivate API
    deactivate Browser
```

## Mermaid — Class Diagram (Simple)

```mermaid
classDiagram
    class Animal {
        +String name
        +int age
        +makeSound() String
    }
    class Dog {
        +String breed
        +bark() void
    }
    class Cat {
        +boolean indoor
        +purr() void
    }
    Animal <|-- Dog
    Animal <|-- Cat
```

## Mermaid — Class Diagram (Complex)

```mermaid
classDiagram
    class Account {
        <<abstract>>
        -String accountId
        -float balance
        #String status
        +deposit(amount float) void
        +withdraw(amount float) bool
        +getBalance() float
    }
    class SavingsAccount {
        -float interestRate
        -float minimumBalance
        +applyInterest() void
    }
    class CheckingAccount {
        -float overdraftLimit
        -int transactionCount
        +getMonthlyFee() float
    }
    class Transaction {
        -String txId
        -float amount
        -String type
        -DateTime timestamp
        +getDetails() String
    }
    class Customer {
        -String customerId
        -String name
        -String email
        +getAccounts() Account[]
    }
    Account <|-- SavingsAccount
    Account <|-- CheckingAccount
    Account "1..*" --> "*" Transaction : records
    Customer "1" --> "1..*" Account : owns
```

## Mermaid — State Diagram (Simple)

```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Processing: submit
    Processing --> Done: success
    Processing --> Failed: error
    Failed --> Idle: retry
    Done --> [*]
```

## Mermaid — State Diagram (Complex)

```mermaid
stateDiagram-v2
    [*] --> PowerOff
    PowerOff --> Booting: power_on
    Booting --> Ready: boot_complete

    state Ready {
        [*] --> Locked
        Locked --> Unlocked: authenticate
        Unlocked --> Locked: timeout / lock

        state Unlocked {
            [*] --> Home
            Home --> AppRunning: launch_app
            AppRunning --> Home: close_app
            Home --> Settings: open_settings
            Settings --> Home: back
        }
    }

    Ready --> Sleeping: inactivity
    Sleeping --> Ready: wake
    Ready --> PowerOff: power_off
    Sleeping --> PowerOff: power_off
```

## Mermaid — ER Diagram

```mermaid
erDiagram
    CUSTOMER ||--o{ ORDER : places
    CUSTOMER {
        int id PK
        string name
        string email
        string country
    }
    ORDER ||--|{ LINE_ITEM : contains
    ORDER {
        int id PK
        int customer_id FK
        date placed_at
        string status
    }
    LINE_ITEM {
        int id PK
        int order_id FK
        int product_id FK
        int quantity
        decimal unit_price
    }
    PRODUCT ||--o{ LINE_ITEM : "included in"
    PRODUCT {
        int id PK
        string name
        string category
        decimal price
        int stock
    }
```

## Mermaid — Gantt Chart

```mermaid
gantt
    title Release 2.0 Timeline
    dateFormat YYYY-MM-DD

    section Discovery
    Requirements      :req,  2025-02-01, 7d
    Design review     :des,  after req, 5d

    section Build
    Backend API       :api,  after des, 14d
    Frontend UI       :fe,   after des, 16d
    Database schema   :db,   after des, 3d

    section Quality
    Unit tests        :unit, after api, 5d
    Integration tests :int,  after unit, 6d
    UAT               :uat,  after int, 4d

    section Ship
    Production deploy :crit, milestone, after uat, 1d
```

## Mermaid — Pie Chart

```mermaid
pie title Browser Market Share 2025
    "Chrome" : 64
    "Safari" : 19
    "Firefox" : 4
    "Edge" : 4
    "Other" : 9
```

## Mermaid — Git Graph

```mermaid
gitGraph
    commit id: "init"
    branch develop
    checkout develop
    commit id: "setup CI"
    branch feature/auth
    checkout feature/auth
    commit id: "add login"
    commit id: "add OAuth"
    checkout develop
    merge feature/auth
    branch feature/search
    checkout feature/search
    commit id: "basic search"
    commit id: "faceted filters"
    checkout develop
    merge feature/search
    checkout main
    merge develop tag: "v1.0.0"
    checkout develop
    commit id: "post-release fix"
```

## Mermaid — Mindmap

```mermaid
mindmap
    root((Architecture))
        Frontend
            React
                Components
                State
            Performance
                Bundling
                Caching
        Backend
            API
                REST
                GraphQL
            Services
                Auth
                Notifications
        Data
            SQL
                Postgres
                Read replicas
            Cache
                Redis
        DevOps
            CI/CD
            Kubernetes
            Monitoring
```

## Mermaid — Timeline

```mermaid
timeline
    title Product History
    section 2022
        Q1 : Beta launch
           : First 50 users
        Q4 : v1.0 released
    section 2023
        Q2 : 10k users
           : Series A funding
        Q3 : Mobile app shipped
        Q4 : Enterprise tier
    section 2024
        Q1 : 100k users
        Q3 : International expansion
        Q4 : v2.0 — AI features
```

## Mermaid — Quadrant Chart

```mermaid
quadrantChart
    title Feature Priority Matrix
    x-axis Low Effort --> High Effort
    y-axis Low Impact --> High Impact
    quadrant-1 Do now
    quadrant-2 Plan carefully
    quadrant-3 Reconsider
    quadrant-4 Quick wins
    Dark mode: [0.2, 0.6]
    Search: [0.4, 0.9]
    AI assistant: [0.85, 0.95]
    Analytics dashboard: [0.6, 0.75]
    Export PDF: [0.3, 0.4]
    SSO login: [0.7, 0.8]
    Onboarding tour: [0.25, 0.55]
```

## Mermaid — XY Chart

```mermaid
xychart-beta
    title "Monthly Active Users"
    x-axis [Jan, Feb, Mar, Apr, May, Jun, Jul, Aug]
    y-axis "Users (k)" 0 --> 120
    bar [18, 24, 31, 44, 57, 72, 89, 108]
    line [18, 24, 31, 44, 57, 72, 89, 108]
```

---

# PlantUML Diagrams

---

## PlantUML — Sequence (Simple)

```plantuml
@startuml
actor User
participant App
database DB

User -> App: Submit form
App -> DB: INSERT record
DB --> App: OK
App --> User: Success message
@enduml
```

## PlantUML — Sequence (Complex)

```plantuml
@startuml
skinparam sequenceArrowThickness 2
skinparam roundcorner 8

actor Customer
participant "Web App" as Web
participant "Order Service" as OS
participant "Payment Service" as PS
participant "Inventory" as INV
database "Order DB" as DB

Customer -> Web: Place order
activate Web

Web -> INV: checkStock(items)
activate INV
INV --> Web: stock OK
deactivate INV

Web -> OS: createOrder(items, address)
activate OS
OS -> DB: INSERT order
DB --> OS: order_id = 9912
OS --> Web: order_id
deactivate OS

Web -> PS: charge(card, total)
activate PS
PS -> PS: validate card
alt Payment success
    PS --> Web: charged OK
    deactivate PS
    Web -> OS: confirmOrder(9912)
    OS -> DB: UPDATE status = confirmed
    Web --> Customer: Order confirmed #9912
else Payment failed
    PS --> Web: declined
    deactivate PS
    Web -> OS: cancelOrder(9912)
    Web --> Customer: Payment failed, try again
end

deactivate Web
@enduml
```

## PlantUML — Use Case

```plantuml
@startuml
left to right direction

actor Customer
actor Admin

rectangle "Online Store" {
    usecase "Browse catalogue" as UC1
    usecase "Search products" as UC2
    usecase "Add to cart" as UC3
    usecase "Checkout" as UC4
    usecase "Track order" as UC5
    usecase "Manage products" as UC6
    usecase "View reports" as UC7
    usecase "Process refund" as UC8
}

Customer --> UC1
Customer --> UC2
Customer --> UC3
Customer --> UC4
Customer --> UC5

Admin --> UC6
Admin --> UC7
Admin --> UC8

UC4 .> UC3 : <<include>>
UC8 .> UC5 : <<include>>
@enduml
```

## PlantUML — Class Diagram

```plantuml
@startuml
abstract class Shape {
    #color : String
    #x : float
    #y : float
    +{abstract} area() : float
    +{abstract} perimeter() : float
    +move(dx: float, dy: float) : void
}

class Circle {
    -radius : float
    +area() : float
    +perimeter() : float
    +getRadius() : float
}

class Rectangle {
    -width : float
    -height : float
    +area() : float
    +perimeter() : float
    +isSquare() : bool
}

class Triangle {
    -a : float
    -b : float
    -c : float
    +area() : float
    +perimeter() : float
    +isEquilateral() : bool
}

class Canvas {
    -shapes : List<Shape>
    +addShape(s: Shape) : void
    +removeShape(s: Shape) : void
    +totalArea() : float
    +render() : void
}

Shape <|-- Circle
Shape <|-- Rectangle
Shape <|-- Triangle
Canvas "1" o-- "0..*" Shape : contains
@enduml
```

## PlantUML — Activity Diagram

```plantuml
@startuml
start
:User submits registration form;

if (Email already exists?) then (yes)
    :Return 409 Conflict;
    stop
else (no)
endif

if (Password meets policy?) then (no)
    :Return 400 Bad Request;
    stop
else (yes)
endif

:Hash password;
:Create user record in DB;
:Generate email verification token;

fork
    :Send welcome email;
fork again
    :Send verification email;
end fork

:Return 201 Created;
:User clicks verification link;

if (Token valid & not expired?) then (yes)
    :Mark email as verified;
    :Activate account;
    :Redirect to dashboard;
else (no)
    :Show expiry error;
    :Offer resend option;
endif

stop
@enduml
```

## PlantUML — Component Diagram

```plantuml
@startuml
skinparam componentStyle rectangle

package "Client Tier" {
    [Web Browser]
    [Mobile App]
}

package "Edge Layer" {
    [CDN]
    [API Gateway]
    [Load Balancer]
}

package "Application Services" {
    [Auth Service]
    [User Service]
    [Product Service]
    [Order Service]
    [Notification Service]
}

package "Data Layer" {
    database "PostgreSQL"
    database "Redis"
    queue "RabbitMQ"
}

[Web Browser] --> [CDN]
[Mobile App] --> [CDN]
[CDN] --> [API Gateway]
[API Gateway] --> [Load Balancer]
[Load Balancer] --> [Auth Service]
[Load Balancer] --> [User Service]
[Load Balancer] --> [Product Service]
[Load Balancer] --> [Order Service]

[Auth Service] --> [Redis]
[User Service] --> [PostgreSQL]
[Product Service] --> [PostgreSQL]
[Order Service] --> [PostgreSQL]
[Order Service] --> [RabbitMQ]
[RabbitMQ] --> [Notification Service]
@enduml
```

## PlantUML — Deployment Diagram

```plantuml
@startuml
node "Client Devices" {
    node "Desktop"
    node "Mobile"
}

cloud "AWS Region eu-west-1" {
    node "Availability Zone A" {
        node "App Server 1" {
            component "Node.js :3000"
        }
        database "Postgres Primary"
    }
    node "Availability Zone B" {
        node "App Server 2" {
            component "Node.js :3000"
        }
        database "Postgres Replica"
    }
    node "Shared Services" {
        component "ALB (Load Balancer)"
        component "ElastiCache (Redis)"
        component "S3 (Static Assets)"
    }
}

"Client Devices" --> "ALB (Load Balancer)"
"ALB (Load Balancer)" --> "App Server 1"
"ALB (Load Balancer)" --> "App Server 2"
"App Server 1" --> "Postgres Primary"
"App Server 2" --> "Postgres Replica"
"Postgres Primary" --> "Postgres Replica" : replication
"App Server 1" --> "ElastiCache (Redis)"
"App Server 2" --> "ElastiCache (Redis)"
@enduml
```

## PlantUML — State Diagram

```plantuml
@startuml
[*] --> Draft

Draft --> Review : submit()
Draft --> [*] : discard()

Review --> Draft : reject(feedback)
Review --> Approved : approve()

Approved --> Published : publish()
Approved --> Draft : request_changes()

Published --> Archived : archive()
Published --> Draft : unpublish()

Archived --> [*]

note right of Draft : Author is editing
note right of Review : Awaiting manager sign-off
note right of Published : Live and visible to all
@enduml
```

## PlantUML — Gantt

```plantuml
@startgantt
Project starts 2025-03-01

[Discovery] lasts 7 days
[Design] starts at [Discovery]'s end and lasts 5 days

[Backend API] starts at [Design]'s end and lasts 12 days
[Frontend UI] starts at [Design]'s end and lasts 14 days

[Integration testing] starts at [Backend API]'s end and lasts 6 days
[UAT] starts at [Integration testing]'s end and lasts 4 days

[Backend API] is 60% completed
[Frontend UI] is 40% completed

[Go-live] happens at [UAT]'s end
@endgantt
```

## PlantUML — MindMap

```plantuml
@startmindmap
* System Design
** Frontend
*** React SPA
**** Component library
**** State management
*** Performance
**** Code splitting
**** CDN caching
** Backend
*** REST API
**** Auth endpoints
**** Resource CRUD
*** Background jobs
**** Email queue
**** Report generation
** Data
*** Primary DB
**** PostgreSQL
**** Migrations
*** Cache
**** Redis
**** TTL strategy
** Operations
*** CI/CD
*** Monitoring
*** Alerting
@endmindmap
```

## PlantUML — WBS

```plantuml
@startwbs
* Platform v2.0
** Planning
*** Stakeholder interviews
*** Requirements doc
*** Technical spec
** Design
*** UX wireframes
*** Visual design
*** Design review
** Engineering
*** Auth module
**** OAuth integration
**** Session management
*** API layer
**** Endpoint design
**** Rate limiting
*** Frontend
**** Component build
**** Routing
** QA
*** Unit tests
*** Integration tests
*** Performance tests
** Release
*** Staging deploy
*** Production deploy
*** Post-launch monitoring
@endwbs
```

## PlantUML — JSON

```plantuml
@startjson
{
  "id": "usr_7f3k2",
  "name": "Ada Lovelace",
  "email": "ada@example.com",
  "active": true,
  "roles": ["admin", "editor"],
  "profile": {
    "title": "Senior Engineer",
    "department": "Platform",
    "location": "London",
    "joinedAt": "2022-09-01"
  },
  "preferences": {
    "theme": "dark",
    "notifications": true,
    "timezone": "Europe/London"
  },
  "stats": {
    "loginCount": 843,
    "lastLogin": "2025-02-19T09:14:22Z",
    "storageUsedMB": 1240
  }
}
@endjson
```
