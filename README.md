# EcoTrack AI

Build a premium, modern, animated web application called “EcoTrack AI”.



PROJECT:

EcoTrack AI is an AI-powered campus carbon intelligence platform. It helps students and faculty measure their estimated carbon footprint using real user-provided activity data, analyze major emission sources, receive personalized AI sustainability recommendations, set reduction goals, and track progress.



IMPORTANT:

Do NOT use fake/random data as the primary source of user information.

The application architecture must be ready to use real user data and real APIs.

Where an API is not configured, clearly show “Demo/Setup Required” instead of pretending the data is real.



DESIGN STYLE:

Create a premium environmental-tech interface inspired by modern Apple/Google dashboards.



Visual style:

- Clean white/off-white background

- Deep green primary color

- Soft green gradients

- Glassmorphism cards

- Subtle blur effects

- Rounded 20–28px cards

- Premium typography

- Lots of whitespace

- Minimal but impressive

- Professional enough for an IIT-level hackathon presentation

- Avoid childish cartoon design

- Avoid excessive neon colors

- Use high-quality sustainability icons

- Use smooth micro-interactions everywhere



ANIMATION REQUIREMENTS:

The website MUST have smooth animations.



Use Framer Motion or an equivalent animation library.



Add:

1. Animated landing-page hero

2. Floating eco particles/leaves in the background

3. Smooth page transitions

4. Scroll reveal animations

5. Cards fade/slide into view

6. Animated statistics counters

7. Dashboard charts that animate when loaded

8. Circular carbon score progress animation

9. Animated AI recommendation cards

10. Hover lift effect on cards

11. Button hover and tap animations

12. Smooth navbar transition while scrolling

13. Animated map/location section

14. Progress-bar animations

15. Animated leaderboard ranking

16. Skeleton loading animations

17. Success animation after completing a sustainability goal

18. Smooth modal transitions

19. Animated background gradient

20. Respect prefers-reduced-motion for accessibility



Do NOT over-animate the interface. Animations should feel premium, smooth and professional.



PAGES:



1. LANDING PAGE

2. LOGIN / SIGN UP

3. ONBOARDING

4. USER DASHBOARD

5. CARBON CALCULATOR

6. AI SUSTAINABILITY COACH

7. GOALS & CHALLENGES

8. LEADERBOARD

9. CAMPUS ANALYTICS

10. PROFILE / SETTINGS



--------------------------------------------------

LANDING PAGE

--------------------------------------------------



Hero heading:



“Measure. Understand. Reduce.”



Subheading:



“EcoTrack AI transforms everyday campus activities into actionable carbon insights using real-world data and AI.”



Hero buttons:



“Calculate My Footprint”

“Explore Dashboard”



Add an animated eco-themed visual on the right side showing:



Location → Activity → Carbon → AI → Action



Add floating statistics:



“Transport”

“Energy”

“Food”

“Waste”



Add a smooth animated scrolling section.



SECTION: HOW IT WORKS



Display 5 animated steps:



1. Collect

2. Calculate

3. Analyze

4. Recommend

5. Improve



SECTION: FEATURES



Create animated cards for:



- Real Location-Based Travel Analysis

- Carbon Footprint Calculation

- AI Sustainability Coach

- Future Footprint Prediction

- Personalized Recommendations

- Goals & Challenges

- Campus Analytics

- Sustainability Leaderboard



SECTION: WHY ECOTRACK AI



Show:



“Not just a carbon calculator.”



Then:



Calculate → Predict → Recommend → Track



--------------------------------------------------

REAL LOCATION DATA

--------------------------------------------------



Create a “Travel & Location” module.



Ask the user for browser location permission only after an explicit action:



“Use My Location”



Use browser Geolocation API.



Do NOT continuously track location by default.



Store only the minimum necessary location information.



Allow users to manually enter:

- Starting location

- Destination

- Transport mode

- Travel frequency



Transport modes:



- Walking

- Bicycle

- Bus

- Train/Metro

- Two-wheeler

- Car

- Auto



Architecture should support a real routing API such as Google Maps Routes API or another configured routing provider.



The routing service should calculate actual road/travel distance.



Example flow:



User Location

↓

Destination

↓

Routing API

↓

Actual Distance

↓

Transport Mode

↓

Emission Factor

↓

Estimated CO2e



Do NOT hardcode fake locations.



If the routing API key is missing:

show:

“Route API not configured”

and provide a setup/configuration state.



--------------------------------------------------

CARBON CALCULATION ENGINE

--------------------------------------------------



Create a dedicated carbon calculation service.



Concept:



Activity × Appropriate Emission Factor = Estimated CO2e



Categories:



1. Transportation

2. Electricity/Energy

3. Food

4. Waste



Keep emission factors configurable through a backend/database instead of hardcoding them throughout the frontend.



Show methodology/source information wherever emission factors are used.



IMPORTANT:

Do not claim exact emissions.

Use wording such as:

“Estimated Carbon Footprint”

and

“Estimated CO2e”



--------------------------------------------------

CARBON CALCULATOR

--------------------------------------------------



Create a beautiful multi-step calculator.



STEP 1:

Transportation



Ask:

- Distance

- Transport mode

- Frequency



STEP 2:

Energy



Ask:

- Monthly electricity consumption

- Unit: kWh



Also provide:

“Upload Electricity Bill”



Prepare the architecture for OCR extraction from uploaded bills.



STEP 3:

Food



Ask:

- Meals per day

- Food preference

- Vegetarian / Mixed / Other



STEP 4:

Waste



Ask:

- Approximate waste generation

- Waste categories



After submission:



Show an animated Carbon Score.



Example layout:



YOUR ESTIMATED FOOTPRINT



XX.X kg CO2e



Then display animated breakdown:



Transportation

Energy

Food

Waste



Use charts.



Do not generate fake values.



For empty/new accounts, show:

“No calculation yet”



--------------------------------------------------

USER DASHBOARD

--------------------------------------------------



Create a premium dashboard.



Top section:



“Good morning, [User Name] 🌱”



Show:



Estimated Footprint

Reduction Goal

Eco Points

Current Streak



Main Carbon Score:



Large circular animated progress indicator.



Sections:



1. Carbon Breakdown

2. Monthly Trend

3. Biggest Emission Source

4. AI Recommendation

5. Current Goal

6. Recent Activities



Charts must animate smoothly when entering the page.



Use Recharts or another reliable chart library.



--------------------------------------------------

AI SUSTAINABILITY COACH

--------------------------------------------------



Create a dedicated AI chat interface.



Title:



“EcoTrack AI Coach”



Subtitle:



“Your personal sustainability assistant.”



The AI should analyze the user's actual stored carbon/activity data.



Example questions:



“How can I reduce my footprint?”

“What is my biggest emission source?”

“What should I change this week?”

“How much could I reduce if I change my transport habit?”



AI response should be contextual and based on available user data.



Do not invent user data.



If insufficient data exists, tell the user what data is missing.



Use Gemini API or another configured LLM provider.



Keep API keys server-side.

NEVER expose secret API keys in frontend code.



--------------------------------------------------

AI / ML

--------------------------------------------------



Create an architecture-ready ML service.



Inputs can include:



- Travel distance

- Transport mode

- Travel frequency

- Energy consumption

- Food habits

- Waste

- Historical activity



Output:



Estimated future footprint.



Recommended initial ML approach:



Random Forest Regression or another suitable regression model.



The frontend should NOT pretend an ML model exists if it has not been trained.



Create clear states:



“Model Ready”

or

“Model Not Configured”



Recommendation engine:



Combine deterministic sustainability rules with AI-generated explanations.



Example:



If transportation is the user's highest contributor:

recommend public transport, walking, cycling, carpooling, etc.



Recommendations should be ranked by relevance and potential impact.



--------------------------------------------------

GOALS & CHALLENGES

--------------------------------------------------



Create:



“Your Sustainability Goals”



Examples:



- Reduce transport emissions

- Reduce electricity consumption

- Reduce waste

- Use sustainable transport

- Complete a 7-day green challenge



Each goal should have:



Progress bar

Target

Current value

Deadline

Status



Animate progress when the page loads.



Add achievement badges:



🌱 Green Starter

🚲 Green Commuter

⚡ Energy Saver

♻️ Waste Reducer

🏆 Eco Champion



--------------------------------------------------

LEADERBOARD

--------------------------------------------------



Create a campus sustainability leaderboard.



Show:



Rank

Name

Eco Points

Reduction Progress



Filters:



- Individual

- Department

- Weekly

- Monthly



Use privacy-friendly display names.



Do not expose sensitive user information.



--------------------------------------------------

CAMPUS ANALYTICS

--------------------------------------------------



Create a separate Admin/Campus dashboard.



Display aggregated/anonymized data only.



Sections:



- Total estimated campus emissions

- Transportation contribution

- Energy contribution

- Food contribution

- Waste contribution

- Department trends

- Sustainability participation

- Goal completion



Use interactive charts.



Include a map-ready section for campus visualization.



Do NOT claim real-time campus data unless connected to a real source.



--------------------------------------------------

DATABASE

--------------------------------------------------



Use Supabase/PostgreSQL or Firebase.



Suggested entities:



users

profiles

activities

locations

travel_records

energy_records

food_records

waste_records

carbon_calculations

emission_factors

recommendations

goals

challenges

achievements

campus_analytics



Use proper relationships.



Do not store unnecessary precise location history.



Allow users to delete their personal data.



--------------------------------------------------

AUTHENTICATION

--------------------------------------------------



Implement:



- Email/password

- Google authentication if configured

- Logout

- Forgot password

- Protected dashboard routes



Roles:



STUDENT

FACULTY

ADMIN



Admins can access campus analytics.



--------------------------------------------------

TECH STACK

--------------------------------------------------



Frontend:

React.js

TypeScript

Tailwind CSS

Framer Motion

Recharts



Backend:

Python

FastAPI



Database:

Supabase/PostgreSQL



AI:

Gemini API



ML:

Python

Scikit-learn

Pandas

NumPy



Maps/Routes:

Configurable Google Maps Routes API or equivalent



Authentication:

Supabase Auth / Firebase Auth



Deployment:

Vercel for frontend

Render/Railway for backend



Version control:

GitHub



--------------------------------------------------

SYSTEM ARCHITECTURE

--------------------------------------------------



Create the architecture visually inside the website/documentation:



USER

↓

REACT FRONTEND

↓

FASTAPI BACKEND

↓

┌──────────────────────────────┐

│ Carbon Calculation Engine    │

│ ML Prediction Service        │

│ AI Recommendation Service    │

│ Authentication               │

│ Data Validation               │

└──────────────────────────────┘

↓

POSTGRESQL / SUPABASE

↓

Campus Analytics



External services:



Browser GPS

↓

Routing API

↓

Real Travel Distance



Electricity Bill

↓

OCR Service

↓

Energy Data



Gemini API

↓

AI Sustainability Coach



--------------------------------------------------

SECURITY & PRIVACY

--------------------------------------------------



Implement:



- HTTPS-ready architecture

- Authentication

- Role-based access

- Input validation

- API key protection

- Server-side AI API calls

- Minimum location storage

- User consent for location

- Delete-account/data option

- Do not expose private location history publicly

- Anonymized campus analytics



Add a small privacy notice:



“Your location is used only with your permission to calculate travel distance. EcoTrack AI does not continuously track your location unless explicitly enabled.”



--------------------------------------------------

RESPONSIVE DESIGN

--------------------------------------------------



The website must work perfectly on:



- Mobile

- Tablet

- Laptop

- Desktop



Mobile navigation should become a bottom navigation or hamburger menu.



Dashboard cards should stack cleanly on mobile.



--------------------------------------------------

DEMO DATA RULE

--------------------------------------------------



Do not fill the dashboard with fake numbers and present them as real.



For demo mode, clearly label:



“Demo Data”



For production mode:



Only show calculated values after actual user inputs/API data are available.



Use empty states such as:



“No activity data yet”

“Connect your route service”

“Complete your profile to calculate your footprint”



--------------------------------------------------

FINAL UI QUALITY

--------------------------------------------------



Make the website look like a real startup product, not a college template.



Use:

- Premium typography

- Consistent spacing

- Strong visual hierarchy

- Smooth animation

- Beautiful charts

- Interactive cards

- Responsive layouts

- Accessible contrast

- Loading states

- Error states

- Empty states

- Toast notifications

- Confirmation dialogs



Add a polished footer:



EcoTrack AI

“Measure. Understand. Reduce.”



Links:

About

Privacy

Methodology

Contact

GitHub



FINAL REQUIREMENT:

Build the complete frontend with reusable components and clean TypeScript architecture.



Make all buttons functional.



Do not create placeholder buttons that do nothing.



Where external APIs require credentials, create clear environment-variable configuration and setup instructions.



The final result should be suitable for an AVINYA 2026 sustainability hackathon presentation and should strongly communicate:



REAL DATA → CARBON ANALYSIS → AI → ACTION → IMPACT

**Live app**: https://ecotrackaiten.lovable.app

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
