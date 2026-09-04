// SAMPLE CONTENT FOR DESIGN — replace before launch. Nikhil supplies real
// team, quotes, case studies. Blog posts here are a fallback for design and
// for when the Sanity/API blog returns nothing; everything else on this file
// (team, testimonials, case studies) backs pages that are static by design
// and render straight from these arrays — no API call.
//
// Rules followed here (do not relax when replacing):
// - No invented real-sounding people. Team members are titled by role, not
//   named, and have no headshots.
// - Testimonials are attributed to role + sector only, never a person or a
//   named company.
// - Case studies are anonymised: role + sector + market, no client names, no
//   fabricated stats.
// - Blog posts reuse the 10 real, legitimate post titles recovered from the
//   old srclarke.com site audit (2026-09-03) — the post excerpts on that
//   site were spam-injected and unusable, so the dek/body copy below is
//   written fresh in the firm's voice, not copied from anywhere.

import type { Photo } from "./photos";
import { photos } from "./photos";

export type SampleTeamMember = {
  id: string;
  role: string;
  focus: string;
  bio: string;
  sectors: string[];
  /** When set, a texture crop of this photo stands in for a headshot. */
  photo?: Photo;
};

export const sampleTeam: SampleTeamMember[] = [
  {
    id: "managing-director",
    role: "Managing Director",
    focus: "Executive search across commercial and heavy civil",
    bio: "Runs the firm's retained search practice and holds the client relationships that go back decades. The final read on any executive-level shortlist passes through this desk.",
    sectors: ["Executive Search", "Commercial Construction"],
    photo: photos.heavyCivil,
  },
  {
    id: "senior-recruiter-heavy-civil",
    role: "Senior Recruiter, Heavy Civil",
    focus: "Superintendents and project executives for infrastructure work",
    bio: "Fifteen-plus years placing field leadership on bridge, highway, and utility work. Knows which superintendents can run a night pour and which ones just say they can.",
    sectors: ["Heavy Construction", "Infrastructure"],
    photo: photos.trades,
  },
  {
    id: "research-lead",
    role: "Research Lead",
    focus: "Candidate sourcing and confidential database management",
    bio: "Owns the 275,000-plus candidate database and the sourcing process behind every search. Builds the long list before a recruiter ever picks up the phone.",
    sectors: ["Sourcing", "Data"],
    photo: photos.concrete,
  },
  {
    id: "senior-recruiter-commercial",
    role: "Senior Recruiter, Commercial Construction",
    focus: "Project managers and estimators for ground-up commercial work",
    bio: "Focused on the mid-to-senior office side of commercial builds — project managers, estimators, and the occasional VP of Construction search.",
    sectors: ["Commercial Construction", "Pre-Construction"],
    photo: photos.bridgeGirder,
  },
  {
    id: "client-partnerships-lead",
    role: "Client Partnerships Lead",
    focus: "Employer onboarding and search-scope definition",
    bio: "First call for a new client. Turns a vague hiring problem into a position description a recruiter can actually search against.",
    sectors: ["Employer Services"],
    photo: photos.tunnelWorks,
  },
  {
    id: "candidate-experience-lead",
    role: "Candidate Experience Lead",
    focus: "Interview prep, negotiation support, and transition coaching",
    bio: "Works the candidate side of every placement from first interview to start date, including the counteroffer conversation most firms skip.",
    sectors: ["Career Seekers"],
    photo: photos.surveyor,
  },
];

export type SampleTestimonial = {
  id: string;
  quote: string;
  role: string;
  sector: string;
};

export const sampleTestimonials: SampleTestimonial[] = [
  {
    id: "t1",
    quote: "They sent us three candidates. We interviewed all three and hired the second one within a week.",
    role: "VP of Operations, General Contractor, Colorado",
    sector: "Commercial Construction",
  },
  {
    id: "t2",
    quote: "The recruiter knew our project schedule better than some of our own PMs did.",
    role: "Director of Construction, Heavy Civil Contractor",
    sector: "Heavy Construction",
  },
  {
    id: "t3",
    quote: "My employer never found out I was looking. That confidentiality was the whole reason I called them back.",
    role: "Project Superintendent, placed 2025",
    sector: "Commercial Construction",
  },
  {
    id: "t4",
    quote: "No resume blast, no chasing calls. Just the two roles that actually fit what I wanted next.",
    role: "Senior Estimator, placed 2024",
    sector: "Pre-Construction",
  },
  {
    id: "t5",
    quote: "We've used a lot of search firms. This is the only one that has told us no when a request didn't make sense.",
    role: "Chief Financial Officer, Regional Developer",
    sector: "Real Estate Development",
  },
  {
    id: "t6",
    quote: "The offer negotiation support alone was worth the process. I would have left money on the table otherwise.",
    role: "Project Executive, placed 2025",
    sector: "Heavy Construction",
  },
  {
    id: "t7",
    quote: "Every candidate they sent had already worked a job our size. Nobody needed a learning curve.",
    role: "General Superintendent, Specialty Subcontractor",
    sector: "Sub-Contracting",
  },
  {
    id: "t8",
    quote: "They called back after the placement to check in. Nobody does that anymore.",
    role: "Human Resources Director, Multifamily Developer",
    sector: "Real Estate Development",
  },
];

export type SampleCaseStudy = {
  id: string;
  roleTitle: string;
  sector: string;
  location: string;
  challenge: string;
  approach: string[];
};

export const sampleCaseStudies: SampleCaseStudy[] = [
  {
    id: "senior-estimator-denver",
    roleTitle: "Senior Estimator — commercial GC, Denver metro",
    sector: "Commercial Construction",
    location: "Denver, CO",
    challenge:
      "The client had run the role open for four months through a job board and a contingency firm with no qualified applicants. The estimator needed hard-bid and negotiated-work experience on large projects, which narrowed the pool sharply in a market already short on that skill set.",
    approach: [
      "Sourced against the confidential candidate database rather than active job seekers, since the strongest fits were not looking",
      "Pre-screened for takeoff software and bid-day availability before presenting a shortlist",
      "Ran reference checks with two prior supervisors before an offer was extended",
    ],
  },
  {
    id: "project-executive-highway",
    roleTitle: "Project Executive — heavy civil contractor, highway division",
    sector: "Heavy Construction",
    location: "Sacramento, CA",
    challenge:
      "An internal promotion fell through mid-project, leaving a major highway interchange without an executive sponsor. The client needed someone who could step in without a ramp-up period and who DOT prequalification records would already recognize.",
    approach: [
      "Searched specifically within contractors holding active DOT relationships in the region",
      "Verified bonding-capacity experience at the required project size before first interview",
      "Managed the transition timeline so the new hire overlapped two weeks with the outgoing lead",
    ],
  },
  {
    id: "vp-preconstruction-multifamily",
    roleTitle: "VP of Pre-Construction — multifamily developer",
    sector: "Real Estate Development",
    location: "Austin, TX",
    challenge:
      "A fast-growing developer needed a pre-construction lead who could build the department from a single estimator into a team, not just fill a desk. Most candidates in the search had run estimating but never built a process from scratch.",
    approach: [
      "Targeted candidates with a track record of scaling a pre-construction function at a similarly sized developer",
      "Included a working session with the client's ownership group as part of the final round",
      "Structured the offer around a 90-day plan the candidate helped write during the interview process",
    ],
  },
  {
    id: "superintendent-specialty-sub",
    roleTitle: "General Superintendent — specialty mechanical subcontractor",
    sector: "Sub-Contracting",
    location: "Charlotte, NC",
    challenge:
      "A mechanical subcontractor was bidding larger institutional work than its field leadership had experience running. The client needed a general superintendent who had specifically managed multi-crew mechanical scopes on hospital or lab construction.",
    approach: [
      "Narrowed the search to superintendents with direct institutional and healthcare-sector mechanical experience",
      "Confirmed OSHA 30 and any required site-specific certifications before scheduling interviews",
      "Coordinated start date around the subcontractor's active bid calendar to avoid a coverage gap",
    ],
  },
];

export type SampleBlogPost = {
  slug: string;
  title: string;
  dek: string;
  date: string; // ISO
  readingTime: number; // minutes
  cover: Photo;
  category: string;
  body: string[]; // paragraphs
};

export const sampleBlogPosts: SampleBlogPost[] = [
  {
    slug: "5-reasons-to-consider-a-career-in-construction",
    title: "5 Reasons to Consider a Career in Construction",
    dek: "The industry has an image problem and a compensation reality that don't match. What the work actually offers the people entering it today.",
    date: "2024-11-04",
    readingTime: 5,
    cover: photos.welding,
    category: "Career Advice",
    body: [
      "Construction gets talked about as a fallback career. The people running projects on site know better. Field leadership roles pay competitively with white-collar management positions in most metro markets, and the path to that pay is shorter — a superintendent in their early thirties is common; a director in their early thirties in most other industries is not.",
      "The second reason is demand. Skilled field leadership is in shorter supply than qualified candidates in almost every market we work, which means negotiating leverage sits with the candidate more than people expect.",
      "The third is portability. A superintendent's skill set travels between commercial, heavy civil, and specialty subcontracting with retraining measured in months, not years. Few career paths offer that range of lateral movement without starting over.",
      "The fourth and fifth reasons are less quantifiable but matter to the people we place: visible output, and a schedule that rewards decisiveness over office politics. Neither shows up on a compensation survey, but both show up in why people stay.",
    ],
  },
  {
    slug: "hiring-executive-construction-search-firm-recruiters-what-to-expect",
    title: "Hiring Executive Construction Search Firm Recruiters: What to Expect",
    dek: "Retained search works differently than posting a job and waiting. Here is the process a client should expect before the first candidate ever gets presented.",
    date: "2024-12-10",
    readingTime: 6,
    cover: photos.earthworks,
    category: "For Employers",
    body: [
      "The first meeting with a search firm should feel more like an intake interview than a sales call. A recruiter who does not ask about your bonding capacity, your bench strength, or why the last person in the role left has not done this long enough to help you.",
      "Expect a written position description before any sourcing starts. This is not paperwork — it is the filter every candidate gets screened against, and a vague one produces a vague shortlist.",
      "A retained search firm should also be willing to tell a client no. If the compensation range, timeline, or candidate criteria do not match what the market will bear, that conversation should happen before the search begins, not after eight weeks of silence.",
      "Finally, expect a short list, not a long one. Three to five well-vetted candidates beats twenty resumes forwarded without context, and it is the difference between a search firm and a job board with a phone number attached.",
    ],
  },
  {
    slug: "4-strategies-to-help-improve-safety-in-construction",
    title: "4 Strategies to Help Improve Safety in Construction",
    dek: "Safety records follow leadership, not luck. Four things the strongest superintendents we place do differently on site.",
    date: "2025-01-22",
    readingTime: 5,
    cover: photos.concretePour,
    category: "Field Leadership",
    body: [
      "Every superintendent we place gets asked about their safety record in the interview, but the answer that matters is not the number — it is what they changed after an incident, not just how they reported it.",
      "The strongest field leaders run daily huddles that take five minutes and cover one specific hazard for that day's work, not a generic safety reminder read off a laminated card.",
      "They also make near-misses reportable without blame attached. Crews that fear discipline for reporting a close call stop reporting them, which means the data a superintendent needs to prevent the next one simply disappears.",
      "Last, they walk the site personally, on a schedule the crew cannot predict. Announced walkthroughs get you a clean site for twenty minutes. Unannounced ones get you the truth.",
    ],
  },
  {
    slug: "2025-construction-industry-trend-predictions",
    title: "2025 Construction Industry Trend Predictions",
    dek: "Labor supply, project financing, and where the hiring pressure is heaviest this year, based on what we are seeing across active searches.",
    date: "2025-02-14",
    readingTime: 7,
    cover: photos.facadeInstall,
    category: "Industry Trends",
    body: [
      "The labor gap in field leadership is not closing this year. Retirements are outpacing the number of superintendents and project managers moving up from the field, and that pressure shows up first in heavy civil, where the training cycle is longest.",
      "Financing conditions are pushing more developers toward negotiated work over hard-bid, which changes what clients are asking us to source for — estimators who can build a relationship with a GC matter more than estimators who can only turn a fast number.",
      "Multifamily hiring has cooled from its 2022 peak but has not stopped; it has shifted toward renovation and value-add work rather than ground-up construction, which calls for a different kind of project manager than new development did.",
      "Expect continued wage growth for superintendents with DOT or institutional-project experience specifically — general commercial experience is not commanding the same premium this cycle.",
    ],
  },
  {
    slug: "5-common-myths-about-careers-in-construction",
    title: "5 Common Myths About Careers in Construction",
    dek: "What candidates get wrong about pay, advancement, and who actually works in the industry before they talk to us.",
    date: "2025-03-19",
    readingTime: 4,
    cover: photos.industrialShell,
    category: "Career Advice",
    body: [
      "The first myth is that construction careers cap out low. Executive-level compensation in commercial and heavy civil construction competes with corporate management roles in most regions we work, particularly once bonus structures are included.",
      "The second is that advancement requires a four-year degree. Plenty of the project executives we place came up through the field, not through a construction management program, and clients care more about track record than transcript.",
      "The third myth is that the work is unstable. Backlog visibility on most commercial and infrastructure projects runs well over a year out, which is longer job security than a lot of white-collar roles offer right now.",
      "The fourth and fifth — that it is a young person's industry, and that women and career-changers do not have a path in — are both outdated. The candidate pool we place from looks nothing like it did even ten years ago.",
    ],
  },
  {
    slug: "narrow-the-labor-skills-gap-with-a-construction-mentorship-program",
    title: "Narrow the Labor Skills Gap With a Construction Mentorship Program",
    dek: "Formal mentorship is one of the few retention levers that actually works for mid-career field staff. Here is what a program that holds up looks like.",
    date: "2025-04-30",
    readingTime: 6,
    cover: photos.paving,
    category: "For Employers",
    body: [
      "Most mentorship programs in construction fail for the same reason: they pair people up and never define what success looks like. A mentee needs a specific skill target — reading a complex MEP set, running a subcontractor buyout meeting — not a vague instruction to shadow someone.",
      "The programs that work set a fixed term, usually six to twelve months, with a defined handoff point where the mentee takes over a scope independently while the mentor stays available but steps back.",
      "Pairing across generations works better than pairing within one. A superintendent fifteen years into their career mentoring someone five years in transfers judgment calls that do not show up in any training manual.",
      "The return on this is retention, not just skill transfer. Field staff who have a named mentor are measurably less likely to leave in their first three years, which is exactly the window where most attrition happens.",
    ],
  },
  {
    slug: "searching-for-executive-construction-jobs-heres-how-to-seek-out-opportunities",
    title: "Searching for Executive Construction Jobs? Here's How to Seek Out Opportunities",
    dek: "The best executive-level roles in construction are rarely posted publicly. Where they actually surface, and how a confidential search works.",
    date: "2025-06-11",
    readingTime: 5,
    cover: photos.energyInfra,
    category: "Career Advice",
    body: [
      "Executive-level construction roles — VP of Construction, Chief Estimator, Division President — are filled through relationships far more often than job boards. By the time a posting goes public, an internal or referred candidate is often already the frontrunner.",
      "This is the reason a confidential search firm exists in this market. A retained recruiter is brought in specifically because the client does not want the opening known publicly, whether for competitive reasons or because the current person has not yet been told.",
      "For a candidate, this means the fastest path to executive-level opportunities is not a more polished resume — it is being known to the recruiters who run these searches before a role opens, not after.",
      "It also means being selective about which search firm represents you. A firm that puts your resume in front of a client without permission for each specific opportunity is doing you a disservice, not a favor.",
    ],
  },
  {
    slug: "what-is-the-law-of-scarcity-and-how-does-it-relate-to-construction-hiring",
    title: "What Is the Law of Scarcity, and How Does It Relate to Construction Hiring?",
    dek: "Every hiring decision in a tight labor market is a scarcity decision. What that means for how clients should set expectations before a search starts.",
    date: "2025-07-23",
    readingTime: 5,
    cover: photos.residentialDevelopment,
    category: "For Employers",
    body: [
      "The law of scarcity is simple: when a resource is limited, its value rises and the terms shift toward whoever controls it. In construction hiring right now, that resource is qualified field leadership, and the terms have shifted toward the candidate.",
      "Clients who set compensation and criteria based on a labor market from five years ago run searches that stall, not because the recruiting is weak but because the target does not exist at that price in this market.",
      "The firms and clients who hire well right now treat a strong superintendent candidate the way they would treat a scarce material on a bid — they move fast, they do not renegotiate after verbal agreement, and they do not assume the candidate has no other options.",
      "Understanding scarcity does not mean overpaying. It means pricing a role against the actual supply of qualified people, not against what the role paid the last time it was filled.",
    ],
  },
  {
    slug: "career-searching-in-the-construction-industry-how-to-interest-executive-recruiters",
    title: "Career Searching in the Construction Industry: How to Interest Executive Recruiters",
    dek: "Recruiters are not evaluating resumes the way applicant tracking systems do. What actually gets a candidate remembered.",
    date: "2025-08-15",
    readingTime: 4,
    cover: photos.employerOffice,
    category: "Career Advice",
    body: [
      "A resume that lists job titles and dates tells a recruiter almost nothing. What gets remembered is a specific project — the size, the scope, the problem that came up mid-build, and what the candidate did about it.",
      "Recruiters in this industry track people over years, not weeks. Staying in occasional contact after a search closes, even one that did not result in a placement, is what puts a candidate at the top of the list for the next opening that fits.",
      "References matter more here than in most industries, because the network is smaller than people assume. A superintendent's reputation on a jobsite travels faster than any resume does.",
      "Being specific about what is actually being sought — geography, project size, comp floor — helps a recruiter more than being agreeable to anything. Vague candidates get vague opportunities.",
    ],
  },
  {
    slug: "careers-in-construction-highest-paying-executive-roles",
    title: "Careers in Construction: What Are Some of the Highest Paying Executive Construction Roles",
    dek: "A look at where compensation actually concentrates at the executive level, and what experience typically gets a candidate there.",
    date: "2025-09-02",
    readingTime: 6,
    cover: photos.development,
    category: "Industry Trends",
    body: [
      "Division President and Chief Estimator roles carry the highest total compensation we see regularly, particularly at the largest regional and national contractors, where bonus structures are tied directly to backlog and margin performance.",
      "VP of Construction roles at large developers follow closely, especially where the position carries both pre-construction and field oversight rather than one or the other.",
      "Heavy civil and infrastructure executive roles have closed the gap with commercial in the past several years, driven by public infrastructure funding and the relative scarcity of executives with DOT-relationship experience.",
      "The common thread across all of these is not the sector — it is P&L accountability. Executive compensation in construction tracks who owns the numbers on a project, not just who has the most years in the industry.",
    ],
  },
];

export function getSampleBlogPost(slug: string): SampleBlogPost | undefined {
  return sampleBlogPosts.find((p) => p.slug === slug);
}
