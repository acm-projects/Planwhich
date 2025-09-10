<p align="center">
<img src='https://media4.giphy.com/media/l1Et9S6qY578FIJ3y/giphy.gif?cid=6c09b9521wzu6ur5dmne16p3xjuwkj7k7ooaccohkyue8nue&ep=v1_internal_gif_by_id&rid=giphy.gif&ct=g' width='700'>
</p>

# <h1 align="center">🗂️ Planwhich 🗂️</h1>

<p align="center">
Managing a project often means chasing down files, juggling tools, and trying to keep everyone on the same page. It’s easy to lose track of what’s been done and what’s slipping through the cracks. <b>Planwhich</b> brings clarity to the chaos. Instead of bouncing between spreadsheets, kanban boards, cloud drives, and calendars, Planwhich gives project leads one centralized space to run their team. Schedule meetings, track progress visually, document key decisions, and keep everything from important links to past bugs and files organized and accessible. Even handoffs between semesters or team changes become easier, with everything stored and searchable in one place. With Planwhich, you don’t just manage projects; you lead them with confidence.
</p>

---

## MVP ✔️

* **Repository Creation**
  * Auto-generate GitHub repos via GitHub API
  * Preload default folder structures and permissions  

* **Interview Dashboard**
  * Track candidates by project  
  * Leave feedback, rate, and update status  

* **Kanban Generation**
  * Create task boards for each team/project  
  * Drag-and-drop task management  

* **Meeting Integration**
  * Notes from weekly syncs, assign follow-ups  
  * Calendar Integration  

* **User Profile**
  * Includes skills, preferred roles, and past project history  

---

## Stretch Goals 💡

* **Email Automation** – Send offer/rejection emails using Amazon SES (Free Tier)  
* **Project Archive** – Upload decks, notes, and resources to Amazon S3 (Free Tier: 5GB)  

---

## Milestones ⏲️

<details>
  <summary><strong>Week 1:</strong></summary>
  <br>
  - Assign roles, finalize features, research AWS tools, wireframes
</details>

<details>
  <summary><strong>Week 2:</strong></summary>
  <br>
  - **Frontend**: Finish up wireframes, start creating basic pages  
  - **Backend**: Continue learning about AWS tools, create ER diagrams, identify relationships  
</details>

<details>
  <summary><strong>Week 3:</strong></summary>
  <br>
  - **Frontend + Backend**: Set up Auth & Integrate  
  - **Frontend**: Basic pages finished  
  - **Backend**: Basic tables set  
</details>

<details>
  <summary><strong>Weeks 4–5:</strong></summary>
  <br>
  - Frontend + Backend: Integrate GitHub Repo Feature  
</details>

<details>
  <summary><strong>Weeks 6–7:</strong></summary>
  <br>
  - Frontend + Backend: Kanban task board and meeting log UI + Integration  
</details>

<details>
  <summary><strong>Weeks 8–9:</strong></summary>
  <br>
  - Frontend + Backend: Polish UI, begin email/calendar integrations, Presentation Prep  
</details>

<details>
  <summary><strong>Week 10:</strong></summary>
  <br>
  - Testing, Final Changes, Present!  
</details>

---

## Tech Stack & Resources 💻

- **Frontend**: React + Next.js  
- **Backend**: Node.js  
- **Database**: DynamoDB / Amazon RDS (Postgres)  
- **Authentication**: Auth0  
- **GitHub Integration**: GitHub Repos API  
- **Calendar**: Google Calendar API  
- **Email Service**: Amazon SES  
- **Storage**: Amazon S3  

<details>
  <summary><strong>Tutorials ⏯️</strong></summary>

  - [React + Next.js](https://nextjs.org/docs/getting-started)  
  - [Node.js Setup](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side/Express_Nodejs/development_environment)  
  - [Auth0 Quickstart (Next.js)](https://auth0.com/docs/quickstart/webapp/nextjs)  
  - [DynamoDB Getting Started](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GettingStarted.html)  
  - [GitHub API Docs](https://docs.github.com/en/rest/repos?apiVersion=2022-11-28)  
  - [Google Calendar API](https://console.cloud.google.com/marketplace/product/google/calendar-json.googleapis.com)  
  - [Amazon SES](https://aws.amazon.com/ses/)  
  - [Amazon S3](https://aws.amazon.com/pm/serv-s3/)  
</details>

<details>
  <summary><strong>Environment Setup ⚙️</strong></summary>

  **Frontend Setup**  
  - React + Next.js: [Docs](https://nextjs.org/docs/getting-started)  
  - Auth0: [Docs](https://auth0.com/docs/quickstart/webapp/nextjs)  
  - Git: [Download](https://git-scm.com/downloads)  
  - VS Code: [Setup](https://code.visualstudio.com/docs/introvideos/versioncontrol)  

  **Backend Setup**  
  - Node.js + Express: [Docs](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side/Express_Nodejs/development_environment)  
  - Auth0 (Backend): [Docs](https://auth0.com/docs/quickstart/backend/nodejs)  
  - DynamoDB: [Setup](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GettingStarted.html)  
</details>

---

## Possible Roadblocks 🧠

- **SQL Schema Setup** → Use tools like dbdiagram.io or draw.io for ERD  
- **RDS Setup Time** → Allocate Week 2 to create instance, user, and connect via pgAdmin  
- **Email Limits / Verification** → Use SES sandbox for dev testing; production requires verification  

---

## Competition ⚔️

| Tool   | Strengths | Weaknesses |
|--------|-----------|------------|
| Jira   | Full suite for PM | Not tailored to ACM projects, no repo/interview integration |
| Trello | Simple task boards | No repo/interview integration |
| Notion | Flexible workspace | Not optimized for dev workflows |

---

## Meet the Team

Project Manager 🌠: Shraddha Subash  

Developers ⭐:  
* Kaitlyn Ferguson  
* Aarya Niraula  
* Rishi Vallabhaneni 
* Aaron Gheevarghese 

Industry Mentor 🌠: Rishi Mekha
