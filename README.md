# LulPay Admin Panel

The LulPay Admin Panel is a comprehensive dashboard application for managing and monitoring payment transactions, user activities, and business operations for the LulPay payment processing platform.

## Overview

This admin panel provides administrators with powerful tools to manage, track, and analyze financial transactions, user activities, and system performance. With a modern, responsive interface built using React and Material UI, it offers intuitive navigation and rich data visualization.

## Features

### Dashboard

The dashboard provides a comprehensive overview of the payment platform's performance:

- **Transaction Summary Cards**: Quick view of key metrics including total transactions, transaction value, active users, and success rate.
- **Transaction Trends Chart**: Interactive line chart displaying transaction count and value over customizable time periods (7 days, 30 days, 90 days, 180 days, or 365 days).
- **User Activity Chart**: Multi-line chart showing new users, active users, and transaction counts over time.
- **Recent Transactions Table**: Paginated table of the most recent transactions with status indicators and action buttons.
- **Connection Status Indicators**: Visual indicators for API connection status and authentication status to help troubleshoot integration issues.

### Transactions

The transactions page provides detailed management of all payment transactions:

- **Transaction Metrics**: Cards displaying processing times, success rates, and reversal rates.
- **Advanced Filtering**: Search transactions by ID, sender, recipient, or other fields.
- **Filter Options**: Filter by transaction status, type, date range, and amount.
- **Transaction List**: Complete paginated list of transactions with detailed information including:
  - Transaction ID
  - Date and time
  - Sender and recipient details
  - Amount and currency
  - Status (with color-coded indicators)
  - Transaction type
- **Actions**: View transaction details, flag suspicious transactions, add notes, and export data.
- **Export Functionality**: Export transaction data as CSV for further analysis.

### Non-Wallet Transfers

This specialized section manages transfers not associated with wallet accounts:

- **Transfer Management**: View, create, and manage non-wallet transfers.
- **Detailed Search**: Search by ID, sender name, or recipient name.
- **Advanced Filters**: Filter by disbursement stage, transaction type, date range, and amount.
- **Transfer List**: Comprehensive list showing:
  - Transfer ID
  - Date and time
  - Type (e.g., bank transfer, cash pickup)
  - Sender and recipient information
  - Amount and fee
  - Status (with color indicators)
  - Disbursement stage
- **Modal Views**: Detailed modal windows for transfer details, creating new transfers, and sending SMS notifications.
- **Export Capability**: Export transfer data to CSV format.

### Reports

The reports section offers advanced data visualization and analysis tools:

- **Transaction Reports**:
  - Transaction Volume: Chart showing transaction counts over time
  - Transaction Success Rate: Visualization of success percentages
  - Transaction Type Distribution: Breakdown of transactions by type
  - Average Transaction Value: Trends in transaction amounts

- **User Reports**:
  - User Registrations: New user sign-up trends
  - Active Users: User activity patterns
  - User Retention: Cohort analysis of user retention
  - Geographic Distribution: Map visualization of user locations

- **Financial Reports**:
  - Transaction Value: Total monetary value of transactions over time
  - Fee Revenue: Income generated from transaction fees
  - Transaction Corridors: Analysis of money movement between regions

- **Report Customization**:
  - Date Range Selection: Analyze data from custom date ranges
  - Time Frame Selection: View data in daily, weekly, or monthly aggregations
  - Visualization Types: Toggle between line charts, bar charts, and other visualization types
  - Saved Configurations: Save and reuse report configurations

- **Export Options**: Export reports in CSV, Excel, or PDF formats

## User Interface Features

- **Responsive Design**: Optimized for desktop and mobile devices
- **Dark/Light Mode**: Visual theme options for different preferences
- **Interactive Charts**: Hover for details, zoom capabilities on charts
- **Real-time Notifications**: System alerts for important events
- **Intuitive Navigation**: Clear menu structure and breadcrumbs
- **Search and Filter**: Comprehensive search and filter capabilities throughout

## Technical Features

- **React Framework**: Built with modern React and TypeScript
- **Material UI Components**: Sleek, professional UI components
- **Recharts**: Interactive data visualization
- **React Query**: Efficient data fetching and caching
- **Responsive Layout**: Adapts to different screen sizes
- **API Integration**: Connects to backend services for data retrieval and operations

## Security Features

- **Authentication**: Secure login system with token-based authentication
- **Session Management**: Automatic session handling and token refresh
- **Role-based Access**: Different permission levels for different user roles
- **Activity Logging**: Tracking of administrator actions for audit purposes

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

3. Build for production:
   ```
   npm run build

   ```

## Technologies Used

- React
- TypeScript
- Material UI
- Recharts
- React Query
- Axios
- Date-fns
- Vite 
- Vite 