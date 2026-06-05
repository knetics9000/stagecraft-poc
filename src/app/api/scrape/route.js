import { NextResponse } from 'next/server';

const parseDateMDY = (str) => {
  if (!str || str === 'N/A') return null;
  const parts = str.split('/');
  if (parts.length === 3) {
    const month = parseInt(parts[0], 10);
    const day = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    return new Date(year, month - 1, day);
  }
  return null;
};

export async function POST(request) {
  try {
    const { url, apiKey } = await request.json();
    if (!url) {
      return NextResponse.json({ error: 'Missing website URL' }, { status: 400 });
    }

    let resolvedKey = apiKey || process.env.GEMINI_API_KEY;

    // Fetch the target URL content
    let html = '';
    let fetchError = null;
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        next: { revalidate: 60 } // Cache for 60s
      });
      if (response.ok) {
        html = await response.text();
      } else {
        fetchError = `HTTP ${response.status}`;
      }
    } catch (err) {
      console.warn("Real scraping failed or is blocked by CORS/network constraints. Falling back to intelligence heuristics.", err);
      fetchError = err.message;
    }

    // Process extracted HTML or use Mock Heuristics
    if (html && resolvedKey && !fetchError) {
      // Strip scripts, styles, and truncate to fit token constraints
      let bodyText = html
        .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '')
        .replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      const maxChars = 15000;
      if (bodyText.length > maxChars) {
        bodyText = bodyText.slice(0, maxChars) + '... [truncated]';
      }

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${resolvedKey}`;
      const payload = {
        contents: [
          {
            role: "user",
            parts: [{
              text: `You are an expert market intelligence analyst. Please extract key company profiles from the raw text crawled from their website:
              
              URL: ${url}
              Crawled Raw Content:
              ${bodyText}
              
              Please output a clean JSON object containing exactly:
              - name: Company/Institution name
              - industry: Main industry focus
              - overview: 2-3 sentences overview of the company
              - key_facts: array of 3-4 key bullet points (e.g. locations, leadership, size)
              - key_offerings: array of their main products/services/programs
              
              Adhere strictly to the JSON schema. Only return raw JSON. Do not wrap in markdown code blocks.`
            }]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2
        }
      };

      const geminiRes = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (geminiRes.ok) {
        const geminiData = await geminiRes.json();
        const extracted = JSON.parse(geminiData.candidates[0].content.parts[0].text);
        return NextResponse.json({ ...extracted, isMock: false });
      }
    }

    // Offline / Network Fallback Heuristics for default demo domains
    const lowerUrl = url.toLowerCase();
    let mockProfile = {
      name: "Clark Atlanta University",
      industry: "Higher Education / HBCU",
      overview: "Clark Atlanta University (CAU) is a private Methodist historically Black research university in Atlanta, Georgia. It is the first HBCU in the Southern United States.",
      key_facts: [
        "President: Dr. George T. French Jr.",
        "Location: Atlanta, Georgia",
        "Enrollment: ~4,000 students",
        "Affiliation: Atlanta University Center Consortium (AUC)"
      ],
      key_offerings: [
        "School of Business Administration",
        "Biological Sciences Research (Cancer Research Center)",
        "Anatomy & Physiology programs",
        "Social Sciences & Humanities"
      ],
      isMock: true
    };

    if (lowerUrl.includes('uah.edu')) {
      mockProfile = {
        name: "University of Alabama at Huntsville",
        industry: "Higher Education / Research",
        overview: "The University of Alabama in Huntsville (UAH) is a public coeducational state university in Huntsville, Alabama, famous for its aerospace and engineering programs.",
        key_facts: [
          "Location: Huntsville, Alabama",
          "Enrollment: ~9,000 students",
          "Key Research: Space Science, Rocketry, Optics, Information Technology"
        ],
        key_offerings: ["Aerospace Engineering", "Physics & Astrobiology", "Chemistry & Biochemistry", "Nursing & Health Sciences"],
        isMock: true
      };
    } else if (lowerUrl.includes('valleyhealth') || lowerUrl.includes('healthoptima')) {
      mockProfile = {
        name: "Valley Health System",
        industry: "Healthcare / Hospital Network",
        overview: "Valley Health is a regional healthcare provider serving the Shenandoah Valley of Virginia and West Virginia, operating six hospitals and multiple outpatient clinics.",
        key_facts: [
          "Locations: Winchester, VA (Headquarters)",
          "Staff: Over 6,000 employees",
          "Specialties: Cardiology, Oncology, Orthopedics, Pediatrics"
        ],
        key_offerings: ["Cardiology Diagnostics", "Inpatient Cardiology Surgery", "Outpatient Cardiology Clinics"],
        isMock: true
      };
    } else if (lowerUrl.includes('apexlabs') || lowerUrl.includes('lexcounsel')) {
      mockProfile = {
        name: "Apex Labs Inc.",
        industry: "Biotechnology / Lead Optimization",
        overview: "Apex Labs is a cutting-edge clinical biology startup specializing in high-throughput molecular diagnostics and assay validation workflows.",
        key_facts: [
          "Founder/CEO: Thomas",
          "Focus: Biotech research and patented assays",
          "Funding Status: Raising Series A"
        ],
        key_offerings: ["Molecular diagnostics catalog", "High-throughput validation assays"],
        isMock: true
      };
    }

    return NextResponse.json({ ...mockProfile, isMock: true });
  } catch (error) {
    console.error('Scrape API Error:', error);
    return NextResponse.json({ error: error.message || 'Scrape failed' }, { status: 500 });
  }
}
