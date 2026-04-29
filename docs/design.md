```mermaid
flowchart TD
    %% Styling
    classDef file fill:#f9f2f4,stroke:#d04464,stroke-width:1px,color:#c7254e;
    classDef db fill:#f4f9f4,stroke:#44d064,stroke-width:2px;
    classDef kafka fill:#e6f3ff,stroke:#0066cc,stroke-width:2px;

    User((User / Client))
    Ext((External Webhook))
    
    subgraph Auth [Phase 1: Authentication]
        AuthRoute["user.route.js"]:::file --> AuthCtrl["user.controller.js"]:::file
        AuthCtrl --> DB1[("index.db.js (PostgreSQL)")]:::db
    end

    User -->|1. POST /login| AuthRoute
    DB1 -.->|2. Return JWT| User

    subgraph Config [Phase 2: Add Connection & Create Workflow]
        direction TB
        ConnRoute["connection.routes.js"]:::file --> AuthMid["auth.middleware.js"]:::file
        AuthMid --> ConnVal["connection.validator.js"]:::file
        ConnVal --> ConnCtrl["connection.controller.js"]:::file
        ConnCtrl -->|GET /session-token| ConnSvc["connection.service.js"]:::file
        ConnSvc -->|1. Create Session| NangoSDK["Nango Node SDK"]:::file
        NangoSDK -.->|2. token| User
        
        NangoHook["nango.webhook.controller.js"]:::file -->|3. POST /hooks/nango| ConnSvc
        ConnSvc -->|4. Connection ID| NangoAPI["Nango API"]:::file
        NangoAPI -->|5. Return Tokens| ConnSvc
        ConnSvc -->|6. Save Nango ID| DB2[("index.db.js (Connections)")]:::db

        WFRoute["workflow.routes.js"]:::file --> AuthMid2["auth.middleware.js"]:::file
        AuthMid2 --> WFVal["workflow.validator.js"]:::file
        WFVal --> WFCtrl["workflow.controller.js"]:::file
        WFCtrl --> WFSvc["workflow.service.js"]:::file
        WFSvc --> DB3[("index.db.js (Workflows)")]:::db
    end

    User -->|3. POST /connections| ConnRoute
    User -->|4. POST /workflows| WFRoute
    DB3 -.->|5. Return WebhookURL| User

    subgraph Exec [Phase 3 & 4: Ingestion & Asynchronous Execution]
        direction TB
        
        %% Ingestion
        WHRoute["webhook.routes.js"]:::file --> WHCtrl["webhook.controller.js"]:::file
        WHCtrl --> WHSvc["webhook.service.js"]:::file
        WHSvc -->|6. TX: Insert Outbox| DB4[("index.db.js (Outbox)")]:::db
        
        %% Polling
        Relay["trigger-relay/relay.worker.js"]:::file -->|7. SELECT FOR UPDATE| DB4
        Relay --> KafkaUtil["util/kafka.js"]:::file
        KafkaUtil -->|8. Publish: workflow_commands| Kafka{"kafka.config.js<br>(Kafka Broker)"}:::kafka
        
        %% Orchestrator
        Kafka -->|9. Consume: workflow_commands| OrchCons["orchestrator.consumer.js"]:::file
        OrchCons --> OrchSvc["orchestrator.service.js"]:::file
        OrchSvc -->|10. Calculate next action| KafkaUtil2["util/kafka.js"]:::file
        KafkaUtil2 -->|11. Publish: action_commands| Kafka
        
        %% Worker
        Kafka -->|12. Consume: action_commands| WorkerCons["worker.consumer.js"]:::file
        WorkerCons --> Idemp["idempotency.service.js"]:::file
        Idemp -->|13. Check currentStage| DB4
        Idemp --> WorkerSvc["worker.service.js"]:::file
        
        %% Credentials
        WorkerSvc -->|14. getNangoConnectionId| ConnSvc2["connection.service.js"]:::file
        ConnSvc2 -.-> WorkerSvc
        
        %% 3rd Party Call
        WorkerSvc -->|15. Execute Step| Integ["gmail / slack / github / notion"]:::file
        Integ --> Retry["util/retry.js"]:::file
        Retry --> API3((3rd Party API))
        
        %% Finalize
        WorkerSvc -->|16. currentStage++| DB4
        WorkerSvc -->|17. Publish: STEP_COMPLETED| KafkaUtil3["util/kafka.js"]:::file
        KafkaUtil3 --> Kafka
    end

    Ext -->|POST /hooks/:id| WHRoute
    WHSvc -.->|202 Accepted| Ext

```

---

## Operational Safeguards & Architectural Patterns

### 1. Centralized Configuration Management (Zod)
RelayPoint enforces a strict configuration-as-code approach using **Zod** in `env.config.js`. This guarantees that the system is always in a valid state before initialization.
- **Fail-Fast**: Missing or malformed environment variables (e.g., incorrect URL formats) cause immediate process termination during the startup phase.
- **Transformation**: Raw string values from `.env` are automatically cast to their appropriate runtime types (Boolean, Number, Array).

### 2. Workflow Loop Protection (Anti-Recursion)
To maintain platform stability, a sophisticated loop-detection mechanism is implemented in `webhook.service.js`. It prevents infinite cascading executions caused by circular workflow dependencies.
- **Rate-Limiting**: Tracks workflow execution frequency per ID using a sliding window.
- **Thresholds**: Defaults to 10 executions per 60 seconds (configurable via `WORKFLOW_LOOP_THRESHOLD`).
- **Failure Mode**: Exceeding the threshold results in an explicit `ApiError`, which is logged and reported to the orchestrator.

### 3. Outbox Relay Pattern
The platform ensures **at-least-once delivery** of workflow triggers to Kafka by utilizing the Outbox Relay pattern.
- **Transactionality**: Webhook payloads are saved to the `RelayRunOutbox` table in the same database transaction as the initial run state.
- **Reliable Publishing**: A dedicated `relay.worker.js` process polls for `PENDING` outbox entries and publishes them to Kafka, marking them `COMPLETED` only after successful delivery.

### 4. Modular Service Architecture (`server/src/apps`)
RelayPoint uses a standardized plugin system to handle diverse third-party integrations. Each "App" defines its actions and triggers, which are executed within a sandboxed context.

#### Service Execution Flow
```mermaid
flowchart LR
    %% Styling
    classDef plugin fill:#f3e5f5,stroke:#7b1fa2,stroke-width:1px;
    classDef core fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px;

    Caller["Worker / Webhook Service"]:::core
    Loader["app-loader.js<br>(Registry)"]:::core
    GlobalVar["global-variable.js<br>(Context Builder)"]:::core
    
    subgraph Plugin [App Plugin]
        AppDef["app.js<br>(Definition)"]:::plugin
        Action["action.js / trigger.js<br>(Logic)"]:::plugin
    end

    Context["$ (Global Context)"]:::core
    
    Caller -->|1. Get App/Action| Loader
    Loader -->|2. Return Plugin| AppDef
    Caller -->|3. Build Context| GlobalVar
    GlobalVar -->|4. Fetch Auth/HTTP Helpers| Context
    Context -->|5. Inject| Action
    Action -->|6. Execute run| ThirdPartyAPI((3rd Party API))
```

---

```mermaid
erDiagram
    USER ||--o{ CONNECTION : "has"
    USER ||--o{ RELAY : "owns"
    RELAY ||--o{ RELAY_RUN : "triggers"
    RELAY_RUN ||--o{ RELAY_RUN_OUTBOX : "generates"

    USER {
        uuid id PK
        string fullName
        string email UK
        string password
        enum loginType "EMAIL_PASSWORD | GOOGLE | FACEBOOK"
        string googleId
        string refreshToken
        boolean isEmailVerified
        datetime lastLoginAt
    }
    CONNECTION {
        uuid id PK
        uuid userId FK
        enum service "GMAIL | SLACK | GITHUB | NOTION"
        string accountIdentifier "e.g. email address"
        string nangoConnectionId "Nango Connection ID for token healing"
        boolean isActive
        datetime lastUsedAt
    }
    RELAY {
        uuid id PK
        uuid userId FK
        string name
        string description
        boolean active
        jsonb trigger "e.g. webhook config"
        jsonb actions "array of ordered steps"
        string webhookUrl UK
        datetime lastRunAt
        int runCount
        int successCount
        int failureCount
    }
    RELAY_RUN {
        uuid id PK
        uuid relayId FK
        uuid userId FK
        enum status "PENDING | PROCESS | SUCCESS | FAILURE"
        jsonb triggerMetadata "Webhook body that triggered the run"
        jsonb executionHistory "Array of step results with stageIndex, status, timing"
        int currentStage
        datetime startedAt
        datetime completedAt
        int totalDuration "in milliseconds"
        string errorMessage
    }
    RELAY_RUN_OUTBOX {
        uuid id PK
        uuid relayRunId FK
        uuid userId FK
        jsonb payload "The Kafka message payload"
        enum status "PENDING | COMPLETED | FAILED"
    }
```

---

```mermaid
flowchart TD
    classDef page fill:#e3f2fd,stroke:#1976d2,stroke-width:1px;
    classDef feature fill:#fce4ec,stroke:#c2185b,stroke-width:1px;
    classDef shared fill:#f5f5f5,stroke:#616161,stroke-width:1px;
    classDef redux fill:#e8f5e9,stroke:#388e3c,stroke-width:2px;
    classDef api fill:#fff3e0,stroke:#e65100,stroke-width:2px;

    User((User))

    subgraph AppShell [App Layout & Routing]
        Router[AppRouter.jsx]:::shared
        Guard[ProtectedRoute.jsx]:::shared
        Layout[MainLayout.jsx]:::page
        Router --> Guard
        Guard --> Layout
    end
    
    User -->|Navigate| Router

    subgraph Auth [Authentication & Auth Pages]
        LoginPage[LoginPage.jsx]:::page
        LoginForm[LoginForm.jsx]:::feature
        RegForm[RegisterEmailForm.jsx]:::feature
        AuthThunk[authThunks.js]:::redux
        AuthSlice[authSlice.js]:::redux
        
        LoginPage --> LoginForm
        LoginPage --> RegForm
        LoginForm --> AuthThunk
        RegForm --> AuthThunk
        AuthThunk --> AuthSlice
    end

    subgraph Connections [OAuth & Integrations]
        ConnPage[ConnectionsPage.jsx]:::page
        AddConnBtn[AddConnectionButton.jsx]:::feature
        ConnGrid[ConnectionGrid.jsx]:::feature
        ConnThunk[connectionsThunks.js]:::redux
        
        ConnPage --> AddConnBtn
        ConnPage --> ConnGrid
        AddConnBtn --> ConnThunk
        ConnGrid --> ConnThunk
    end

    subgraph Workflows [Dashboard & Listing]
        DashPage[DashboardPage.jsx]:::page
        WFCard[WorkflowCard.jsx]:::feature
        RunHist[RunHistoryTable.jsx]:::feature
        WFThunk[workflowsThunks.js]:::redux
        
        DashPage --> WFCard
        DashPage --> RunHist
        WFCard --> WFThunk
    end

    subgraph Builder [Visual Editor Engine]
        EditorPage[WorkflowEditorPage.jsx]:::page
        Canvas[WorkflowCanvas.jsx]:::feature
        Config[NodeConfigPanel.jsx]:::feature
        SaveBtn[SaveWorkflowBar.jsx]:::feature
        Serialize[serializer.js]:::shared
        Registry[node-registry.js]:::shared
        BuilderSlice[builderSlice.js]:::redux
        
        EditorPage --> Canvas
        EditorPage --> Config
        EditorPage --> SaveBtn
        Canvas --> BuilderSlice
        Config --> BuilderSlice
        Config -.-> Registry
        SaveBtn --> Serialize
        SaveBtn --> WFThunk
    end

    Layout --> Auth
    Layout --> Connections
    Layout --> Workflows
    Layout --> Builder

    subgraph StateManager [Redux Root]
        Store[store.js]:::redux
        Persist[storePersist.js]:::redux
        Store --> Persist
        Persist -.-> AuthSlice
        Store -.-> BuilderSlice
    end

    AuthThunk --> BackendAPI((Backend API)):::api
    ConnThunk --> BackendAPI
    WFThunk --> BackendAPI
```

## Detailed Diagram

```mermaid
flowchart TD
    classDef page fill:#e3f2fd,stroke:#1976d2,stroke-width:1px;
    classDef feature fill:#fce4ec,stroke:#c2185b,stroke-width:1px;
    classDef shared fill:#f5f5f5,stroke:#616161,stroke-width:1px;
    classDef model fill:#fff9c4,stroke:#fbc02d,stroke-width:1px;
    classDef redux fill:#e8f5e9,stroke:#388e3c,stroke-width:2px;
    classDef api fill:#fff3e0,stroke:#e65100,stroke-width:2px;

    User((User))

    subgraph AppShell [App Shell, Layout & Setup]
        Boot[main.jsx]:::shared
        AppSetup[App.jsx]:::shared
        RootProv[RootProvider.jsx]:::shared
        AppProv[AppProviders.jsx]:::shared
        ThemeProv[ThemeProvider.jsx]:::shared
        Router[AppRouter.jsx]:::shared
        GR[GuestRoute.jsx]:::shared
        PR[ProtectedRoute.jsx]:::shared
        ML[MainLayout.jsx]:::page
        Sidebar[AppSidebar.jsx]:::feature
        Header[AppHeader.jsx]:::feature
        Nav[NavItem.jsx]:::feature
        UM[UserMenu.jsx]:::feature
        Req[request.js]:::model
        Err[errorHandler.js]:::model
        Succ[successHandler.js]:::model
        Code[codeMessage.js]:::model
        NotFound[NotFoundPage.jsx]:::page
        Boot --> RootProv --> AppProv --> ThemeProv --> AppSetup --> Router
        Router --> GR & PR & NotFound
        PR --> ML
        ML --> Sidebar & Header
        Sidebar --> Nav & UM
    end

    User -->|Launch| Boot

    subgraph EntityModels [Shared Domain Models]
        UModel[user.types.js]:::model
        RModel[relay.types.js]:::model
        RRModel[relay-run.types.js]:::model
        CModel[connection.types.js]:::model
    end

    subgraph Auth [Authentication & Auth Pages]
        LoginPage[LoginPage.jsx]:::page
        RegEmailPage[RegisterEmailPage.jsx]:::page
        RegUserPage[RegisterUserPage.jsx]:::page
        VerifyPage[VerifyOTPPage.jsx]:::page
        ForgotPage[ForgotPasswordPage.jsx]:::page
        ResetPage[ResetPasswordPage.jsx]:::page

        LoginForm[LoginForm.jsx]:::feature
        RegEmailForm[RegisterEmailForm.jsx]:::feature
        RegUserForm[RegisterUserForm.jsx]:::feature
        OTPInp[OTPInput.jsx]:::feature
        VerifyForm[VerifyOTPForm.jsx]:::feature
        ForgotForm[ForgotPasswordForm.jsx]:::feature
        ResetForm[ResetPasswordForm.jsx]:::feature

        AuthMut[auth.mutations.js]:::api
        AuthSchema[auth.schemas.js]:::model

        AuthThunk[authThunks.js]:::redux
        AuthSlice[authSlice.js]:::redux
        AuthSvc[auth.service.js]:::api

        LoginPage --> LoginForm
        RegEmailPage --> RegEmailForm
        RegUserPage --> RegUserForm
        VerifyPage --> VerifyForm
        VerifyForm -.-> OTPInp
        ForgotPage --> ForgotForm
        ResetPage --> ResetForm

        LoginForm & RegEmailForm & RegUserForm & VerifyForm & ForgotForm & ResetForm --> AuthSchema
        LoginForm & RegEmailForm & RegUserForm & VerifyForm & ForgotForm & ResetForm --> AuthMut
        AuthMut --> AuthThunk --> AuthSlice
        AuthThunk --> AuthSvc
    end

    subgraph Settings [Profile & Settings]
        SetPage[SettingsPage.jsx]:::page
        ProfSec[ProfileSection.jsx]:::feature
        PassForm[ChangePasswordForm.jsx]:::feature
        SetMut[settings.mutations.js]:::api

        SetPage --> ProfSec & PassForm
        PassForm --> SetMut
        SetMut --> AuthThunk
    end

    subgraph Connections [OAuth & Integrations]
        ConnPage[ConnectionsPage.jsx]:::page
        AddConnBtn[AddConnectionButton.jsx]:::feature
        ConnGrid[ConnectionGrid.jsx]:::feature
        ConnCard[ConnectionCard.jsx]:::feature
        SvcIcon[ServiceIcon.jsx]:::feature
        DelConnDlg[DeleteConnectionDialog.jsx]:::feature

        ConnQry[connection.queries.js]:::api
        ConnMut[connection.mutations.js]:::api

        ConnThunk[connectionsThunks.js]:::redux
        ConnSlice[connectionsSlice.js]:::redux

        ConnPage --> AddConnBtn & ConnGrid
        ConnGrid --> ConnCard --> SvcIcon & DelConnDlg
        ConnGrid --> ConnQry
        AddConnBtn & DelConnDlg --> ConnMut
        ConnQry & ConnMut --> ConnThunk --> ConnSlice
    end

    subgraph Workflows [Dashboard & Listing]
        DashPage[DashboardPage.jsx]:::page
        WFListPage[WorkflowListPage.jsx]:::page
        StatOverview[StatsOverview.jsx]:::feature
        StatCard[StatCard.jsx]:::feature
        RunChart[RunChart.jsx]:::feature
        WFFilters[WorkflowFilters.jsx]:::feature
        WFGrid[WorkflowGrid.jsx]:::feature
        WFCard[WorkflowCard.jsx]:::feature
        RunHist[RunHistoryTable.jsx]:::feature
        RunBadge[RunStatusBadge.jsx]:::feature
        DelWFDlg[DeleteWorkflowDialog.jsx]:::feature

        WFFilterMod[workflow.filters.js]:::model
        WFQry[workflow.queries.js]:::api
        WFMut[workflow.mutations.js]:::api

        WFThunk[workflowsThunks.js]:::redux
        WFSlice[workflowsSlice.js]:::redux

        DashPage --> StatOverview & RunHist
        StatOverview --> StatCard & RunChart
        WFListPage --> WFFilters & WFGrid
        WFFilters --> WFFilterMod
        WFGrid --> WFCard
        WFCard --> DelWFDlg
        RunHist --> RunBadge
        
        WFGrid --> WFQry
        WFCard --> WFMut
        WFQry & WFMut --> WFThunk --> WFSlice
    end

    subgraph Builder [Visual Editor Engine]
        EditorPage[WorkflowEditorPage.jsx]:::page
        SaveBtn[SaveWorkflowBar.jsx]:::feature
        Palette[NodePalette.jsx]:::feature
        Canvas[WorkflowCanvas.jsx]:::feature
        Controls[CanvasControls.jsx]:::feature
        TNode[TriggerNode.jsx]:::feature
        ANode[ActionNode.jsx]:::feature
        ConfigPnl[NodeConfigPanel.jsx]:::feature
        TForm[TriggerConfigForm.jsx]:::feature
        AForm[ActionConfigForm.jsx]:::feature
        GM[GmailConfigFields.jsx]:::feature
        SL[SlackConfigFields.jsx]:::feature
        GH[GitHubConfigFields.jsx]:::feature
        NO[NotionConfigFields.jsx]:::feature

        BldMut[builder.mutations.js]:::api
        BldSchem[builder.schemas.js]:::model
        NodeReg[node-registry.js]:::model
        NodeTyps[node-types.js]:::model
        Serialize[serializer.js]:::model

        BuilderSlice[builderSlice.js]:::redux

        EditorPage --> SaveBtn & Palette & Canvas & ConfigPnl
        Canvas --> Controls & NodeTyps
        NodeTyps --> TNode & ANode
        ConfigPnl --> TForm & AForm
        AForm --> GM & SL & GH & NO
        
        Palette & AForm & TForm -.-> NodeReg
        TForm & AForm -.-> BldSchem
        SaveBtn --> BldMut -.-> Serialize
        Canvas & ConfigPnl --> BuilderSlice
        BldMut --> WFThunk
    end

    subgraph ExecMonitor [Execution Tracking]
        WFDetailPage[WorkflowDetailPage.jsx]:::page
        ExecLog[ExecutionLogger.jsx]:::feature
        ExecTime[ExecutionTimeline.jsx]:::feature
        Stage[StageCard.jsx]:::feature
        
        ExecQry[execution.queries.js]:::api
        ExecUtil[execution.utils.js]:::model

        WFDetailPage --> RunHist & ExecLog
        ExecLog --> ExecTime --> Stage
        ExecLog --> ExecQry
        Stage -.-> ExecUtil
        ExecQry --> WFThunk
    end

    ML --> Auth & Settings & Connections & Workflows & Builder & ExecMonitor

    subgraph StateManager [Redux Root]
        Store[store.js]:::redux
        Persist[storePersist.js]:::redux
        Store --> Persist
        Persist -.-> AuthSlice & ConnSlice & WFSlice & BuilderSlice
        Req -.-> Store
    end

    AuthSvc & ConnThunk & WFThunk --> BackendAPI((Backend API)):::api
```

---