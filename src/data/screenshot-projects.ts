import type { Project } from './projects';

const gallery = (slug: string, captions: [number, string][]) =>
  captions.map(([frame, alt]) => ({ src: `/projects/${slug}/${frame}-focus.webp`, alt }));

// Project details come from the owner's supplied descriptions and screenshots.
export const screenshotProjects: Project[] = [
  {
    slug: 'company-dashboard',
    name: 'COMPANY COMMAND CENTER',
    number: '01',
    status: 'published',
    category: 'DASHBOARD',
    kind: 'Dashboard',
    theme: 'graphite',
    coverTitle: 'The company, in view.',
    cover: '/projects/company-dashboard/2-focus.webp',
    description: 'Company performance, team activity and reporting in one clear view.',
    role: 'Dashboard development',
    problem:
      'LeadsEdge reported sales, appointments, leads and other updates across multiple Slack channels. Managers needed a simple way to understand company performance without manually checking each channel.',
    challenge:
      'Turn scattered reports into reliable metrics, detect missing or incorrectly mapped records, and credit activity to the employee who actually performed it—even when the work falls outside their main role.',
    system:
      'The executive dashboard connects directly with Slack, processes reported updates and stores them in PostgreSQL. Those records become business metrics for sales, revenue, appointments, leads, team performance and employee activity.',
    build:
      'Built secure login, date filters, team and employee drill-downs, live Slack event tracking and historical data sync. A dedicated data-health view helps managers find missing records and mapping issues before they affect reporting.',
    technologies: [
      'Next.js',
      'TypeScript',
      'PostgreSQL',
      'Drizzle ORM',
      'Slack API',
      'Supabase',
      'Vercel',
    ],
    outcome:
      'A centralized management view that turns everyday Slack reporting into real-time business intelligence, with a clear path from company-wide results to the people and activity behind them.',
    gallery: gallery('company-dashboard', [
      [1, 'Company dashboard sign-in'],
      [2, 'Company performance overview'],
      [3, 'Division performance'],
      [4, 'Team performance'],
      [5, 'Appointment trends and activity'],
      [6, 'Employee docks and fines overview'],
      [7, 'Reporting data health'],
    ]),
  },
  {
    slug: 'gym-app',
    name: 'DAILY FITNESS',
    number: '02',
    status: 'published',
    category: 'FITNESS APP',
    kind: 'App',
    theme: 'cobalt',
    coverTitle: 'A little stronger, daily.',
    cover: '/projects/gym-app/1-focus.webp',
    description: 'Meals, workouts and progress, built around the everyday routine.',
    role: 'Application development',
    problem:
      'GainTrack turns a coach-written weight-gain plan into a daily routine for someone working night shifts. It brings meals, training, groceries and progress together to make consistency easier.',
    challenge:
      'Keep a detailed plan practical on a small screen while maintaining smooth scrolling. Testing revealed that per-card blur effects and complex animations were too expensive, so I simplified them while preserving the visual style.',
    system:
      'A React Native app built with Expo combines scheduled meals, workout logging, grocery checklists and scheduled local reminders. Data stays on the device, with no account or backend required.',
    build:
      'Built meal history, workout completion and weight-used tracking, gym streaks and weight charts. The interface pairs a dark theme with frosted-glass cards, purple and teal accents, and restrained animations, backed by local data persistence and notification scheduling.',
    technologies: ['React Native', 'Expo'],
    outcome:
      'A focused personal tracking tool that connects a detailed fitness plan with everyday actions, making nutrition, training and progress easier to follow around a night-shift schedule.',
    gallery: gallery('gym-app', [
      [1, 'Daily nutrition and workout overview'],
      [2, 'Daily meal schedule'],
      [3, 'Push workout exercise log'],
      [4, 'Grocery checklist'],
      [5, 'Attendance and consistency'],
      [6, 'Weight journey and weekly check-in'],
    ]),
  },
  {
    slug: 'leadsedge-voice-workflow',
    name: 'Voice & text bot',
    number: '03',
    status: 'published',
    category: 'VOICE & CHAT AUTOMATION',
    kind: 'Workflow',
    theme: 'cobalt',
    coverTitle: 'From conversation to action.',
    cover: '/projects/leadsedge-voice-workflow/1-focus.webp',
    description:
      'A voice and chat assistant that answers business enquiries, books appointments and sends confirmation emails, automating routine customer support.',
    role: 'AI automation development',
    problem:
      'Turn AI conversations with prospects into confirmed appointments without manual scheduling or follow-up administration.',
    challenge:
      'Validate each request, check for calendar conflicts and enforce controlled appointment capacity so an automated conversation cannot create an overbooking.',
    system:
      'An ElevenLabs conversational agent collects the prospect’s details and preferred meeting time, then passes them into n8n. The workflow validates the request, checks Google Calendar and determines whether the requested slot is available.',
    build:
      'Connected voice and chat enquiries to the booking workflow. Once a booking is confirmed, the system creates the calendar event, sends the prospect a confirmation email and logs the appointment in Google Sheets for tracking and follow-up.',
    technologies: ['ElevenLabs', 'n8n', 'Webhooks', 'Google Calendar', 'Google Sheets', 'Gmail'],
    outcome:
      'An end-to-end conversation-to-booking system that removes manual scheduling, reduces response time and gives the sales team structured appointment records from AI conversations.',
    gallery: gallery('leadsedge-voice-workflow', [
      [1, 'Voice enquiry and booking workflow in n8n'],
      [2, 'Appointment records and conversation details in Google Sheets'],
      [3, 'LeadsEdge website with the voice assistant entry point'],
      [4, 'Chatbot conversation from enquiry to appointment booking'],
      [5, 'Appointment confirmation email on mobile'],
    ]),
  },
  {
    slug: 'client-portal',
    name: 'CLIENT & ADMIN PORTAL',
    number: '04',
    status: 'published',
    category: 'CLIENT PORTAL',
    kind: 'App',
    theme: 'graphite',
    coverTitle: 'One place to stay connected.',
    cover: '/projects/client-portal/3-focus.webp',
    description: 'Projects, messages and meetings, connected across client and admin views.',
    role: 'Portal development',
    problem:
      'Leadsedge Portal gives a real estate lead-generation business one place to manage clients, projects, lead assignments, feedback, meetings, emails and activity. Each realtor needs a secure portal limited to their own data.',
    challenge:
      'Give administrators a complete operational view while enforcing strict client isolation. I also optimized the architecture to reduce response times and unnecessary database calls.',
    system:
      'A full-stack client and lead management platform combines passwordless authentication with dedicated admin and realtor views. Supabase row-level security (RLS) restricts which records each client can access, while Realtime supports messaging and notifications.',
    build:
      'Built CRM-style client profiles, project and lead management, real-time messaging, notifications and automated feedback workflows. Meeting scheduling connects with Google Calendar, and email automation uses Resend to keep communication within the same operational flow.',
    technologies: [
      'React',
      'TypeScript',
      'Vinext',
      'Supabase',
      'PostgreSQL',
      'Realtime',
      'Resend',
      'Google Calendar API',
    ],
    outcome:
      'A connected workspace for running client operations, with secure self-service access for realtors and a faster, more efficient architecture for the team managing them.',
    gallery: gallery('client-portal', [
      [1, 'Client-side portal introduction'],
      [2, 'Secure portal sign-in'],
      [3, 'Client home and project attention items'],
      [4, 'Client conversations'],
      [5, 'Client meeting scheduling'],
      [6, 'Admin-side portal introduction'],
      [7, 'Admin project overview'],
      [8, 'Admin people directory'],
      [9, 'Reusable project templates'],
      [10, 'Admin meeting overview'],
      [11, 'Admin conversations'],
    ]),
  },
  {
    slug: 'mgc-sales-assistant',
    name: 'MGC SALES ASSISTANT',
    number: '05',
    status: 'published',
    category: 'SALES APPLICATION',
    kind: 'App',
    theme: 'graphite',
    coverTitle: 'Better answers. Clearer leads.',
    cover: '/projects/mgc-sales-assistant/2-focus.webp',
    description: 'Property questions and structured lead scoring in a focused sales workspace.',
    role: 'Application development',
    problem:
      'MGC’s real estate sales team needed reliable answers across project documents and a better way to decide which leads to contact first. I brought document assistance and lead prioritization into one lightweight local application.',
    challenge:
      'Keep answers grounded in supplied documents and avoid data leakage in lead scoring. The assistant resolves conflicting information using document dates; model training excludes identifiers and information unavailable when a lead first arrives.',
    system:
      'The document assistant uses brochures, price lists and booking policies, showing sources alongside each response. It calculates cumulative pricing premiums and avoids unsupported details. Beside it, a logistic regression model scores leads using patterns learned from 9,000 deduplicated historical records.',
    build:
      'Built a responsive, MGC-branded dashboard with Python and FastAPI, Jinja templates, and a simple local setup. The application combines document questions and answers with a structured lead-scoring form, supported by pandas and scikit-learn.',
    technologies: ['Python', 'FastAPI', 'Jinja', 'pandas', 'scikit-learn'],
    outcome:
      'The lead model achieved an Average Precision of 0.156 against a 0.069 baseline, measuring how effectively it ranks relevant leads. All 19 project tests passed, covering key document answers, scoring and application behavior.',
    gallery: gallery('mgc-sales-assistant', [
      [1, 'Document assistant and lead qualification form'],
      [2, 'Property answer displayed beside the lead-scoring form'],
    ]),
  },
  {
    slug: 'information-mail',
    name: 'INFORMATION MAIL',
    number: '06',
    status: 'published',
    category: 'EMAIL AUTOMATION',
    kind: 'Workflow',
    theme: 'cobalt',
    coverTitle: 'The right information, sent.',
    cover: '/projects/information-mail/1-focus.webp',
    description: 'A spreadsheet update starts the flow from stored files to an outgoing email.',
    role: 'Workflow automation development',
    problem: 'Connect a recipient record with the information that needs to be sent.',
    challenge: 'Coordinate spreadsheet filtering, file retrieval and message delivery.',
    system:
      'An n8n workflow connects a Google Sheets trigger, filtering, Drive downloads and Gmail.',
    build: 'Built a workflow with sheet updates, file retrieval and an email-sending step.',
    technologies: ['n8n', 'Google Sheets', 'Google Drive', 'Gmail'],
    outcome: 'A repeatable path from a spreadsheet event to information delivery.',
    gallery: gallery('information-mail', [
      [1, 'Information email workflow in n8n'],
      [2, 'Recipient spreadsheet and email delivery status'],
    ]),
  },
  {
    slug: 'personalization',
    name: 'PERSONALIZED OUTREACH',
    number: '07',
    status: 'published',
    category: 'OUTREACH AUTOMATION',
    kind: 'Workflow',
    theme: 'cobalt',
    coverTitle: 'Give every message context.',
    cover: '/projects/personalization/1-focus.webp',
    description: 'A connected workflow for preparing tailored outreach from lead information.',
    role: 'Workflow automation development',
    problem:
      'Preparing relevant website-development outreach requires researching each business by hand. This n8n system automates that research and creates short, specific opening lines for cold-email campaigns.',
    challenge:
      'Keep personalization grounded in actual business information, including when a lead has no website. The workflow switches to a missing-online-presence angle instead of inventing details.',
    system:
      'The workflow reads business names, email addresses and website URLs from Google Sheets. For leads with websites, it fetches page content and links, reviews key pages and identifies signals such as service structure, calls-to-action, enquiry paths and overall website quality.',
    build:
      'Connected website research to Gemini to generate a concise icebreaker based on the findings. A separate branch handles businesses without websites. Each result is written back to the original lead sheet, ready for use in a cold-email campaign.',
    technologies: ['n8n', 'Google Sheets', 'Gemini'],
    outcome:
      'A repeatable way to prepare researched outreach at scale, reducing manual website analysis while keeping each opening line tied to real business context.',
    gallery: gallery('personalization', [
      [1, 'Multi-step personalization workflow in n8n'],
      [2, 'Outreach spreadsheet with personalized opening lines'],
    ]),
  },
];
