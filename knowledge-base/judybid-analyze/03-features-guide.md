JudyBid Analyze™ - Features Guide
Business profile

The JudyBid business profile tells JudyBid what to look for. Fields: Business Name, Primary Industry, Location / Service Area, NAICS codes (comma-separated), Set-Aside Eligibility (multi-select), PSC / FSC codes, NIGP codes, Capabilities (keywords), Min and Max Budget, Contract Types, and the Capability Statement. When you are signed in, the JudyBid profile is saved to your account automatically as you move between fields and is reloaded when you sign in again. The profile is also kept in your browser. "Reset Profile" clears it. "Load Example Profile" fills in a sample company so you can see how JudyBid works; replace it with your own information before searching.

How the JudyBid profile is used: NAICS codes drive federal search and NAICS scoring. Capabilities keywords drive search terms and keyword scoring. The Location / Service Area field is read for state names or two-letter state abbreviations (for example "Gaithersburg, MD; Virginia; remote U.S. delivery") to filter state and local results and to score location fit. NIGP codes are used as keyword signals for state and local records. PSC / FSC codes are collected in the profile but are not currently used as a search filter or scoring factor.

Capability statement upload and analysis

JudyBid lets you paste your capability statement text or upload a file so it can better understand your services, NAICS codes, certifications, past performance, and differentiators.

- Supported file types: PDF and TXT only, up to 5 MB. Word documents (DOC/DOCX) and other formats are not supported; paste the text instead.
- Text is extracted automatically in your browser (PDF.js is used for PDFs). The file itself is not uploaded to a JudyBid server. The extracted text is placed in the "Paste Capability Statement" box so you can review and edit it. After extraction JudyBid shows "Capability statement extracted (N words). Ready for matching."
- If you already pasted text, the extracted file text is appended (unless it is already there).
- PDFs must contain selectable text. Scanned or image-only PDFs cannot be read because JudyBid does not perform OCR; JudyBid shows "Could not read this file. Paste the capability statement text instead." A file needs at least about 20 characters of readable text.
- If you are signed in, the extracted capability statement text is saved with your profile in your JudyBid account.

What JudyBid does with the capability statement: JudyBid turns the text into matching signals. It extracts keywords (common filler words are ignored), treats any six-digit numbers as possible NAICS codes, looks for set-aside terms (small business, woman-owned/WOSB, veteran-owned/SDVOSB/VOSB, minority-owned/8(a)), and notes state names. These signals are combined with the information you typed in the profile and used to score opportunities. JudyBid does not grade, rewrite, or give feedback on the quality of the capability statement itself. Because any six-digit number can be read as a NAICS code, check that unrelated numbers in the document are not creating unwanted NAICS matches.

Live opportunity search and sources

"Find Opportunities Using My Business Profile" searches connected live government sources using your profile and search criteria, then scores what comes back. The Opportunity Source menu controls where JudyBid looks:
- All Sources: federal (SAM.gov) plus state, local, and education sources.
- Federal (SAM.gov): federal opportunities from SAM.gov only.
- State / Local: state and local opportunities from connected SLED sources.
- Education: education procurement opportunities from connected SLED sources.
- Grants: a SAM.gov award-notice style search. JudyBid is primarily a bid and solicitation tool, so Grants results may be limited; if Grants shows nothing, try Federal or All Sources.

Federal search (SAM.gov): JudyBid searches opportunities posted on SAM.gov in the last 90 days. It sends one request per NAICS code in your profile (up to the first 5 codes) combined with a few of your meaningful keywords, then merges and de-duplicates the results. If no NAICS code is provided it searches by keywords only. Federal notice types are labeled as RFP, Pre-Solicitation, Sources Sought, Special Notice, or Bid. Results can include opportunities whose response deadline has already passed, so always check the due date.

State, local, and education search (SLED): JudyBid queries a connected state, local, and education procurement data source. It uses your keywords and, when your Location / Service Area names recognizable states (up to 5), restricts results to those states. If no state can be recognized in the service area, the state restriction is not applied. SLED records usually include only a title (no full description), no NAICS code, and no budget, so those factors are scored neutrally. Coverage depends on what the connected source provides; JudyBid does not guarantee that every state, county, city, school district, or procurement portal is included.

Only the first 5 NAICS codes and first 10 keywords from your profile and capability statement are used to query live sources. All of your signals are still used when scoring the results that come back. Advanced Search Filters (keyword override, NAICS override, location override, and solicitation type) narrow the results already returned; they do not change what the live sources are asked for.

Federal, state, and local link handling and portal fallback

- Federal (SAM.gov) results link directly to the specific solicitation and show an "Open" button.
- State and local sources sometimes provide only a procurement portal's home page instead of a link to the specific solicitation. When JudyBid detects this, the button reads "Open Source Portal" and the Details view explains: "This procurement portal may not support direct links to individual solicitations. Use the solicitation number or title to locate the opportunity."
- To help you find the listing inside a portal, each result has "Copy #" (solicitation number) and "Copy Title" buttons. The portal name is shown when JudyBid recognizes it, for example Bonfire, DemandStar, BidNet Direct, PlanetBids, Periscope S2G, Bid Express, Jaggaer, Ion Wave, Hawaii eProcurement, Hawaii HANDS, Georgia Procurement Registry, VendorNet, or Public Surplus. Otherwise it is shown as a generic state/local procurement portal.
- When a state or local record has no link at all, the Open button does not lead to a specific page. Use the solicitation number and title to locate it on the agency's procurement site.

Opportunity matching, relevance, and scoring

JudyBid scores every returned opportunity from 0 to 100% using rule-based fit scoring (it is not an AI-written bid analysis). As currently implemented, the factors and approximate weights are: capability keyword overlap 38%, NAICS alignment 20%, budget fit 12%, set-aside fit 10%, location fit 8%, due-date urgency 8%, and contract type fit 4%. A relevance guard sharply lowers the score of a federal opportunity that carries a NAICS code but matches neither your NAICS codes nor any of your keywords, so off-topic results sink to the bottom.

Fit labels: Strong fit (70% and above), Possible fit (45-69%), Needs review (25-44%), and Weak fit (below 25%).

Each result shows "Why this looks relevant" (the matching keywords, NAICS codes, service area, and set-aside eligibility found), "Possible concerns" (a passed or near deadline, NAICS mismatch, set-aside requirements not in your profile, location outside your service area, budget outside your range, or a missing capability statement), signal chips, and a reminder to review the full solicitation. Missing information is treated neutrally: SAM.gov and SLED listings do not include budgets, so budget fit is neutral for them.

Review tools

- Quick Filters: Due within 14 days, Set-aside match, Contract type match, Budget fit, NAICS fit. "Reset" clears them.
- Sort by: Score, Due Date (soonest), or Budget (high to low).
- Details: agency, location, vehicle, solicitation number, source, due date, summary, and the individual scoring parts. "Explain Match" shows a general explanation of how JudyBid weighs keywords, NAICS, budget, and due date.
- Save: stores an opportunity to your account (sign-in required). A dedicated saved-opportunities page is not part of the current interface.
- Export: downloads the current profile and matches as JSON, or the matches as CSV.
- Clear: clears the current results.
- Add Opportunity Manually / Paste Opportunity Link: basic tools to add an opportunity yourself. A pasted link is added as a placeholder entry titled "Opportunity from Link"; JudyBid does not read the linked page. Manual entries are not verified, and running a new live search replaces the current results list.
