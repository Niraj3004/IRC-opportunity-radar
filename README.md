# 🎯 Opportunity Radar

> **An AI-powered opportunity discovery platform for the Islington Research Community (IRC).**

Opportunity Radar is a members-only platform that automatically discovers, extracts, organizes, and presents external opportunities such as **research grants, calls for papers, conferences, hackathons, competitions, workshops, fellowships, and scholarships** in one centralized dashboard.

The platform is designed to reduce the time IRC members spend manually searching across multiple websites and sources for relevant opportunities.

---

## ✨ Overview

Opportunity Radar consists of two major parts:

1. **Automated Collection Agent**
   - Runs on a schedule.
   - Fetches information from configured RSS feeds, APIs, and permitted web sources.
   - Detects whether source content has changed.
   - Extracts structured opportunity information.
   - Normalizes and de-duplicates opportunities.
   - Assigns a confidence score.
   - Automatically publishes high-confidence opportunities.
   - Sends low-confidence opportunities to a human review queue.

2. **Members Dashboard**
   - Allows approved IRC members to browse opportunities.
   - Search and filter opportunities.
   - Save/bookmark opportunities.
   - Track application progress.
   - Configure interests and alerts.
   - Receive notifications and deadline reminders.
   - Receive periodic opportunity digests.

The system also provides administrative and curation functionality for managing sources, members, reviews, system health, KPIs, and audit records.

---

## 🎯 Problem Statement

Students, researchers, academics, and members of research communities often need to monitor many different websites to find:

- Research grants
- Calls for papers
- Conferences
- Hackathons
- Competitions
- Workshops
- Fellowships
- Scholarships

Manually checking these sources is time-consuming and makes it easy to miss relevant opportunities or important deadlines.

### Opportunity Radar solves this problem by:

```text
Multiple Sources
       ↓
Automated Collection
       ↓
Change Detection
       ↓
AI-Assisted Extraction
       ↓
Normalization
       ↓
Duplicate Detection
       ↓
Confidence Scoring
       ↓
Human Review / Auto Publish
       ↓
Centralized Opportunity Feed
       ↓
Personalized Notifications
