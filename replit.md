# Overview

XaviaBot is a Facebook Messenger chatbot built on Node.js that provides automated messaging, command handling, gaming features, and economy systems. The bot uses multiple Facebook Chat API implementations (FCA) to maintain persistent connections with Facebook Messenger. It supports plugin-based architecture for commands, events, and custom handlers, with multi-language support and configurable database options (JSON or MongoDB).

# Recent Changes (October 6, 2025)

## Fixed Console Errors
- ✅ **Removed canvas dependency** - Removed canvas from package.json due to build issues with Node.js 22. Canvas is already disabled in the code (`core/var/common.js`).
- ✅ **Created missing asset files** - Added empty JSON files for economy features:
  - `core/var/assets/hen_owners.json`
  - `core/var/assets/pet_owners.json`
  - `core/var/assets/plant_owners.json`
  - `core/var/assets/user_resorts.json`
- ✅ **Disabled AUTO_PING_SERVER** - Set to `false` in `config/config.main.json` to prevent 410 errors from defunct Glitch service.
- ✅ **Removed invalid appstate file** - Deleted corrupted `appstate.json`. Bot now requires valid Facebook credentials to run.

## System Dependencies
- Installed Python 3.11 and system packages (pkg-config, cairo, pango, libpng, etc.) for potential future use with canvas package.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Core Framework

**Plugin System**: The bot uses a modular plugin architecture organized into three categories:
- **Commands** (`plugins/commands/`) - User-invokable commands with prefix support
- **Events** (`plugins/events/`) - Handlers for Facebook events (subscribe, thread updates, nickname changes)
- **OnMessage** (`plugins/onMessage/`) - Passive message processors (AFK checking, level systems, mentions)

Commands support aliases, cooldowns, permission levels (0=member, 1=admin, 2=bot moderator), and multi-language responses through the `langData` structure.

## State Management

**Global State Object**: All runtime data is managed through a global object (`core/var/_global_info.js`) containing:
- Configuration maps for plugins and commands
- In-memory caches for user/thread data
- Module registry using Map structures
- Client state (cooldowns, replies, reactions)

**Data Controllers**: Abstraction layer (`core/var/controllers/`) provides CRUD operations for users and threads with automatic caching and 4-hour refresh intervals.

## Authentication & Session

**Facebook Authentication**: Uses multiple FCA libraries as fallbacks (`aryan-nix-fca`, `@xaviabot/fca-unofficial`, etc.) with appstate-based login stored in `appstate.json`. The appstate can be encrypted using AES with optional Replit DB storage for protection.

**Session Refresh**: Implements automatic session refresh mechanisms to maintain connection stability with configurable refresh intervals (default 12 hours).

## Data Persistence

**Dual Database Support**: 
- **JSON Mode** - File-based storage in `core/var/data/` with periodic saves (5-minute intervals)
- **MongoDB Mode** - Mongoose ODM with schema definitions in `core/var/models/`

Database selection is configured via `config.main.json`. The system maintains in-memory Maps synced with the persistent layer through update hooks.

## Message Processing Pipeline

**Event Flow**:
1. FCA listener receives raw Facebook event
2. Event logger processes based on LOG_LEVEL configuration
3. Database handler updates user/thread information
4. Event type router dispatches to appropriate handler
5. Permission checks validate user access
6. Command/event handler executes business logic
7. Response sent through API wrapper

**Anti-spam Protection**: Message counting system with configurable thresholds to detect and kick spammers automatically.

## Economy System

Implements virtual currency features:
- Balance tracking per user
- Daily claim rewards with 24-hour cooldowns
- Mini-games (color betting, harvest, hen farming)
- Banking system with loans and account management
- Leaderboard rankings

All monetary values use BigInt for precision and Decimal.js for calculations.

## Administration Features

**Permission Levels**:
- Level 0: Regular users
- Level 1: Group admins
- Level 2: Bot moderators (configured in MODERATORS array)
- Absolute: Highest privilege users (configured in ABSOLUTES array)

**Admin Commands**: System management, user/thread banning, message deletion, bot restart/shutdown, plugin reloading, broadcast notifications.

## Internationalization

**Multi-language Support**: 
- Language files loaded from plugin `langData` exports
- System language in `config.main.json` (default: en_US)
- Per-plugin language strings with template variable substitution
- Supported languages: English (en_US), Vietnamese (vi_VN), Arabic (ar_SY)

## Environment Detection

Runtime environment detection (`core/var/modules/environments.get.js`) adapts behavior for:
- Replit (DB integration, Node.js version handling)
- Glitch (watch.json configuration)
- GitHub Actions
- Local/VPS deployments

# External Dependencies

## Facebook Chat APIs
- **aryan-nix-fca**: Primary FCA implementation
- **@xaviabot/fca-unofficial**: Backup FCA library
- **chatbox-fca-remake**, **ryuu-fca-api**, **ws3-fca**: Alternative FCA implementations for resilience

## Database Services
- **MongoDB/Mongoose**: Optional NoSQL database for production deployments
- **@replit/database**: Key-value store for Replit hosting environment
- JSON file system for development/simple deployments

## Media Processing
- **canvas**: Image manipulation and generation
- **ffmpeg-static** + **fluent-ffmpeg**: Audio/video processing
- **ytdl-core**, **@distube/ytdl-core**: YouTube media downloading

## Web Framework
- **Express**: HTTP server for dashboard (port 25605)
- **cors**, **helmet**: Security middleware
- **express-rate-limit**: API rate limiting

## Utilities
- **axios**: HTTP client for external API calls
- **crypto-js**: Appstate encryption
- **moment-timezone**: Timezone-aware timestamps
- **node-cron**: Scheduled task execution
- **semver**: Version comparison for updates
- **chalk**: Terminal color output
- **js-yaml**: Configuration file parsing

## AI Integration
External AI APIs for command features:
- Gemini AI endpoint: `https://aryan-nix-apis.vercel.app/api/gemini`
- Custom AI endpoint: `https://aryan-nix-apis.vercel.app/api/aria`