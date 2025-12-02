# Client Portal Features

## Overview
This is a secure online client portal for debt collection management that allows clients to log in, view their cases, communicate with collectors, and manage their data.

## Implemented Features

### 1. Secure Authentication System
- **Login Page**: Professional login interface with email/password authentication
- **Demo Accounts**: Pre-configured demo users for testing:
  - Client 1: `layla@example.com` (Example Corp)
  - Client 2: `john@acmecorp.com` (ACME Corporation)
  - Admin: `admin@portal.com` (Portal Admin)
- **Session Management**: Persistent login using localStorage
- **Logout Functionality**: Secure logout that clears user session

### 2. Multi-Client Data Isolation
- **Client-Specific Data**: Each client sees only their own cases and messages
- **Secure Storage**: Data is stored per client ID, preventing cross-client access
- **Automatic Filtering**: All queries automatically filter by logged-in client

### 3. Case Management
- **View All Cases**: Complete list of debt collection cases with search and filter
- **Case Details**: Comprehensive case information including:
  - Case ID, status, and stage
  - Debtor information (name, contact details, address)
  - Client information
  - Financial details (principal, interest, fees, collected amount, balance)
  - Dates (opened, due, last activity, last payment)
  - Collector information
- **Status Tracking**: Visual status badges (New, Open, In Progress, On Hold, Closed, Paid)
- **Search & Filter**: Search by case ID, debtor name, or client name; filter by status

### 4. Two-Way Messaging System
- **Case-Specific Messages**: Send messages directly to collectors for each case
- **Message History**: View all messages with timestamps and author information
- **Persistent Messages**: Messages are linked to cases and preserved during data imports
- **Visual Distinction**: Client messages appear in green, collector messages in white

### 5. Dashboard & Analytics
- **Overview Statistics**:
  - Total Outstanding Amount
  - Total Collected Amount
  - Collection Rate percentage
  - Open Questions count
- **Visual Charts**:
  - Bar chart showing cases by status
  - Pie/donut chart showing status distribution
- **Recent Activity**:
  - Latest 5 cases
  - Latest 5 messages
- **Personalized Greeting**: Shows logged-in user's name

### 6. Data Import/Export
- **CSV/Excel Import**:
  - Supports both CSV and Excel (.xls, .xlsx) files
  - **Update Existing Cases**: Uses Case ID to update existing records
  - **Add New Cases**: Automatically adds cases not in the system
  - **Preserves Relationships**: Messages and history remain linked to cases
  - **Stable IDs**: Cases maintain their IDs across imports
- **CSV Export**:
  - Export all cases to CSV format
  - Export all messages to CSV format
  - Client-specific exports (only their data)

### 7. User Interface
- **Responsive Design**: Works on desktop and mobile devices
- **Modern Styling**: Clean, professional interface using Tailwind CSS
- **Dark Sidebar**: Professional sidebar with navigation and user info
- **Branded**: Sharkstack Portal branding maintained
- **Consistent Theme**: Emerald green accent color throughout

## Technical Implementation

### Data Structure
- **Cases**: Each case has a `clientId` field linking it to a specific client
- **Messages**: Messages reference cases via `caseId`
- **Users**: User accounts with role (client/admin), company info, and credentials

### Storage Strategy
- **LocalStorage**: Client-side persistence (can be replaced with backend API)
- **Versioned Keys**: Storage keys include version numbers (v2) for schema migration
- **Data Isolation**: Save/load functions filter by client ID
- **Merge Logic**: Import operations merge new data with existing records

### Import Logic
```
1. Parse CSV/Excel file
2. For each row:
   - Extract Case ID
   - Check if case exists for this client
   - If exists: Update fields with new data
   - If new: Create new case with client ID
   - Preserve all existing messages and relationships
3. Save merged data to storage
```

### Security Features
- Client data isolation at storage level
- Automatic filtering by authenticated user
- Session persistence with logout capability
- No cross-client data leakage

## How to Use

### For Clients
1. **Login**: Use your email and any password (demo mode)
2. **View Cases**: Navigate to "Cases" tab to see all your cases
3. **Check Details**: Click any case to see full details and messages
4. **Send Messages**: Use the message panel to communicate with collectors
5. **Import Data**: Click "Import from CRM" to upload CSV/Excel files
6. **Export Data**: Click "Export data" to download your cases as CSV
7. **Logout**: Click "Logout" in the sidebar when done

### For Administrators
- Admin accounts can see all cases across all clients (future enhancement)
- Can manage user accounts and permissions

## Data Import Format

The system accepts CSV/Excel files with these columns (flexible column naming):

**Required Fields:**
- Case ID / CaseId / ID
- Client Name / Client
- Debtor Name / Debtor

**Optional Fields:**
- Principal Amount / Principal
- Collected / Paid
- Status / Case Status
- Reference / CRM Case ID
- Customer Contact Name/Email/Address
- Debtor Contact Info (phone, email, address, city, state, zip, country)
- Dates (Creation Date, Due Date, Last Activity, Last Payment Date)
- Financial (Interest, Fees, Total Amount Due, Balance, Collection Rate)
- Workflow (Stage, Age, Collector, Next Action)

## Future Enhancements
- Backend API integration
- Real-time notifications
- Advanced reporting
- Email notifications
- Document attachments
- Payment processing integration
- Multi-language support
