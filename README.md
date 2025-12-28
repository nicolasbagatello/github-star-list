# GitHub Stars Manager ⭐

A beautiful, modern web application to manage, filter, and organize your GitHub starred repositories. Built with vanilla JavaScript, Tailwind CSS, and powered by GitHub Actions for automated syncing.

![GitHub Stars Manager](https://img.shields.io/badge/Built%20with-Tailwind%20CSS-38bdf8?style=for-the-badge&logo=tailwind-css&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/Automated%20with-GitHub%20Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)

## ✨ Features

- **🔄 Automated Sync**: Daily automatic syncing of your starred repos via GitHub Actions
- **🔍 Advanced Filtering**: Search, filter by language, topics, and custom tags
- **🏷️ Custom Tags**: Add your own tags to organize repositories
- **📝 Personal Notes**: Add notes to remember why you starred each repo
- **🎨 Modern UI**: Clean, Square UI-inspired design with Tailwind CSS
- **🌙 Dark Mode**: Automatic dark mode support
- **📱 Responsive**: Works perfectly on desktop, tablet, and mobile
- **🔐 Secure**: GitHub token stored as secret, never exposed to browser
- **⚡ Fast**: Static site hosted on GitHub Pages with instant loading
- **📦 Export/Import**: Backup your custom tags and notes

## 🚀 Quick Start

### 1. Fork or Clone this Repository

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

## 📖 How It Works

### Architecture

```
┌─────────────────────────────────────────────┐
│     GitHub Actions Workflow (Scheduled)     │
│         Runs daily at 2 AM UTC              │
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
- **User-added data** (custom tags, notes): Stored in browser's localStorage, never leaves your device
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

The workflow runs automatically every day at 2 AM UTC, but you can trigger it manually:

1. Go to the **Actions** tab
2. Select "Sync GitHub Stars"
3. Click "Run workflow"

## 🛠️ Configuration

### Changing the Sync Schedule

Edit `.github/workflows/sync-stars.yml` and change the cron expression:

```yaml
on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC
```

Cron format: `minute hour day month weekday`

Examples:
- Every 6 hours: `0 */6 * * *`
- Every Monday: `0 0 * * 1`
- Twice daily: `0 0,12 * * *`

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
│   │   └── customData.js  # localStorage management
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
- **Data Storage**: JSON file + localStorage

## 📝 API Rate Limits

- **GitHub API**: 5,000 requests/hour (authenticated with PAT)
- **Workflow**: Fetches all stars in one run (uses ~1-3 requests for pagination)
- **Daily sync**: Well within rate limits

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

## 📧 Contact

If you have questions or need help, please open an issue on GitHub!

---

Made with ❤️ and ☕ by Nicolas Bagatello
