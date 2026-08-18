# Opportunity Radar - System Flow

This diagram illustrates how data moves through the system from the original external sources to the end-users (members), including the automated steps performed by the Collection Agent and the manual interventions by Admins and Curators.

```mermaid
graph TD
    %% Actors
    Admin((Admin))
    Curator((Curator))
    Member((Member))

    %% Data Sources
    Source[External Sources: Web/RSS/API]

    %% Admin Setup
    Admin -->|Adds & Configures| Source

    %% Agent Flow
    subgraph "Collection Agent (Background Worker)"
        Fetch[Fetch Content]
        Hash{Has Content Changed?}
        Extract{Source Type}
        Map[Direct Mapping]
        LLM[LLM Extraction]
        Dedupe[De-duplicate Records]
        Score{Confidence Score}
    end

    Source -->|Schedule/Trigger| Fetch
    Fetch --> Hash
    Hash -->|No| Stop[Skip & Stop]
    Hash -->|Yes| Extract
    Extract -->|RSS/API| Map
    Extract -->|HTML Website| LLM
    Map --> Dedupe
    LLM --> Dedupe
    Dedupe --> Score

    %% Routing based on score
    Queue[Review Queue]
    Feed[(Published Database)]

    Score -->|Low Score| Queue
    Score -->|High Score| Feed

    %% Curation
    Queue -->|Review & Edit| Curator
    Curator -->|Approve| Feed
    Curator -->|Reject| Trash[Discard]

    %% Member Interaction
    Feed -->|Browse & Search| Member
    Feed -->|Match Interests| Notify[Send Notifications & Digests]
    Notify --> Member

    Member -->|Bookmark & Track Status| Tracker[Personal Application Tracker]
```
