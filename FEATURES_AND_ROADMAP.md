# Features & Roadmap

## Current Features

### 1. Transfer List Management
A comprehensive tool for managing player transfers into the server/alliance.

-   **List Creation**: Admins can create transfer lists with specific requirements (Max Power, Max Labyrinth Level, Min Furnace Level).
-   **Alliance Invites**:
    -   Invite multiple alliances to a single transfer list.
    -   Set individual spot limits for each alliance.
-   **Global Security**:
    -   **Admin Key**: Full control over the list, including settings and limits.
    -   **Alliance Access Key**: A single, shared key for all alliance moderators to manage their invites.
-   **Moderation**:
    -   **Add Players**: Moderators can add players to any alliance in the list using the Global Key.
    -   **Edit Stats**: Moderators can update player Power and Labyrinth levels directly.
    -   **Remove Players**: Moderators can remove players from the list.
-   **Player Data**: Automatically fetches basic player info (Name, ID, Avatar) via external API.

### 2. Schedule Management
A tool for coordinating alliance events and timings.

-   **Event Scheduling**: Create schedules for Training, Construction, and Research.
-   **Slot Booking**: Automatic generation of time slots (e.g., 30-minute intervals).
-   **Secure Access**: Admin password protection for creating and managing schedules.

---

## Roadmap

### Phase 1: Enhanced Security & Audit (In Progress/Next Up)
-   [ ] **Audit Logs**: Track who added/removed/edited players (recording which key was used).
-   [ ] **Rate Limiting**: Prevent abuse of the "Add Player" API.

### Phase 2: User Experience & Localization
-   [ ] **Mobile Optimization**: Refine the UI for better usability on mobile devices (collapsible sidebars, touch-friendly inputs).
-   [ ] **Localization (i18n)**:
    -   Full support for Portuguese (PT-BR) and English (EN).
    -   Language switcher in the UI.

### Phase 3: Analytics & Advanced Features
-   [ ] **Transfer Stats Dashboard**: Visual analytics of incoming player power, average furnace levels, etc.
-   [ ] **Waitlists**: Allow players to join a waitlist if alliance spots are full.
-   [ ] **Export Data**: Export transfer lists to CSV/Excel for external reporting.

### Phase 4: Integration
-   [ ] **Discord Webhooks**: Notify a Discord channel when a new high-power player is added.
