# GitHub Stars Manager ⭐

A beautiful, modern web application to manage, filter, and organize your GitHub starred repositories. Built with vanilla JavaScript, Tailwind CSS, and powered by GitHub Actions for automated syncing.

![GitHub Stars Manager](https://img.shields.io/badge/Built%20with-Tailwind%20CSS-38bdf8?style=for-the-badge&logo=tailwind-css&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/Automated%20with-GitHub%20Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)

## 🌐 Live Demo

**[View Live Demo](https://nicolasbagatello.github.io/github-star-list/)** ← Replace `nicolasbagatello` with your GitHub username

After setup, your site will be available at:
```
https://YOUR_USERNAME.github.io/github-star-list/
```

## ✨ Features

- **🔄 Automated Sync**: Syncs your starred repos every 12 hours via GitHub Actions
- **🔍 Advanced Filtering**: Search, filter by language, topics, and custom tags
- **🏷️ Custom Tags**: Add your own tags to organize repositories
- **📝 Personal Notes**: Add notes to remember why you starred each repo
- **🗄️ Supabase Integration**: Optional cloud database for cross-device sync
- **🎨 Modern UI**: Clean, Square UI-inspired design with Tailwind CSS
- **🌙 Dark Mode**: Automatic dark mode support
- **📱 Responsive**: Works perfectly on desktop, tablet, and mobile
- **🔐 Secure**: GitHub token stored as secret, never exposed to browser
- **⚡ Fast**: Static site hosted on GitHub Pages with instant loading
- **📦 Export/Import**: Backup your custom tags and notes

## 🚀 Quick Start

### 1. Fork or Clone this Repository

**Option A: Fork on GitHub** (Recommended)
1. Click the "Fork" button at the top right of this repository
2. Clone your fork:
```bash
git clone https://github.com/YOUR_USERNAME/github-star-list.git
cd github-star-list
```

**Option B: Use as Template**
1. Click "Use this template" → "Create a new repository"
2. Clone your new repository

**Option C: Clone Original** (for reference/testing)
```bash
git clone https://github.com/nicolasbagatello/github-star-list.git
cd github-star-list
```

### 2. Create a GitHub Personal Access Token

1. Go to [GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Give it a descriptive name (e.g., "GitHub Stars Sync")
4. Select the following scope:
   - ✅ `read:user` (to read your starred repositories)
5. Click "Generate token"
6. **Copy the token immediately** (you won't be able to see it again)

### 3. Add the Token as a GitHub Secret

1. Go to your repository's **Settings** → **Secrets and variables** → **Actions**
2. Click "New repository secret"
3. Name: `GH_PAT`
4. Value: Paste your Personal Access Token
5. Click "Add secret"

### 4. Enable GitHub Pages

1. Go to your repository's **Settings** → **Pages**
2. Under "Source", select `main` branch
3. Click "Save"
4. Your site will be available at: `https://YOUR_USERNAME.github.io/github-star-list`

### 5. Run the Sync Workflow

1. Go to the **Actions** tab in your repository
2. Click on "Sync GitHub Stars" workflow
3. Click "Run workflow" → "Run workflow"
4. Wait for the workflow to complete (usually 10-30 seconds)
5. Visit your GitHub Pages URL to see your starred repos!

## 🗄️ Supabase Integration (Optional)

**By default, this app uses localStorage** (private, device-specific storage). For cross-device synchronization, you can optionally enable Supabase integration.

⚠️ **Security Note**: Supabase integration is currently configured for public access (no authentication). This means anyone who visits your GitHub Pages site could potentially add/edit/delete data in your database. For most personal use cases, we recommend keeping **localStorage mode** (default) for complete privacy.

### Benefits of Supabase

- **Cross-device sync**: Access your tags and notes from any device
- **Backup**: Your data is stored in a database, not just your browser
- **Sharing**: Potential for future features like sharing tags with others

### Trade-offs

- ✅ **localStorage (default)**: 100% private, no one can access your data
- ⚠️ **Supabase**: Cross-device sync, but database is publicly accessible (anyone can modify)

### Setup Instructions

#### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in the details:
   - **Name**: `github-stars` (or any name you prefer)
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to you
4. Click "Create new project" and wait ~2 minutes for setup

#### 2. Create Database Tables

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy and paste this SQL:

```sql
-- Create custom_tags table
CREATE TABLE custom_tags (
  id BIGSERIAL PRIMARY KEY,
  repo_id BIGINT NOT NULL,
  tag TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(repo_id, tag)
);

-- Create notes table
CREATE TABLE notes (
  repo_id BIGINT PRIMARY KEY,
  content TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_tags_repo ON custom_tags(repo_id);
CREATE INDEX idx_tags_tag ON custom_tags(tag);

-- Enable Row Level Security (RLS)
ALTER TABLE custom_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all access (public read/write)
-- Note: For a production app, you'd want proper authentication
CREATE POLICY "Allow all access to custom_tags" ON custom_tags
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to notes" ON notes
  FOR ALL USING (true) WITH CHECK (true);
```

4. Click "Run" to execute the SQL

#### 3. Get Your Supabase Credentials

1. Go to **Settings** → **API** in your Supabase dashboard
2. Find these values:
   - **Project URL**: Copy the URL (e.g., `https://xxxxx.supabase.co`)
   - **anon public key**: Copy the key (starts with `eyJ...`)

#### 4. Enable Supabase Feature Flag

1. Open `js/utils/constants.js` in your project
2. Change the feature flag to `true`:

```javascript
export const FEATURES = {
  USE_SUPABASE: true  // Change from false to true
};
```

3. Verify your Supabase credentials are correct (they should already be set):

```javascript
export const SUPABASE_URL = 'https://quhkbwfxighmvtkdgpjv.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJ...'; // Your actual key
```

4. Commit and push the changes:

```bash
git add js/utils/constants.js
git commit -m "Enable Supabase integration"
git push
```

#### 5. Migrate Existing Data (Optional)

If you already have custom tags and notes in localStorage:

1. Visit your GitHub Pages site
2. Click the "Migrate to Supabase" button in the header (only visible when Supabase is enabled)
3. Confirm the migration
4. Wait for the success message

Your data is now synced to Supabase and will work across all devices!

### Disabling Supabase

To switch back to localStorage-only mode (recommended for privacy):

1. Open `js/utils/constants.js`
2. Set the feature flag to `false`:
```javascript
export const FEATURES = {
  USE_SUPABASE: false  // Disable Supabase, use localStorage only
};
```
3. Commit and push:
```bash
git add js/utils/constants.js
git commit -m "Disable Supabase, use localStorage only"
git push
```

The app will automatically fall back to localStorage. Your Supabase credentials remain in the file (commented) for easy re-enabling later.

## 📖 How It Works

### Architecture

```
┌─────────────────────────────────────────────┐
│     GitHub Actions Workflow (Scheduled)     │
│      Runs every 12 hours (2x per day)      │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│     Fetch Starred Repos via GitHub API      │
│     (using PAT from GitHub Secrets)         │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│     Merge with existing data/stars.json     │
│     (preserves structure, updates metadata) │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│     Commit updated JSON to repository       │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│        GitHub Pages auto-deploys            │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│     Browser loads stars.json + localStorage │
│     (GitHub data + custom tags/notes)       │
└─────────────────────────────────────────────┘
```

### Data Storage

- **GitHub-sourced data** (repo name, description, stars, topics, etc.): Stored in `data/stars.json`, automatically updated by GitHub Actions workflow
- **User-added data** (custom tags, notes):
  - **Default**: Stored in browser's localStorage (device-specific)
  - **With Supabase** (optional): Stored in Supabase database (synced across devices)
- **Display**: Both sources are merged at runtime for a complete view

## 🎯 Usage

### Viewing and Filtering

- **Search**: Use the search bar to find repos by name, description, or owner
- **Filter by Language**: Select a programming language from the dropdown
- **Filter by Topics**: Click on any topic badge to filter
- **Sort**: Choose from multiple sorting options (stars, name, date updated)
- **Custom Tags**: Filter by your own custom tags (coming soon in filters UI)

### Adding Custom Tags

1. Find a repository card
2. Scroll to the "Custom Tags" section
3. Click in the input field and type your tag
4. Press Enter to add the tag
5. Tags are saved automatically to your browser

### Adding Notes

1. Find a repository card
2. Scroll to the "Notes" section
3. Type your notes in the text area
4. Notes are auto-saved after 1 second

### Exporting Custom Data

1. Click the "Export Data" button in the header
2. A JSON file will download with all your custom tags and notes
3. Keep this file as a backup!

### Manual Sync

The workflow runs automatically every 12 hours (at 00:00 and 12:00 UTC), but you can trigger it manually:

1. Go to the **Actions** tab
2. Select "Sync GitHub Stars"
3. Click "Run workflow"

## 🛠️ Configuration

### Changing the Sync Schedule

Edit `.github/workflows/sync-stars.yml` and change the cron expression:

```yaml
on:
  schedule:
    - cron: '0 */12 * * *'  # Every 12 hours
```

Cron format: `minute hour day month weekday`

Examples:
- Every 6 hours: `0 */6 * * *`
- Every 12 hours: `0 */12 * * *`
- Daily at specific time: `0 2 * * *`

### Customizing the Username

Edit `js/utils/constants.js` and update:

```javascript
export const CONFIG = {
  REPO_OWNER: 'YOUR_USERNAME',
  REPO_NAME: 'github-star-list',
  USERNAME: 'YOUR_USERNAME',
  // ...
};
```

Also update `.github/workflows/sync-stars.yml`:

```yaml
env:
  GITHUB_USERNAME: YOUR_USERNAME
```

### Styling and Theming

- **Colors**: Edit `css/custom.css` to change the color palette
- **Tailwind Config**: Modify the inline config in `index.html`
- **Dark Mode**: Automatically follows system preferences, toggle in header

## 🔧 Development

### Local Development

1. Clone the repository
2. Open `index.html` in a modern browser
3. For local testing, you can use a simple HTTP server:

```bash
# Python 3
python -m http.server 8000

# Node.js
npx http-server

# PHP
php -S localhost:8000
```

4. Visit `http://localhost:8000`

### Project Structure

```
github-star-list/
├── index.html              # Main application page
├── .github/workflows/
│   └── sync-stars.yml     # GitHub Actions workflow
├── data/
│   └── stars.json         # Starred repositories data
├── css/
│   └── custom.css         # Custom styles
├── js/
│   ├── app.js             # Application entry point
│   ├── services/
│   │   ├── storage.js     # Data loading and utilities
│   │   ├── customData.js  # Custom data management (localStorage/Supabase)
│   │   └── supabase.js    # Supabase database operations
│   ├── ui/
│   │   ├── components.js  # Reusable UI components
│   │   ├── cards.js       # Repository cards
│   │   └── filters.js     # Filtering and search
│   └── utils/
│       └── constants.js   # Configuration and constants
└── README.md              # This file
```

### Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Styling**: Tailwind CSS (via CDN), custom CSS
- **Automation**: GitHub Actions
- **Hosting**: GitHub Pages
- **Data Storage**: JSON file + localStorage/Supabase (optional)

## 📝 API Rate Limits

- **GitHub API**: 5,000 requests/hour (authenticated with PAT)
- **Workflow**: Fetches all stars in one run (uses ~1-3 requests for pagination)
- **Twice-daily sync**: Well within rate limits

## 📄 License

MIT License - feel free to use this project for your own starred repos!

## 🙏 Acknowledgments

- Design inspired by [Square UI](https://github.com/ln-dev7/square-ui)
- Built with [Tailwind CSS](https://tailwindcss.com/)
- Powered by [GitHub Actions](https://github.com/features/actions)

## 🐛 Troubleshooting

### Workflow fails with "Error: API returned 401"

- Your PAT might have expired or been revoked
- Regenerate the token and update the `GH_PAT` secret

### Workflow fails with "Error: API returned 403"

- Check if you've hit the API rate limit
- Wait an hour and try again
- Ensure your token has the `read:user` scope

### Site shows "No repositories found"

- Check if the workflow has run successfully
- Go to Actions tab and verify the workflow completed
- Check if `data/stars.json` has been updated in the repository

### Custom tags/notes disappeared

- Custom data is stored in browser localStorage
- If you cleared browser data, it's gone (that's why export is important!)
- Import your exported JSON file to restore

### Dark mode doesn't work

- Clear your browser cache
- Check browser console for errors
- Verify localStorage is enabled in your browser

### Supabase connection fails

- Verify your `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `constants.js` are correct
- Make sure you copied the **anon public** key (starts with `eyJ...`)
- Check browser console for specific error messages
- Verify the database tables were created successfully (check SQL Editor)
- Ensure Row Level Security policies are set up correctly

### Migration button doesn't appear

- Make sure you've pushed the latest code with Supabase integration
- Clear browser cache and refresh the page
- If you don't want Supabase, you can ignore this feature

## 📧 Contact

If you have questions or need help, please open an issue on GitHub!

---

Made with ❤️ and ☕ by Nicolas Bagatello
