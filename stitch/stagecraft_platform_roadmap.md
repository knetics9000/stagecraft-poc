# From Prototype to Platform: Stagecraft AI Technical Roadmap

To transform these designs into a live, scalable revenue intelligence platform, the following architectural and development phases are required.

## 1. Core Technical Architecture
Moving from static HTML to a dynamic application requires a modern full-stack architecture:

*   **Frontend Framework:** Transition the current Tailwind CSS/HTML into a framework like **React** or **Next.js**. This allows for reusable components and efficient state management (e.g., tracking a user's progress through the Stage Classifier).
*   **Backend & Database:** A robust backend (Node.js, Python/FastAPI) and a relational database (PostgreSQL) to store Tenant data, Opportunity details, and historical AI analyses.
*   **Authentication:** Secure login for users and multi-tenant isolation (ensuring "JoVE Research" data is never visible to other customers).

## 2. AI Intelligence Layer (The "Brain")
This is where the simulated logic becomes real:

*   **API Integration:** Connect the UI to the **Gemini 1.5 Pro API** (as specified in your config). 
*   **Prompt Engineering:** Implement the "Stage Classifier" logic as a structured system prompt that takes raw meeting notes as input and returns JSON-formatted stage recommendations, confidence scores, and "Truth-Seeking" coaching questions.
*   **Transcription Service:** Integrate a service like Whisper (OpenAI) or Deepgram to turn meeting audio into the text transcripts the AI needs to analyze.

## 3. CRM Data Synchronization
Stagecraft needs to live where the sales data is:

*   **Bi-directional Sync:** Build connectors for Hubspot and Salesforce. When Stagecraft's AI identifies a stage shift (e.g., Discovery -> Evaluation), it should automatically update the CRM record.
*   **Sentiment Tracking:** Store "Narrative Shifts" over time to power the **Stale Deal Radar** and **Revenue Dashboard**.

## 4. Development & Deployment Phases

### Phase 1: The Functional POC (Weeks 1-4)
*   Deploy the frontend to a staging environment (Vercel/Netlify).
*   Hook up the Gemini API to the "Analyze Rep Notes" button.
*   *Outcome:* A tool where a rep can paste notes and get real AI feedback.

### Phase 2: The Beta Product (Weeks 5-12)
*   Implement User Auth and Database persistence.
*   Build the Admin/Config panel to allow custom stage definitions.
*   *Outcome:* A multi-user app where managers can see their team's data.

### Phase 3: The Market-Ready Platform (Months 3+)
*   CRM Integrations (Hubspot/Salesforce).
*   Advanced Analytics (Revenue Forecast & Heatmaps).
*   *Outcome:* A production-grade Revenue Intelligence platform.

## Next Steps for You
The code I have generated is already structured for Phase 1. You can hand the **HTML/Tailwind source** for the current screens to a developer (like Kurt) to begin the React/Next.js implementation immediately.