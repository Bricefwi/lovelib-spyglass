# Phase 4: Senior Writer & Narrative Reports

## 🎯 Overview

Phase 4 introduces the **Senior Writer Agent** - an AI system that synthesizes all agent outputs (9 agents) into cohesive, professional narrative reports in "Laboratoire Perplexity" style.

## ✨ Features

### 1. Senior Writer Agent (`agent-senior-writer`)

**Model:** GPT-4 Turbo (128k context window)

**Mission:** Transform raw JSON data from all agents into fluent, strategic narrative reports (50-100+ pages)

**Input:**
- Results from 9 agents: Scraper, PESTEL, Porter, SWOT, SEO, Content, Social, Email, Data
- Plan profile: report_pages, scenarios_count, narrative_style, quality_level
- Company data: name, url

**Output:**
```json
{
  "sections": [
    {
      "title": "I. Executive Summary",
      "content": "FULL MARKDOWN NARRATIVE...",
      "estimated_pages": 6,
      "key_insights": ["...", "...", "..."]
    },
    // ... 6 sections total
  ],
  "executive_summary_one_page": "Ultra-condensed version",
  "key_recommendations_summary": [
    {
      "priority": 1,
      "recommendation": "Action",
      "rationale": "Why",
      "impact": "ROI chiffré",
      "timeline": "6 mois",
      "budget": "€50-75k"
    }
  ],
  "total_estimated_pages": 50,
  "narrative_quality_score": 9.5,
  "strategic_clarity_score": 9.2
}
```

**Report Structure:**
1. **Executive Summary** (4-8 pages)
2. **Diagnostic Entreprise** (8-12 pages) - Company profile, PESTEL, Porter, SWOT
3. **Audits Marketing & Digital** (15-25 pages) - SEO, Content, Social, Email, Data
4. **Scénarios Stratégiques** (8-15 pages) - Multiple strategic scenarios with ROI
5. **Plan d'Action & Roadmap** (12-18 pages) - 12-month detailed roadmap
6. **Annexes** (5-10 pages) - Methodology, sources, glossary

### 2. Narrative Report Generator (`generateNarrativeReport()`)

**Location:** `supabase/functions/orchestrate-v2/index.ts` (lines 605-1136)

**Features:**
- **Markdown to HTML conversion** with support for:
  - Headers (h1, h2, h3)
  - Bold, italic, code blocks, inline code
  - Links, lists (ordered/unordered)
  - Paragraphs with proper spacing
- **Professional design**:
  - Branded header with gradient (primary/secondary colors)
  - Executive summary highlighted in gold box
  - Key recommendations as priority cards (red/orange/yellow borders)
  - Table of contents with anchor links
  - Multi-section layout with insights boxes
  - Quality scores footer
- **White-label branding**:
  - Custom colors (primary_color, secondary_color)
  - Company logo (logo_url)
  - Company name throughout
- **Print-ready CSS**:
  - `@media print` rules for clean PDF export
  - Page break controls (`page-break-inside: avoid`)
  - Print-optimized layout

### 3. Integration with Orchestrator V2

**Flow:**
```
1. Execute 9 specialized agents (Scraper → PESTEL → Porter → SWOT → SEO/Content/Social/Email/Data)
2. Aggregate all agent results into consolidatedReport
3. Call Senior Writer with all data
4. Generate HTML report using generateNarrativeReport()
5. Store report in audit_reports table
6. Return report_id to client
```

**Code location:** `orchestrate-v2/index.ts` lines 408-458

## 📄 PDF Export Options

The HTML reports are **print-ready** and can be exported to PDF using multiple methods:

### Option 1: Browser Print-to-PDF (Recommended for MVP)

**Frontend implementation:**
```typescript
// In your report viewer component
const handleExportPDF = () => {
  window.print(); // Opens browser print dialog
  // User selects "Save as PDF" destination
};
```

**Advantages:**
- No additional dependencies
- Works in all modern browsers
- Respects @media print styles
- High-quality output

### Option 2: Client-Side PDF Generation

**Using html2pdf.js:**
```typescript
import html2pdf from 'html2pdf.js';

const handleExportPDF = async (reportHtml: string) => {
  const element = document.getElementById('report-container');

  const opt = {
    margin: 10,
    filename: 'rapport-strategique.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  await html2pdf().set(opt).from(element).save();
};
```

**Advantages:**
- Automated PDF generation
- Customizable options
- No server-side processing

### Option 3: Server-Side PDF Generation (Enterprise)

**Using Supabase Edge Function + Puppeteer:**
```typescript
// New edge function: generate-pdf
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

serve(async (req) => {
  const { reportHtml } = await req.json();

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setContent(reportHtml);
  const pdf = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' }
  });

  await browser.close();

  return new Response(pdf, {
    headers: { 'Content-Type': 'application/pdf' }
  });
});
```

**Advantages:**
- Consistent rendering
- No client-side dependencies
- Can generate PDFs server-side for email attachments

**Disadvantages:**
- Requires Puppeteer setup in Deno
- Higher server costs
- Slower than client-side

### Option 4: External PDF API (Easiest for Production)

**Using services like PDFShift, DocRaptor, or CloudConvert:**
```typescript
const handleExportPDF = async (reportHtml: string) => {
  const response = await fetch('https://api.pdfshift.io/v3/convert/pdf', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa('api_key:')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      source: reportHtml,
      landscape: false,
      use_print: true
    })
  });

  const pdfBlob = await response.blob();
  const url = URL.createObjectURL(pdfBlob);

  // Download
  const a = document.createElement('a');
  a.href = url;
  a.download = 'rapport-strategique.pdf';
  a.click();
};
```

**Advantages:**
- Professional rendering
- No infrastructure management
- Fast and reliable

**Disadvantages:**
- External dependency
- Per-PDF cost

## 🎨 Customization

### Narrative Style

Controlled by `plan_profile.narrative_style`:
- `"professionnel"` - McKinsey/BCG style
- `"technique"` - Engineering-focused
- `"executif"` - C-level oriented
- `"startup"` - Agile, fast-paced

### Quality Level

Controlled by `plan_profile.quality_level`:
- `"essential"` - 30-40 pages, focus quick-wins
- `"standard"` - 50-70 pages, balanced analysis + actions
- `"premium"` - 80-100 pages, deep insights, benchmarks
- `"ultimate"` - 100-150 pages, exhaustive scenarios, simulations

### Report Pages & Scenarios

```typescript
plan_profile: {
  report_pages: 50,        // Target page count
  scenarios_count: 3,       // Number of strategic scenarios
  narrative_style: 'professionnel',
  quality_level: 'standard'
}
```

## 🧪 Testing

### Test Senior Writer Agent

```bash
curl -X POST 'http://localhost:54321/functions/v1/agent-senior-writer' \
  -H 'Content-Type: application/json' \
  -d '{
    "agents_results": {
      "company_profile": { /* ... */ },
      "pestel_analysis": { /* ... */ },
      // ... all agents
    },
    "plan_profile": {
      "report_pages": 50,
      "scenarios_count": 3,
      "narrative_style": "professionnel",
      "quality_level": "standard"
    },
    "company_data": {
      "name": "Test Company",
      "url": "https://example.com"
    }
  }'
```

### Test Full Orchestration V2 with Senior Writer

```bash
curl -X POST 'http://localhost:54321/functions/v1/orchestrate-v2' \
  -H 'Authorization: Bearer YOUR_SUPABASE_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "audit_id": "uuid-here"
  }'
```

## 📊 Budget Impact

**Senior Writer Cost Estimation:**

| Quality Level | Tokens (Input) | Tokens (Output) | Cost (GPT-4 Turbo) |
|---------------|----------------|-----------------|-------------------|
| essential     | ~20k          | 6k              | ~$0.40           |
| standard      | ~30k          | 8k              | ~$0.55           |
| premium       | ~40k          | 12k             | ~$0.80           |
| ultimate      | ~50k          | 16k             | ~$1.10           |

**Pricing:** GPT-4 Turbo = $10/1M input tokens + $30/1M output tokens

## 🚀 Deployment

Phase 4 files to deploy:
```
supabase/functions/agent-senior-writer/index.ts
supabase/functions/orchestrate-v2/index.ts (updated)
```

Deploy commands:
```bash
# Deploy Senior Writer
supabase functions deploy agent-senior-writer

# Deploy updated Orchestrator V2
supabase functions deploy orchestrate-v2
```

## 📝 Next Steps

1. ✅ Senior Writer agent created
2. ✅ HTML report generator with Markdown support
3. ✅ Integration with orchestrator V2
4. ⏳ Frontend: Report viewer component
5. ⏳ Frontend: PDF export button (browser print or html2pdf.js)
6. ⏳ Testing: End-to-end with real company data
7. ⏳ Optimization: Token usage reduction for long reports

## 🎯 Success Metrics

- **Narrative Quality Score:** Target 9+/10
- **Strategic Clarity Score:** Target 9+/10
- **Report Generation Time:** < 2 minutes for standard reports
- **Budget Compliance:** Within plan_profile.llm_budget_per_audit
- **User Satisfaction:** Professional-grade consulting reports
