# WhiteTools

WhiteTools is a suite of utility tools designed for managing alliances in "Whiteout Survival". It provides features for organizing server transfers and scheduling alliance events.

## Tech Stack

-   **Frontend**: [Vue 3](https://vuejs.org/) (Composition API)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **State Management**: [Pinia](https://pinia.vuejs.org/)
-   **Backend / Database**: [Supabase](https://supabase.com/)

## Features Overview

-   **Transfer Lists**: Organize and manage player transfers between alliances.
-   **Schedule Management**: Create and coordinate alliance event schedules.
-   **Global Password System**: Secure and simplified access control for alliances.

## Setup & Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/rafaeldiastd/whitetools.git
    cd whitetools
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Variables**:
    Create a `.env` file in the root directory and add your Supabase credentials:
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Run Development Server**:
    ```bash
    npm run dev
    ```

5.  **Build for Production**:
    ```bash
    npm run build
    ```

## Project Structure

-   `src/views`: Main application pages (Home, ListTransfer, Schedule).
-   `src/components`: Reusable UI components.
-   `src/stores`: Pinia stores for state management (auth, transfer, schedule).
-   `src/services`: API integrations (Supabase, WOS API).
