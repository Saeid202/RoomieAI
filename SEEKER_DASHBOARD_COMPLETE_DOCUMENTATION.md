# Seeker Dashboard - Complete Documentation

**Last Updated:** March 6, 2026  
**Role:** Seeker (Tenant/Buyer)  
**Purpose:** Comprehensive guide to all features available in the Seeker Dashboard

---

## 📋 Table of Contents

1. [Dashboard Overview](#dashboard-overview)
2. [Navigation Structure](#navigation-structure)
3. [Core Features](#core-features)
4. [Rental Features](#rental-features)
5. [Buying Features](#buying-features)
6. [Legal & Support](#legal--support)
7. [Communication](#communication)
8. [Technical Details](#technical-details)

---

## 🏠 Dashboard Overview

The Seeker Dashboard is the central hub for tenants and buyers to:
- Find rental properties and roommates
- Browse buying opportunities (co-ownership and sales)
- Manage rental applications
- Access legal assistance
- Connect with service providers
- Communicate with landlords, sellers, and lawyers

**Access:** `/dashboard` (requires authentication with role: `seeker`)

---

## 🧭 Navigation Structure

### Main Navigation Items

```
🏠 Dashboard                    → /dashboard
👤 Profile                      → /dashboard/profile
🤝 Matches                      → Expandable Section
   ❤️ Ideal Roommate           → /dashboard/matches?tab=ideal-roommate
   🔍 View Matches             → /dashboard/matches?tab=matches
   📅 Plan Ahead               → /dashboard/plan-ahead-matching
   🌙 Opposite Schedule        → /dashboard/opposite-schedule
   💼 Work Exchange            → /dashboard/work-exchange
🏢 Rental Options              → /dashboard/rental-options
📑 My Applications             → /dashboard/applications
💳 Digital Wallet              → /dashboard/digital-wallet
🏘️ Buying Opportunities        → Expandable Section
   🤝 Co-ownership             → /dashboard/buying-opportunities?tab=co-ownership
   🏠 Buy Unit                 → /dashboard/buying-opportunities?tab=sales
   💰 Mortgage Profile         → /dashboard/buying-opportunities?tab=mortgage-profile
🛠️ Renovators                  → /dashboard/renovators
⚖️ Legal                       → Expandable Section
   🤖 AI Legal Assistant       → /dashboard/tenancy-legal-ai
   👨‍⚖️ Contact Lawyer          → /dashboard/find-lawyer
🎓 Education Centre            → /dashboard/education-centre
💬 Messenger                   → /dashboard/chats
⚙️ Settings                    → /dashboard/settings
```

---

## 🎯 Core Features

### 1. Dashboard Home (`/dashboard`)
**Purpose:** Overview of seeker activity and quick actions

**Features:**
- Welcome message with user name
- Quick stats (applications, matches, messages)
- Recent activity feed
- Recommended properties
- Upcoming viewing appointments
- Action items and notifications

**Key Components:**
- Activity cards
- Property recommendations
- Quick action buttons
- Status indicators

---

### 2. Profile (`/dashboard/profile`)
**Purpose:** Manage personal information and preferences

**Features:**
- Personal information (name, email, phone)
- Profile photo upload
- Bio and description
- Preferences and requirements
- Document uploads (ID, proof of income, references)
- Privacy settings

**Document Types:**
- Government ID
- Proof of Income
- Employment Letter
- References
- Credit Report
- Bank Statements

**Storage:** Supabase Storage bucket `tenant-documents`

---

## 🏘️ Rental Features

### 3. Matches Section

#### 3.1 Ideal Roommate (`/dashboard/matches?tab=ideal-roommate`)
**Purpose:** Find compatible roommates based on lifestyle preferences

**Features:**
- Lifestyle questionnaire
- Compatibility scoring
- Preference matching (cleanliness, noise, schedule)
- Pet preferences
- Smoking/drinking preferences
- Social preferences

**Matching Algorithm:**
- Weighted preference scoring
- Lifestyle compatibility
- Budget alignment
- Location preferences

#### 3.2 View Matches (`/dashboard/matches?tab=matches`)
**Purpose:** Browse matched roommates and properties

**Features:**
- Match cards with compatibility scores
- Filter by compatibility percentage
- Message matched users
- Save favorites
- View detailed profiles

#### 3.3 Plan Ahead Matching (`/dashboard/plan-ahead-matching`)
**Purpose:** Find roommates for future move-in dates

**Features:**
- Set future move-in date
- Match with users planning ahead
- Timeline visualization
- Flexible date ranges
- Commitment indicators

#### 3.4 Opposite Schedule (`/dashboard/opposite-schedule`)
**Purpose:** Match with roommates who have opposite work schedules

**Features:**
- Work schedule input (days/nights/rotating)
- Shift pattern matching
- Privacy benefits highlighted
- Shared space optimization
- Schedule compatibility scoring

#### 3.5 Work Exchange (`/dashboard/work-exchange`)
**Purpose:** Exchange work/services for reduced rent

**Features:**
- Skills listing
- Service offerings
- Landlord work exchange opportunities
- Negotiation tools
- Agreement templates

---

### 4. Rental Options (`/dashboard/rental-options`)
**Purpose:** Browse available rental properties

**Features:**
- Property listings grid/list view
- Advanced filters:
  - Price range
  - Bedrooms/bathrooms
  - Location/neighborhood
  - Amenities
  - Pet-friendly
  - Lease terms
- Map view
- Save favorites
- Schedule viewings
- Quick apply
- Property comparison

**Property Card Information:**
- Photos
- Price
- Location
- Bedrooms/bathrooms
- Square footage
- Availability date
- Key features
- Landlord rating

**Actions:**
- View Details
- Schedule Viewing
- Quick Apply
- Message Landlord
- Save Property

---

### 5. My Applications (`/dashboard/applications`)
**Purpose:** Track rental application status

**Features:**
- Application list with status
- Application timeline
- Document status
- Landlord responses
- Interview scheduling
- Offer management
- Lease signing

**Application Statuses:**
- `pending` - Submitted, awaiting review
- `under_review` - Landlord reviewing
- `interview_scheduled` - Interview arranged
- `approved` - Application accepted
- `rejected` - Application declined
- `withdrawn` - Applicant withdrew

**Application Details:**
- Property information
- Submission date
- Required documents
- Landlord notes
- Next steps
- Communication history

---

### 6. Digital Wallet (`/dashboard/digital-wallet`)
**Purpose:** Manage payments and financial transactions

**Features:**
- Wallet balance
- Payment history
- Rent payments (via Stripe PAD)
- Security deposits
- Application fees
- Refund tracking
- Payment methods management
- Transaction receipts

**Payment Methods:**
- Bank account (PAD - Pre-Authorized Debit)
- Credit/debit card
- Stripe integration

**Supported Transactions:**
- Monthly rent payments
- Security deposits
- Application fees
- Utility payments
- Damage deposits

---

## 🏡 Buying Features

### 7. Buying Opportunities (`/dashboard/buying-opportunities`)

#### 7.1 Co-ownership Tab (`?tab=co-ownership`)
**Purpose:** Find co-ownership opportunities and partners

**Features:**
- Co-ownership signals (buyer interest indicators)
- Property listings open to co-ownership
- Partner matching
- Financial capacity display
- Investment scenarios
- Co-ownership agreements

**Co-ownership Signal:**
- Capital available
- Household type
- Intended use (live-in/investment)
- Time horizon
- Non-binding interest declaration

**Property Listings:**
- Properties explicitly marked for co-ownership
- Seller information
- Co-ownership structure
- Investment details
- Legal framework

#### 7.2 Buy Unit Tab (`?tab=sales`)
**Purpose:** Browse properties for sale

**Features:**
- Sales listings
- Property details
- Price information
- Photos and virtual tours
- Neighborhood information
- Property history
- Make offer functionality
- Schedule viewings

**Property Information:**
- Listing price
- Property type
- Bedrooms/bathrooms
- Square footage
- Year built
- Property taxes
- HOA fees
- Days on market

**Actions:**
- View Details
- Schedule Viewing
- Make Offer
- Message Seller
- Save Property
- Share Listing
- Request Documents

#### 7.3 Mortgage Profile Tab (`?tab=mortgage-profile`)
**Purpose:** Complete mortgage pre-qualification profile

**Sections:**

**Basic Information:**
- Full name
- Email
- Age
- Phone number
- Date of birth
- First-time buyer status
- Co-borrower information

**Employment & Income:**
- Employment status (employed/contractor/self-employed)
- Employment type (permanent/part-time)
- Employer name
- Industry
- Employment duration
- Income range
- Variable income types

**Assets & Down Payment:**
- Intended down payment
- Funding sources (savings/gift/investments/RRSP/sale of property)
- Gift details (provider, amount, letter availability)
- Liquid savings balance
- Investment holdings
- Cryptocurrency holdings
- Funds outside Canada

**Credit & Debts:**
- Credit score range
- Monthly debt payments
- Debt breakdown:
  - Credit cards
  - Personal loans
  - Auto loans
  - Student loans
  - Other debts
- Missed payments history
- Bankruptcy/proposal history

**Property Intent:**
- Purchase price range
- Property type preference
- Intended use
- Target location
- Timeline to buy

**Broker Consent:**
- Checkbox to share profile with mortgage brokers
- Privacy notice
- Broker matching

**Features:**
- Auto-save functionality
- Progress indicator
- Validation
- Broker feedback tab
- Document upload tab
- Refinance application tab

---

### 8. Mortgage Documents Tab
**Purpose:** Upload required mortgage documents

**Document Types:**
- Pay stubs (last 2-3 months)
- T4/Tax returns (last 2 years)
- Employment letter
- Bank statements (last 3 months)
- Investment statements
- Gift letter (if applicable)
- Down payment proof
- Credit report
- ID documents

**Features:**
- Drag-and-drop upload
- Document categorization
- Status tracking
- Broker access
- Secure storage
- Download capability

---

### 9. Broker Feedback Tab
**Purpose:** Receive feedback from mortgage brokers

**Features:**
- Broker messages
- Pre-qualification status
- Improvement suggestions
- Document requests
- Rate quotes
- Next steps
- Unread count indicator

---

### 10. Refinance Application Tab
**Purpose:** Apply for mortgage refinancing

**Features:**
- Current mortgage details
- Refinance goals
- Property value estimate
- Document upload
- Broker matching
- Rate comparison

---

## 🛠️ Service Providers

### 11. Renovators (`/dashboard/renovators`)
**Purpose:** Find and hire renovation contractors

**Features:**
- Contractor listings
- Service categories
- Ratings and reviews
- Portfolio/past work
- Get quotes
- Message contractors
- Book consultations

**Service Categories:**
- Kitchen renovation
- Bathroom renovation
- Flooring
- Painting
- Electrical
- Plumbing
- General contracting

---

## ⚖️ Legal & Support

### 12. AI Legal Assistant (`/dashboard/tenancy-legal-ai`)
**Purpose:** Get instant answers to tenancy legal questions

**Features:**
- AI-powered chat interface (Gemini)
- Tenancy law knowledge base
- Document analysis
- Lease review
- Rights and responsibilities
- Dispute resolution guidance
- Legal form templates

**Powered By:** Google Gemini AI
**Knowledge Base:** Ontario tenancy laws, RTA, LTB procedures

**Common Questions:**
- Rent increase rules
- Eviction procedures
- Maintenance responsibilities
- Security deposit rules
- Lease termination
- Subletting rights

---

### 13. Contact Lawyer (`/dashboard/find-lawyer`)
**Purpose:** Find and hire real estate lawyers

**Features:**
- Lawyer directory
- Practice areas
- Experience and credentials
- Ratings and reviews
- Consultation booking
- Message lawyers
- Document sharing

**Lawyer Specializations:**
- Residential real estate
- Landlord-tenant disputes
- Property transactions
- Lease agreements
- Eviction defense

---

## 💬 Communication

### 14. Messenger (`/dashboard/chats`)
**Purpose:** Communicate with landlords, sellers, lawyers, and roommates

**Features:**
- Real-time messaging
- Conversation list
- Unread indicators
- Property context
- File sharing
- Message search
- Conversation history

**Conversation Types:**
- Landlord conversations (rental inquiries)
- Seller conversations (buying inquiries)
- Lawyer conversations (legal matters)
- Roommate conversations (matching)
- Co-ownership group chats

**Message Features:**
- Text messages
- File attachments
- Property links
- Viewing appointment scheduling
- Application status updates

---

## 🎓 Education Centre

### 15. Education Centre (`/dashboard/education-centre`)
**Purpose:** Learn about renting, buying, and property management

**Content Categories:**
- First-time renter guides
- First-time buyer guides
- Tenant rights
- Lease understanding
- Mortgage basics
- Co-ownership education
- Market insights
- Legal resources

**Content Types:**
- Articles
- Videos
- Infographics
- Checklists
- Templates
- Calculators

---

## ⚙️ Settings

### 16. Settings (`/dashboard/settings`)
**Purpose:** Manage account and preferences

**Sections:**

**Account Settings:**
- Email and password
- Phone number
- Two-factor authentication
- Account deletion

**Notification Preferences:**
- Email notifications
- SMS notifications
- Push notifications
- Notification frequency

**Privacy Settings:**
- Profile visibility
- Data sharing preferences
- Search visibility
- Broker access

**Preferences:**
- Language
- Currency
- Time zone
- Date format

---

## 🔧 Technical Details

### Authentication
- **Method:** Supabase Auth
- **Role:** `seeker`
- **Session:** JWT tokens
- **Protected Routes:** All dashboard routes require authentication

### Database Tables
- `user_profiles` - User information and role
- `seeker_profiles` - Extended seeker data
- `tenant_profiles` - Rental-specific data
- `mortgage_profiles` - Mortgage application data
- `co_ownership_profiles` - Co-ownership preferences
- `rental_applications` - Application tracking
- `property_documents` - Document storage metadata
- `conversations` - Messaging
- `messages` - Chat messages
- `viewing_appointments` - Scheduled viewings
- `document_access_requests` - Buyer document access

### Storage Buckets
- `tenant-documents` - Seeker uploaded documents
- `property-documents` - Property-related documents
- `property-images` - Property photos
- `mortgage-documents` - Mortgage application documents

### Key Services
- `propertyService.ts` - Property listings and operations
- `mortgageProfileService.ts` - Mortgage profile management
- `quickApplyService.ts` - Rental applications
- `viewingAppointmentService.ts` - Viewing scheduling
- `messagingService.ts` - Chat functionality
- `documentUploadService.ts` - Document handling
- `aiPropertyAssistantService.ts` - AI legal assistant

### External Integrations
- **Stripe** - Payment processing (PAD)
- **Google Gemini** - AI legal assistant
- **Supabase** - Backend, auth, storage, real-time

---

## 📊 User Journey Examples

### Rental Journey
1. Create profile → Complete seeker profile
2. Browse properties → Rental Options
3. Schedule viewing → Property details
4. Submit application → Quick Apply
5. Upload documents → My Applications
6. Track status → Application dashboard
7. Sign lease → Digital signing
8. Set up payments → Digital Wallet

### Buying Journey
1. Complete mortgage profile → Buying Opportunities
2. Get pre-qualified → Broker feedback
3. Browse properties → Buy Unit tab
4. Schedule viewing → Property details
5. Make offer → Offer modal
6. Assign lawyer → Lawyer assignment
7. Document review → Secure document room
8. Closing process → Closing progress tracker

### Co-ownership Journey
1. Create co-ownership profile → Co-ownership Profile
2. Signal interest → Co-ownership tab
3. Find partners → Co-buyer matching
4. Browse properties → Co-ownership listings
5. Join group chat → Messenger
6. Make joint offer → Offer process
7. Legal review → Lawyer consultation
8. Close deal → Closing process

---

## 🎨 Design System

### Color Scheme
- **Primary:** Purple/Indigo gradient
- **Secondary:** Pink/Purple gradient
- **Success:** Green
- **Warning:** Yellow/Orange
- **Error:** Red
- **Info:** Blue

### Typography
- **Headings:** Bold, gradient text
- **Body:** Regular weight, gray-900
- **Labels:** Medium weight, gray-700
- **Captions:** Small, gray-600

### Components
- **Cards:** Rounded corners, shadow, gradient borders
- **Buttons:** Gradient backgrounds, hover effects
- **Forms:** Clean inputs, validation states
- **Modals:** Centered, backdrop blur
- **Badges:** Status indicators, colored backgrounds

---

## 📱 Responsive Design

### Breakpoints
- **Mobile:** < 640px
- **Tablet:** 640px - 1024px
- **Desktop:** > 1024px

### Mobile Optimizations
- Collapsible sidebar
- Touch-friendly buttons
- Simplified navigation
- Optimized images
- Reduced animations

---

## 🔐 Security Features

### Data Protection
- Encrypted document storage
- Secure file uploads
- RLS (Row Level Security) policies
- Access logging
- Time-limited document access

### Privacy
- Profile visibility controls
- Data sharing preferences
- GDPR compliance
- Right to deletion
- Data export

---

## 📈 Analytics & Tracking

### User Events
- Page views
- Property views
- Application submissions
- Document uploads
- Message sends
- Viewing bookings

### Metrics
- Time on platform
- Application success rate
- Response times
- Feature usage
- Conversion rates

---

## 🚀 Future Enhancements

### Planned Features
- Virtual property tours
- AI roommate matching
- Automated lease generation
- Credit score monitoring
- Rent payment history export
- Property alerts
- Saved searches
- Price drop notifications

---

## 📞 Support

### Help Resources
- In-app help center
- Video tutorials
- FAQ section
- Live chat support
- Email support
- Phone support

### Contact
- Support email: support@roomieai.com
- Emergency line: 1-800-ROOMIE-AI
- Business hours: 9 AM - 6 PM EST

---

**Document Version:** 1.0  
**Last Review:** March 6, 2026  
**Next Review:** April 6, 2026
