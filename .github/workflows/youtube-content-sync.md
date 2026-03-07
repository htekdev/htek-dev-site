---
description: "Weekly sync of YouTube channel content for the htek.dev content dashboard"
on:
  schedule: weekly
  workflow_dispatch:
permissions:
  contents: read
  issues: read
  pull-requests: read
tools:
  github:
    toolsets: [default]
  web-fetch:
  cache-memory: true
mcp-servers:
  youtube:
    command: "npx"
    args: ["-y", "@htekdev/youtube-mcp-server"]
    env:
      YOUTUBE_API_KEY: ${{ secrets.YOUTUBE_API_KEY }}
  exa:
    command: "npx"
    args: ["-y", "exa-mcp-server"]
    env:
      EXA_API_KEY: ${{ secrets.EXA_API_KEY }}
safe-outputs:
  create-pull-request:
    title-prefix: "[videos] "
    labels: [videos, automation, youtube]
    draft: false
  noop:
strict: false
network:
  allowed:
    - defaults
    - node
    - github
    - "*.exa.ai"
    - "*.youtube.com"
    - "*.googleapis.com"
    - "*.ytimg.com"
    - "registry.npmjs.org"
---

# YouTube Content Sync — Dashboard Updater

You are an AI agent that fetches the latest YouTube content from the @htekdev channel, organizes it by topic, and updates the htek.dev content dashboard data file. You open a PR with the updated data.

## Channel Information

- **Channel ID**: UClQ3i2ynrWV5tZJ6mHbVjWQ
- **Channel Handle**: @htekdev
- **Uploads Playlist ID**: UUlQ3i2ynrWV5tZJ6mHbVjWQ

## Your Task

### 1. Fetch all channel videos

Use the YouTube MCP server tools to fetch ALL videos from the channel:

1. Call `youtube_channel_videos` with channelId `UClQ3i2ynrWV5tZJ6mHbVjWQ` and maxResults `50`
2. If there's a `nextPageToken`, use `youtube_playlist_items` with playlistId `UUlQ3i2ynrWV5tZJ6mHbVjWQ` and the page token to get remaining videos
3. Continue paginating until all videos are fetched

### 2. Get video statistics and durations

Call `youtube_video_list` with parts `["statistics", "contentDetails"]` for batches of up to 50 video IDs at a time. Record viewCount, likeCount, and duration (ISO 8601 format like PT1M30S) for each video. Parse the duration into seconds for the `durationSeconds` field and determine the `lengthCategory`:

- `short`: durationSeconds < 60
- `standard`: durationSeconds >= 60 and < 600
- `deep-dive`: durationSeconds >= 600

### 3. Categorize videos by topic

Analyze each video's title to assign it to exactly ONE topic. Use these categories:

| Topic ID | Title | Icon | Keywords to match |
|----------|-------|------|-------------------|
| agentic-devops | Agentic DevOps | 🛡️ | "Agentic DevOps", guardrails, shift-left for agents, CI/CD for agents, pillars of agentic devops |
| testing-quality | Testing & Quality | 🧪 | testing, test coverage, prompts for code quality, unit/integration/e2e tests, "specs" |
| ai-agents | AI Agents & Architecture | 🤖 | agent concepts, context engineering, sub-agents, agent harnesses, context window, agent control, team structure with AI |
| copilot-tools | GitHub Copilot & Tools | ⚡ | GitHub Copilot features, agentic workflows (GitHub product), memory system, custom agents, skills, Copilot CLI |
| content-creation | Content Creation & VidPipe | 🎬 | video editing, VidPipe, content studio, AI video tools, #shorts about video editing |
| architecture | Software Architecture | 🏗️ | domain-aligned, clean architecture, modular, push scripts, repo quality |
| career | Career & Journey | 🚀 | career path, personal journey, DevOps engineering career |
| azure-devops | Azure DevOps Streams | ☁️ | Azure DevOps Extension Development (legacy 2022 streams) |

Prioritize the first matching category when a video could fit multiple.

### 4. Determine badges

- **isNew**: Set to `true` if the video was published within the last 7 days from today
- **isTrending**: Calculate the average viewCount across ALL videos. Set to `true` if a video's viewCount is more than 2x the average

### 5. Cross-reference with articles

Read the file listing in `src/content/articles/` to find related articles. Map videos to articles based on topic alignment:

| Video Topic | Related Article Slug |
|-------------|---------------------|
| Agentic DevOps | /articles/agentic-devops-next-evolution-of-shift-left |
| Testing | /articles/tests-are-everything-agentic-ai |
| Agent hooks | /articles/agent-hooks-controlling-ai-codebase |
| Context engineering | /articles/context-engineering-key-to-ai-development |
| Agent harnesses | /articles/agent-harnesses-controlling-ai-agents-2026 |
| Custom agents | /articles/top-5-mistakes-creating-custom-github-copilot-agents |
| VidPipe | /articles/introducing-vidpipe-ai-video-pipeline |
| Architecture | /articles/agent-proof-architecture-agentic-devops |
| Agentic workflows | /articles/github-agentic-workflows-hands-on-guide |

Not every video needs a related article. Only set `relatedArticle` when there's a clear connection.

### 6. Build the JSON data file

Read the existing `src/data/youtube-videos.json` file. Update it with the new data while preserving the structure:

```json
{
  "channelId": "UClQ3i2ynrWV5tZJ6mHbVjWQ",
  "channelTitle": "htekdev",
  "channelUrl": "https://www.youtube.com/@htekdev",
  "lastUpdated": "<current ISO timestamp>",
  "stats": {
    "totalVideos": <count>,
    "totalViews": <sum of all viewCounts>,
    "subscribers": <from channel details>
  },
  "topics": [
    {
      "id": "topic-id",
      "title": "Topic Title",
      "description": "Short description",
      "icon": "emoji",
      "videos": [
        {
          "videoId": "...",
          "title": "...",
          "thumbnail": "https://i.ytimg.com/vi/.../mqdefault.jpg",
          "publishedAt": "...",
          "stats": { "viewCount": 0, "likeCount": 0 },
          "duration": "PT1M30S",
          "durationSeconds": 90,
          "lengthCategory": "standard",
          "isNew": false,
          "isTrending": false,
          "relatedArticle": "/articles/..." or null
        }
      ]
    }
  ]
}
```

Within each topic, sort videos by publishedAt descending (newest first).

### 7. Check for changes

Compare the updated data with the existing file. If there are no new videos and no significant stat changes (>10% view count change on any video), use the `noop` safe output with a message like "No significant YouTube content changes — skipping update."

### 8. Create the pull request

If there are changes, write the updated JSON to `src/data/youtube-videos.json` and create a non-draft PR via the `create-pull-request` safe output. The PR title should indicate what changed (e.g., "Update YouTube dashboard: 3 new videos, stats refresh").

## Guidelines

- Always fetch ALL videos — don't stop at the first page
- Use cache-memory to store the last run's video count and total views for comparison
- The JSON must be valid and properly formatted
- Topic order: agentic-devops, testing-quality, ai-agents, copilot-tools, content-creation, architecture, career, azure-devops
- Do NOT create the PR if nothing meaningful changed
- Use `youtube_channel_details` with handle `@htekdev` to get the latest subscriber count
