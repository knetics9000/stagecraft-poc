import { NextResponse } from 'next/server';

export function buildChatSystemPrompt(opportunityContext, companyIntel = null) {
  const crmContext = opportunityContext.crmContext || {};
  const notes = opportunityContext.meetingNotes || '';
  const framework = opportunityContext.frameworkType || '';

  const companyIntelStr = companyIntel ? `
Company Website Intelligence Profile (CRAWLED DATA):
- Company/Institution Name: ${companyIntel.name}
- Industry Segment: ${companyIntel.industry}
- Overview: ${companyIntel.overview}
- Key Facts: ${companyIntel.key_facts ? companyIntel.key_facts.join('; ') : 'N/A'}
- Primary Products/Offerings: ${companyIntel.key_offerings ? companyIntel.key_offerings.join(', ') : 'N/A'}
` : 'No scraped company website intelligence available yet.';

  return `You are "Sales Brain Chat Coach" — an expert B2B Sales Manager and executive deal strategist sitting right beside the representative. Your goal is to guide the representative through their pipeline, answer strategy questions, draft highly customized follow-up emails, and suggest custom pitch points based on the deal state.

Active Opportunity CRM Context:
- Opportunity Name: ${crmContext.opportunityName || 'N/A'}
- Account Name: ${crmContext.accountName || 'N/A'}
- Stage: ${crmContext.stage || 'N/A'}
- Close Date: ${crmContext.closeDate || 'N/A'}
- Amount: ${crmContext.amount || 'N/A'}
- Qualification Framework: ${framework.toUpperCase()}
- Meeting Notes / Notes History:
${notes}

${companyIntelStr}

Instructions:
1. Ground your advice directly in the opportunity context and notes history.
2. Personalize your coaching using the Company Website Intelligence Profile (scraped data) if available. For example, if they have programs in Biology or Business, suggest targeting those specific academic department champions.
3. Be tactical and directive: when asked to draft emails, write fully completed emails (ready to copy and send) that sound natural, executive, and non-salesy, using specific names from the notes.
4. Keep replies structured, using bullet points for recommendations and clear headings. Avoid generic fluff.`;
}

export async function POST(request) {
  try {
    const { messages, opportunityContext, companyIntel, apiKey } = await request.json();
    if (!messages || !opportunityContext) {
      return NextResponse.json({ error: 'Missing messages or opportunityContext' }, { status: 400 });
    }

    let resolvedKey = apiKey || process.env.GEMINI_API_KEY;

    if (resolvedKey) {
      const systemPrompt = buildChatSystemPrompt(opportunityContext, companyIntel);
      
      // Map chat history to Gemini's content format
      // We translate roles: 'user' -> 'user', 'assistant' -> 'model'
      const contents = [
        {
          role: "user",
          parts: [{ text: `System Instructions:\n${systemPrompt}` }]
        }
      ];

      // Add conversation history
      messages.forEach(msg => {
        const geminiRole = msg.role === 'user' ? 'user' : 'model';
        contents.push({
          role: geminiRole,
          parts: [{ text: msg.text }]
        });
      });

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${resolvedKey}`;
      const payload = {
        contents: contents,
        generationConfig: {
          temperature: 0.7
        }
      };

      const geminiRes = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (geminiRes.ok) {
        const geminiData = await geminiRes.json();
        const text = geminiData.candidates[0].content.parts[0].text;
        return NextResponse.json({ text, isMock: false });
      } else {
        const errText = await geminiRes.text();
        console.warn("Gemini Chat API call failed. Falling back to local chat heuristics.", errText);
      }
    }

    // Heuristics Mock Chat response when offline or key is missing
    const lastUserMessage = messages[messages.length - 1]?.text || '';
    const query = lastUserMessage.toLowerCase();
    let replyText = '';

    const crmContext = opportunityContext.crmContext || {};
    const accountName = crmContext.accountName || 'the client';
    const notes = opportunityContext.meetingNotes || '';
    const ownerName = crmContext.owner || 'Maria';

    // 1. Check if user wants an email draft
    if (query.includes('email') || query.includes('write') || query.includes('draft')) {
      let subject = `JoVE upgrade review - ${accountName}`;
      let salutation = "Hi Laura and David,";
      let specificDetail = "our upcoming trial schedule";

      if (accountName.includes('Woodruff')) {
        subject = `IP Ownership review & standard educational licensing agreement`;
        salutation = "Dear Valdoshia,";
        specificDetail = "the IP ownership redlines we discussed regarding our Business and Core: A&P catalogs";
      } else if (accountName.includes('Valley Health')) {
        subject = `HIPAA Compliance Documentation & Scheduling Scheduler demo`;
        salutation = "Dear Dr. Marcus,";
        specificDetail = "the HIPAA compliance packet and SMS reminder modules for Valley Health Cardiology";
      } else if (accountName.includes('Apex')) {
        subject = `FTO patent clearance opinion - Scoping sync`;
        salutation = "Dear Thomas,";
        specificDetail = "our upcoming scoping call regarding the competitor patent claims";
      }

      replyText = `### ✉️ AI Sales Coach - Follow-up Email Draft

Here is a tailored follow-up email ready for you to copy and send:

**Subject:** ${subject}

${salutation}

I hope you are having a productive week. 

Following up on our conversation, I wanted to coordinate our next steps. I've prepared our standard documentation regarding **${specificDetail}** to make sure we are fully aligned.

Would you have 10 minutes next Tuesday at 2:00 PM EST for a quick sync to review these items and map out our target completion?

Best regards,

**${ownerName}**  
Sales Executive  
Stagecraft Intelligence Team
`;
    } 
    // 2. Check if user wants facts about scraped company
    else if (query.includes('president') || query.includes('who') || query.includes('leader') || query.includes('about the company') || query.includes('scraped') || query.includes('intel')) {
      if (companyIntel) {
        replyText = `### 🏢 Scraped Company Intelligence for ${companyIntel.name}

Here is what I extracted from their website regarding your query:
* **Industry Focus:** ${companyIntel.industry}
* **Overview:** ${companyIntel.overview}
* **Leadership & Key Facts:**
${companyIntel.key_facts ? companyIntel.key_facts.map(f => `  - ${f}`).join('\n') : '  - No leadership facts scraped.'}
* **Core Offerings:**
${companyIntel.key_offerings ? companyIntel.key_offerings.map(o => `  - ${o}`).join('\n') : '  - No products/services scraped.'}

**Coaching Tip:** You can leverage their focus on **${companyIntel.key_offerings?.[0] || 'their academic programs'}** to justify why they need our premium upgrade modules.`;
      } else {
        replyText = `### 🔍 Scraped Company Intelligence
No website has been scraped for this opportunity yet. 

**How to Scrape:** Click the **Scrape Website** button in the header block above to crawl their site and populate company intelligence. Once scraped, I can answer specific questions about their leadership, specialties, and goals!`;
      }
    }
    // 3. Check if user is asking how to move along the pipeline / close date advice
    else if (query.includes('close') || query.includes('move') || query.includes('timeline') || query.includes('proposal') || query.includes('date')) {
      const closeDate = crmContext.closeDate || '6/15/2026';
      const quoteDelivered = crmContext.quoteDelivered === 'true' || crmContext.quoteDelivered === true;
      
      if (closeDate === '6/15/2026' && !quoteDelivered) {
        replyText = `### ⏱️ AI Timeline Coaching: Close Date Proximity

Your opportunity Close Date is scheduled for **${closeDate}** (10 days away). However, **Quote Delivered is still unchecked** and no proposal date has been locked in.

**Coach Action Plan:**
1. **Deliver Proposal Immediately:** You are at high risk of timeline slippage. Schedule a call with Laura and David today.
2. **Qualify the Provost's Cycle:** David Moore meets with the Provost monthly. Ask David: *"When is your next monthly alignment sync with the Provost, and what slides can I prepare for you to make the upgrade proposal clear?"*
3. **Database Hygiene:** If a meeting cannot be secured within 48 hours, request a Close Date adjustment to late July.`;
      } else {
        replyText = `### 🎯 AI Pipeline Coaching

Based on the current stage (**${crmContext.stage}**) and metadata:
* **Current Action:** Deliver pricing tiers and follow up on the standard licensing review.
* **Key Contacts:** Ensure you are multi-threaded. Identify champions outside the main library contact (e.g. Science or Business faculty members).
* **Next Gate:** Secure formal procurement security guidelines to run in parallel with legal reviews.`;
      }
    }
    // 4. Default helpful chat response
    else {
      replyText = `### 💡 Sales Coach - Deal Scoping Guidance

I've reviewed your opportunity notes for **${accountName}**. Here is how you can move the deal forward:
* **Personalized Outreach:** Ask me to *"Draft an email"* to draft follow-up templates.
* **Executive Pitching:** Ask me *"How to pitch the library director"* or *"Who is the decision maker"*.
* **Company Scraper:** Enter a URL above and click **Scrape** to feed company research directly into our chat context.

What specific support or outreach drafts do you need right now?`;
    }

    return NextResponse.json({ text: replyText, isMock: true });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: error.message || 'Chat failed' }, { status: 500 });
  }
}
