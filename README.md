<h1>
  <img src="https://raw.githubusercontent.com/yohimik/crier/v1.1.1/assets/logo.svg" alt="Crier logo" height="80" align="right">
  @dispat/crier
  <br clear="all">
</h1>

**Turn HTML templates and release notes into images, carousels, and videos. Publish them to fourteen social platforms from one command.**

`@dispat/crier` installs the native [Crier](https://github.com/yohimik/crier) Go CLI through npm and exposes the `crier` command. Use it for Instagram and Facebook posts, release announcements, LinkedIn carousels, Discord updates, Telegram albums, story cards, and music-backed videos. Images render in a pure-Go HTML/CSS engine: no Go installation, Chromium, or browser service is required.

```sh
npm install --global @dispat/crier --allow-scripts=@dispat/crier
crier render      # Save the images locally.
crier --dry-run   # Preview what each configured platform would receive.
crier publish    # Render and publish to the enabled destinations.
```

Run these commands in a directory with a Crier configuration, template, and data. The [quickstart](#quickstart-your-first-image) below creates all three. **Running `crier` without a subcommand also publishes.**

[Install](#install) · [Examples](#rendered-examples) · [Changelog images](#turn-a-changelog-into-images) · [Dispat setup](#automate-announcements-with-dispat) · [Platforms](#supported-publishing-platforms) · [Pagination](#pagination-and-carousels) · [Text overflow](#text-overflow-and-ellipsis) · [Video and music](#video-gifs-and-music) · [Tunnels](#public-media-urls-staging-and-tunneling)

## Rendered examples

These are actual Crier renders, copied from the main repository. The image URLs below use the pinned upstream release so the npm README can display them before this wrapper repository is published. The same image files are included in [docs/images](./docs/images/README.md), with their original paths.

| Preview | Example and source | What it demonstrates |
| --- | --- | --- |
| <img src="https://raw.githubusercontent.com/yohimik/crier/v1.1.1/examples/release-changelog/preview.png" width="220" alt="Green terminal-style release changelog card"> | [Release changelog](https://github.com/yohimik/crier/tree/v1.1.1/examples/release-changelog) | Release version, features, fixes, breaking changes, and multi-line ellipsis. |
| <img src="https://raw.githubusercontent.com/yohimik/crier/v1.1.1/examples/business-promo/preview.png" width="220" alt="Square business promotion card"> | [Business promotion](https://github.com/yohimik/crier/tree/v1.1.1/examples/business-promo) | Bundled Poppins font, gradients, caption templates, and a clamped description. |
| <img src="https://raw.githubusercontent.com/yohimik/crier/v1.1.1/examples/video-game-release/preview.png" width="220" alt="Landscape video game release announcement"> | [Game release](https://github.com/yohimik/crier/tree/v1.1.1/examples/video-game-release) | A landscape announcement with a separate story overlay. |
| <img src="https://raw.githubusercontent.com/yohimik/crier/v1.1.1/examples/video-game-release/preview-story.png" width="124" alt="Vertical version of the game release announcement"> | [Story overlay](https://github.com/yohimik/crier/blob/v1.1.1/examples/video-game-release/story-overlay.html) | The same data and base layout adapted to a vertical story. |
| <img src="https://raw.githubusercontent.com/yohimik/crier/v1.1.1/examples/social-quote/preview.png" width="220" alt="Social quotation card with serif typography"> | [Social quote](https://github.com/yohimik/crier/tree/v1.1.1/examples/social-quote) | A template pool, seeded layout selection, serif typography, and alt text. |
| <img src="https://raw.githubusercontent.com/yohimik/crier/v1.1.1/examples/event-invite/preview.png" width="124" alt="Vertical event invitation"> | [Event invitation](https://github.com/yohimik/crier/tree/v1.1.1/examples/event-invite) | A 1080 × 1920 layout for event and story announcements. |
| <img src="https://raw.githubusercontent.com/yohimik/crier/v1.1.1/examples/custom-platform/preview.png" width="220" alt="Custom publishing platform announcement card"> | [Custom platform](https://github.com/yohimik/crier/tree/v1.1.1/examples/custom-platform) | A shell command as a publisher, with the same rendering and caption flow. |

To reproduce an upstream example, clone the main repository and run its configuration. Keep the example's adjacent data, overlays, and `examples/fonts` directory together; the bundled fonts carry their own licenses.

```sh
git clone https://github.com/yohimik/crier.git
cd crier
git checkout v1.1.1
crier render --config examples/release-changelog/crier.yaml
```

## Install

### npm

```sh
# Global command
npm install --global @dispat/crier --allow-scripts=@dispat/crier
crier --version

# Project development dependency
npm install --save-dev @dispat/crier
npm exec -- crier --help
```

### pnpm and Yarn

```sh
pnpm add --save-dev @dispat/crier
pnpm exec crier --help

# Yarn with its node_modules linker
yarn add --dev @dispat/crier
yarn crier --help
```

Approve the package's install script according to your package manager's policy. If scripts are disabled, use the [explicit repair command](#installation-scripts-and-repair). Yarn Plug'n'Play is not verified for this distribution.

### Runtime and operating systems

| Requirement | Support |
| --- | --- |
| Node.js | `^20.17.0 || >=22.9.0` |
| macOS | x64 and ARM64 |
| Linux | x64 and ARM64 |
| Windows | x64 and ARM64 |
| Still images | Native renderer included; no browser or Go installation needed |
| MP4, animated GIF, or music-backed cover story | FFmpeg installed separately |
| A public tunnel | The selected tunnel program installed and configured separately |

Installation downloads the exact native release from GitHub, verifies its byte size and SHA-256 digest, runs its version check, and only then installs it. This package uses the six standard Go release assets.

**npm package `1.1.0` wraps native Crier `1.1.1`.** Their patches can differ within the same major/minor line. `npm ls @dispat/crier` reports the npm version; `crier --version` reports the native version. The features and platform behavior documented here describe that native release.

## Quickstart: your first image

Create a directory containing these three files. Rendering this example needs no credentials and sends no posts.

**`template.html`**

```html
<!doctype html>
<html><head><style>
  html, body { height: 100%; margin: 0 }
  body { font-family: "Go", sans-serif }
  .card {
    width: 100%; height: 100%; box-sizing: border-box; padding: 88px;
    background: linear-gradient(150deg, #11243b, #4b326c); color: #fff;
  }
  h1 { font-size: 84px; margin: 0; overflow-wrap: break-word }
  p { font-size: 38px; line-height: 1.5; opacity: .85 }
</style></head><body><div class="card">
  <h1>{{ .title }}</h1>
  <p>{{ .subtitle }}</p>
</div></body></html>
```

**`data.yaml`**

```yaml
title: We just shipped 1.1
subtitle: A release announcement rendered from HTML, ready for your feed.
```

**`crier.yaml`**

```yaml
render:
  template: template.html
  data: data.yaml
  width: 1080
  height: 1080
  format: png
  output: card.png
  hermetic-fonts: true
publish:
  caption: "{{ .title }} — {{ .subtitle }}"
```

```sh
crier render
# Writes card.png.
```

For a generated starting configuration, use `crier init`; `crier init --full` writes every option. You still supply the template and data files.

### Add a publishing destination

Add a Telegram destination to the existing `publish` section:

```yaml
publish:
  caption: "{{ .title }} — {{ .subtitle }}"
  telegram:
    enabled: true
    chat-id: "@my_channel"
```

Then supply the bot token through the environment:

```sh
export CRIER_PUBLISH_TELEGRAM_TOKEN='your-bot-token'
crier ping        # Read-only credential checks; nothing posted.
crier --dry-run   # Render and inspect the planned publication.
crier publish    # Send the real post.
```

Crier finds its configuration by walking up from the working directory. Paths in configuration files are relative to those files. Settings apply in order: file, environment, flags. For example, `CRIER_RENDER_WIDTH=1200` or `--render-width 1200` overrides `render.width`. Use `crier config` to inspect the resolved configuration with secrets redacted.

## Supported publishing platforms

All fourteen publishers below are built into Crier 1.1.1. The table describes this implementation's media support; an enabled destination also needs its account credentials and any required API permissions.

| Platform | Images | MP4 | Animated GIF | Setup and behavior |
| --- | --- | --- | --- | --- |
| [Instagram](https://github.com/yohimik/crier/blob/v1.1.1/docs/publishing/instagram.md) | Yes | Yes | No | Feed posts, photo carousels, reels, stories, and optional music-backed cover stories. Requires public media URLs. Still images are encoded as JPEG automatically. |
| [Facebook](https://github.com/yohimik/crier/blob/v1.1.1/docs/publishing/facebook.md) | Yes | Yes | No | Facebook Page posts and stories; Page ID and Page access token. Direct uploads or optional URL staging. |
| [TikTok](https://github.com/yohimik/crier/blob/v1.1.1/docs/publishing/tiktok.md) | Yes | Yes | No | Photos use public URLs; videos can upload directly. Photo posts can request recommended music. |
| [Telegram](https://github.com/yohimik/crier/blob/v1.1.1/docs/publishing/telegram.md) | Yes | Yes | Yes | Bot token and chat ID; albums, video, animation, and a separate audio message. |
| [X / Twitter](https://github.com/yohimik/crier/blob/v1.1.1/docs/publishing/x.md) | Yes | Yes | Yes | Media upload followed by a post; configured X API credentials. |
| [Mastodon](https://github.com/yohimik/crier/blob/v1.1.1/docs/publishing/mastodon.md) | Yes | Yes | Yes | Instance URL and access token. |
| [Discord](https://github.com/yohimik/crier/blob/v1.1.1/docs/publishing/discord.md) | Yes | Yes | Yes | Incoming webhook; multiple attachments and optional music file. `@everyone` requires explicit mention permission in the config. |
| [LinkedIn](https://github.com/yohimik/crier/blob/v1.1.1/docs/publishing/linkedin.md) | Yes | Yes | No | Access token and author URN; multi-image posts or video. |
| [Reddit](https://github.com/yohimik/crier/blob/v1.1.1/docs/publishing/reddit.md) | Yes | Yes | Yes | Configured Reddit credentials and User-Agent. Crier sends one page per post rather than an undocumented gallery flow. |
| [Slack](https://github.com/yohimik/crier/blob/v1.1.1/docs/publishing/slack.md) | Yes | Yes | Yes | Bot token and channel; file uploads and optional audio attachment. |
| [VK](https://github.com/yohimik/crier/blob/v1.1.1/docs/publishing/vk.md) | Yes | Yes | Yes | Access token and wall owner ID. |
| [Threads](https://github.com/yohimik/crier/blob/v1.1.1/docs/publishing/threads.md) | Yes | Yes | No | Threads token and public media URLs; supports carousels. |
| [YouTube](https://github.com/yohimik/crier/blob/v1.1.1/docs/publishing/youtube.md) | No | Yes | No | Video uploads; still images must first become a video. |
| [Boosty](https://github.com/yohimik/crier/blob/v1.1.1/docs/publishing/boosty.md) | Yes | No | No | Image posts through the implementation's unofficial API integration. |

A [custom publisher](https://github.com/yohimik/crier/blob/v1.1.1/docs/publishing/custom.md) can run your shell command or webhook script. Use `crier platforms` to see which destinations are enabled, configured, and need a public URL.

### Cross-post the same card

Merge the following destinations into the quickstart's `publish` block. Telegram, Discord, and Facebook in this example accept uploads directly, so no tunnel is needed.

```yaml
publish:
  caption: "{{ .title }} — {{ .subtitle }}"
  telegram:
    enabled: true
    chat-id: "@my_channel"
  discord:
    enabled: true
    caption: "New release: {{ .title }}"
  facebook:
    enabled: true
    page-id: "your-facebook-page-id"
```

```sh
export CRIER_PUBLISH_TELEGRAM_TOKEN='your-bot-token'
export CRIER_PUBLISH_DISCORD_WEBHOOK_URL='your-incoming-webhook-url'
export CRIER_PUBLISH_FACEBOOK_TOKEN='your-page-access-token'
crier ping
crier publish --dry-run --json
# After reviewing the output:
crier publish
```

Per-platform captions override the shared caption. Captions also receive `.Platform`, `.Post`, `.Posts`, `.Page`, and `.Pages`. Platforms can publish concurrently; multiple posts for one platform are sent in sequence. A failure at one destination does not cancel the other destinations. Inspect the report before replaying a partially successful announcement.

## Turn a changelog into images

Crier draws the notes you provide. Your release tool generates the changelog and chooses the version. For a complete local example, see [examples/changelog](./examples/changelog/): it includes a configuration, a paginated template, sample release data, and a small Git-to-JSON adapter.

From this wrapper repository:

```sh
crier render --config examples/changelog/crier.yaml
```

The supplied example produces a cover and notes pages as `examples/changelog/release-1.png`, `release-2.png`, and so on.

### Structured release data

The example template accepts this shape:

```json
{
  "package": "my-app",
  "version": "1.1.0",
  "summary": "A faster release, with fewer manual steps.",
  "sections": [
    { "label": "Features", "items": ["Generate announcement cards", "Publish to multiple destinations"] },
    { "label": "Fixes", "items": ["Wrap long release-note entries"] }
  ]
}
```

It renders the entries with ordinary template loops:

```html
{{ range .sections }}
<section>
  <h2>{{ .label }}</h2>
  <ul>{{ range .items }}<li>{{ . }}</li>{{ end }}</ul>
</section>
{{ end }}
```

Use a YAML or JSON file for arrays and nested objects. To pipe data directly from your release tooling, pass `--render-data -`; JSON is also accepted on stdin.

```sh
node make-release-data.mjs | crier render --config announce/crier.yaml --render-data -
```

### Generate a simple changelog from Git

Copy [examples/changelog](./examples/changelog/) to `announce/` inside the repository you want to announce, then run from that repository's root:

```sh
node announce/from-git.mjs v1.0.0 HEAD 1.1.0 my-app |
  crier render --config announce/crier.yaml --render-data -
```

The adapter groups `feat:` subjects as Features, `fix:` subjects as Fixes, and other subjects as Other. A conventional-commit `!` or a `BREAKING CHANGE:` / `BREAKING-CHANGE:` body marker puts the entry under Breaking. It uses JSON serialization, so quotes and multi-line commit bodies cannot break YAML interpolation. It does not calculate semantic versions, resolve monorepo dependencies, or replace a release manager. Supply the intended Git range and release version yourself, or use the Dispat integration below.

### Fit the notes to the job

Use a short, fixed-size summary card with line clamps when intentional truncation is acceptable. Use flowing pages when every release-note entry must appear. Crier's own announcement previews show the cover-plus-changelog pattern:

<img src="https://raw.githubusercontent.com/yohimik/crier/v1.1.1/announce/preview-1.png" width="310" alt="Crier release announcement cover"> <img src="https://raw.githubusercontent.com/yohimik/crier/v1.1.1/announce/preview-2.png" width="310" alt="Crier release changelog page">

The [local copies](./docs/images/README.md) are included alongside the wrapper. For the complete upstream design and release scripts, see [Crier's announce directory](https://github.com/yohimik/crier/tree/v1.1.1/announce).

## Automate announcements with Dispat

This follows the setup used by [services/dispat/announce](https://github.com/yohimik/dispat/tree/main/services/dispat/announce): one command in the package's `announce` stage, separate stable and release-candidate configurations, shared publishing destinations, and release data read directly from the stage environment. **No intermediate changelog script is needed for this route.**

Copy [examples/dispat/announce](./examples/dispat/announce/) into the package you release. The [example dispat.yaml](./examples/dispat/dispat.yaml) contains the entries to merge into that package's existing release configuration.

```text
services/my-app/
  dispat.yaml
  announce/
    publish.yaml
    stable/
      crier.yaml
      template.html
    rc/
      crier.yaml
      template.html
      notes.yaml
```

### 1. Connect the announce stage

Ensure `dispat` and `crier` are on the release job's `PATH`, for example by installing their npm wrappers:

```sh
npm install --global @dispat/bin @dispat/crier \
  --allow-scripts=@dispat/bin --allow-scripts=@dispat/crier
```

Merge these entries into the **package-level** `dispat.yaml`, preserving your existing build, publish, and postPublish stages:

```yaml
scripts:
  announce: >-
    dispat if ANNOUNCE
    --then 'crier publish --config "announce/$DISPAT_CHANNEL/crier.yaml"'
    --else 'echo "announce: announcements are off for this run"'
flow:
  announce: announce
```

Dispat runs this command from the package directory. `DISPAT_CHANNEL=stable` selects the stable configuration; `rc` selects the candidate. Add a folder for any other prerelease channel you use. The `ANNOUNCE` switch keeps ordinary release runs from posting unless announcement delivery is explicitly enabled in the release environment.

### 2. Read the release environment directly

The stable Crier config contains:

```yaml
render:
  template: template.html
  data: "env:DISPAT_"
  width: 1080
  height: 1080
  format: jpeg
  jpeg-quality: 92
  output: preview.jpg
  hermetic-fonts: true
  pages-max: 10
publish:
  $ref: ../publish.yaml
  caption: |-
    {{ .package }} {{ .new_version }} is out.
    Read the attached pictures for the full changelog.
```

The prefix is removed and the remaining environment-variable names become lowercase template fields:

| Dispat environment | Crier template value | Use |
| --- | --- | --- |
| `DISPAT_PACKAGE` | `{{ .package }}` | Package name |
| `DISPAT_NEW_VERSION` | `{{ .new_version }}` | Exact release version |
| `DISPAT_BREAKING_CHANGES` | `{{ .breaking_changes }}` | Breaking-change notes |
| `DISPAT_FEATURES` | `{{ .features }}` | Feature notes |
| `DISPAT_FIXES` | `{{ .fixes }}` | Fix notes |
| `DISPAT_DEPENDENCIES` | `{{ .dependencies }}` | Dependency updates |
| `DISPAT_CHANNEL` | `{{ .channel }}` | Stable or prerelease channel |

Values read through `env:` are strings. The generated notes have one entry per line, so the stable template preserves them with `white-space: pre-wrap` and lets them paginate:

```html
<style>
  .items { white-space: pre-wrap; overflow-wrap: break-word }
</style>
{{ if .features }}
<h2>FEATURES</h2><div class="items">{{ .features }}</div>
{{ end }}
```

The supplied stable template includes all four note groups. The caption stays short and points at the images, so long notes do not also become an oversized platform caption. The original Dispat setup additionally varies the wording by `.Platform` and includes short groups only while they fit its caption budget.

### 3. Share destinations between stable and rc

**`announce/publish.yaml`** is a publish-section fragment, with no outer `publish:` key:

```yaml
instagram:
  enabled: true
  poll-timeout: 5m
  max-attachments: 10
linkedin:
  enabled: true
  max-attachments: 10
discord:
  enabled: true
  max-attachments: 10
  mention-everyone: false
```

Both channel configs use `publish.$ref: ../publish.yaml`; fields beside the reference override the shared values. The sample uses no music file and leaves Discord mass mentions disabled. To reproduce Dispat's music-backed Instagram story, add `cover-story: true` under `instagram` and an audio source under each channel's `render.video`, as shown in [Video and music](#video-gifs-and-music). Install FFmpeg for that addition.

Dispat's actual release-candidate announcement is written by a person: the caption lives in `rc/notes.yaml`, and the corresponding card text lives in `rc/template.html`. The sample keeps the same structure:

```yaml
# Inside announce/rc/crier.yaml
publish:
  $ref: ../publish.yaml
  caption:
    $ref: notes.yaml
```

Edit the candidate's caption and card together before releasing. Both can interpolate `{{ .new_version }}`. Stable announcements use the generated release-note groups instead.

### 4. Preview without posting

From the wrapper repository, the supplied example can be rendered with sample environment values:

```sh
DISPAT_PACKAGE=my-app \
DISPAT_NEW_VERSION=1.1.0 \
DISPAT_BREAKING_CHANGES='' \
DISPAT_FEATURES='Generate changelog images automatically' \
DISPAT_FIXES='Preserve long release-note entries' \
DISPAT_DEPENDENCIES='' \
  crier render --config examples/dispat/announce/stable/crier.yaml

DISPAT_PACKAGE=my-app DISPAT_NEW_VERSION=1.2.0-rc.1 \
  crier render --config examples/dispat/announce/rc/crier.yaml
```

Set all note variables when hand-running a stable publish preview, even when empty; Dispat supplies them during a real release. `render` writes local images. `publish --dry-run --json` additionally resolves platform captions and publication plans without posting; it still needs the enabled publishers' required configuration.

### 5. Supply release-job credentials and staging

Set these in the release job's environment from your CI secrets:

| Environment variable | Value |
| --- | --- |
| `CRIER_PUBLISH_INSTAGRAM_TOKEN` | Instagram publishing token |
| `CRIER_PUBLISH_INSTAGRAM_USER_ID` | Instagram professional account ID |
| `CRIER_PUBLISH_LINKEDIN_TOKEN` | LinkedIn access token |
| `CRIER_PUBLISH_LINKEDIN_AUTHOR_URN` | LinkedIn author URN |
| `CRIER_PUBLISH_DISCORD_WEBHOOK_URL` | Incoming Discord webhook URL |

Instagram additionally needs staging. For a runner using an installed, configured ngrok client:

```sh
export CRIER_STAGE_MODE=server
export CRIER_STAGE_SERVER_TUNNEL_MODE=ngrok
# Supply NGROK_AUTHTOKEN through the release job's secrets when required.
```

The shared sample retains Crier's default Instagram API host. If your token was issued through Instagram business login, set `CRIER_PUBLISH_INSTAGRAM_API_BASE_URL=https://graph.instagram.com/v25.0`, as Dispat's actual setup does. Choose the host for the token's login flow; the token and host must agree.

Before starting the real release, run `crier ping` against both channel configs with those credentials. When ready, set `ANNOUNCE=1` in the **existing release job** and run your normal Dispat release. Keep package-release outputs in the package's `postPublish` hook, as Dispat does, so reporting package publication does not depend on a social network.

For example, these steps belong in your existing GitHub Actions release job, after installing the tools. Declare `ANNOUNCE`, the publishing credentials, and staging settings at job level so the preflight and release receive the same environment:

```yaml
# Fragment of an existing release job; retain its checkout, tool installation,
# repository permissions, and package-publication credentials.
env:
  ANNOUNCE: ${{ vars.ANNOUNCE }}
  CRIER_PUBLISH_INSTAGRAM_TOKEN: ${{ secrets.CRIER_PUBLISH_INSTAGRAM_TOKEN }}
  CRIER_PUBLISH_INSTAGRAM_USER_ID: ${{ secrets.CRIER_PUBLISH_INSTAGRAM_USER_ID }}
  CRIER_PUBLISH_LINKEDIN_TOKEN: ${{ secrets.CRIER_PUBLISH_LINKEDIN_TOKEN }}
  CRIER_PUBLISH_LINKEDIN_AUTHOR_URN: ${{ secrets.CRIER_PUBLISH_LINKEDIN_AUTHOR_URN }}
  CRIER_PUBLISH_DISCORD_WEBHOOK_URL: ${{ secrets.CRIER_PUBLISH_DISCORD_WEBHOOK_URL }}
  CRIER_STAGE_MODE: server
  CRIER_STAGE_SERVER_TUNNEL_MODE: ngrok
  NGROK_AUTHTOKEN: ${{ secrets.NGROK_AUTHTOKEN }}
steps:
  - name: Check announcement inputs and credentials
    if: env.ANNOUNCE != ''
    working-directory: services/my-app
    run: |
      crier ping --config announce/stable/crier.yaml
      crier ping --config announce/rc/crier.yaml
  - name: Release packages and announce
    run: dispat release
```

Set the repository variable `ANNOUNCE` to `1` to enable this fragment's announcement path; leave it unset to skip it. Install and configure ngrok before these steps, or replace the staging environment with your S3 configuration. Set the Instagram API host override here too when your token requires it. This is documentation for your release workflow; the wrapper repository's own CI does not publish packages or social posts.

For a missing destination, inspect the completed posts first, then disable already successful destinations with variables such as `CRIER_PUBLISH_INSTAGRAM_ENABLED=false` before a deliberate replay. Dispat treats an announce-stage failure as a warning; read the Crier report rather than assuming the whole announcement succeeded because the package release did.

[Copied stable/rc previews from Dispat](./docs/images/README.md) and the [original configurations, templates, fonts, and music provenance](https://github.com/yohimik/dispat/tree/main/services/dispat/announce) provide the complete reference design.

## Pagination and carousels

Content that exceeds one page can flow onto the next. **Do not set a fixed height on the document body when you want pagination.** The quickstart's `height: 100%` is appropriate for a single card; a changelog uses normal document flow.

```css
@page {
  margin: 64px 64px 80px;
  @top-left { content: "Release notes" }
  @bottom-right { content: counter(page) " / " counter(pages) }
}
body { margin: 0 }
.cover { height: 936px; break-after: page } /* 1080 - 64 - 80 */
h2 { break-after: avoid }
.entry { break-inside: avoid }
```

Margin boxes need nonzero page margins to be visible. `break-after: page` starts a new page; `break-after: avoid` keeps a heading with following content. A box larger than an entire page must still split.

```yaml
render:
  width: 1080
  height: 1080
  output: release.png
  pages-max: 10
publish:
  caption: "Release {{ .version }} — part {{ .Post }} of {{ .Posts }}"
```

A one-page render writes `release.png`; a multi-page render writes `release-1.png`, `release-2.png`, and so on. `pages-max` defaults to 10, can be raised to at most 20, and fails the render if the document exceeds the configured ceiling.

Crier preserves the page order and splits longer sequences into the post sizes supported by its publishers:

| Destination | Photo pages per post in Crier 1.1.1 |
| --- | --- |
| Instagram feed, Facebook Page, Telegram, Discord, Slack, VK, Boosty | Up to 10 |
| X and Mastodon | Up to 4, subject to instance/platform restrictions |
| LinkedIn and Threads | Up to 20 |
| Instagram stories, Facebook stories, Reddit | One page per story or post |
| YouTube | Video only |

`publish.<platform>.max-attachments` can lower a publisher's cap. More pages become sequential posts rather than dropped pages. An Instagram or Telegram `lead-video` occupies one attachment slot in every post. Photo carousels do not automatically become a slideshow video; encoding a video is a separate flow.

Full behavior: [pagination and carousels](https://github.com/yohimik/crier/blob/v1.1.1/docs/rendering/pagination.md).

## Text overflow and ellipsis

Choose whether a region should wrap, clip, truncate, or flow to another page. Crier supports these explicit CSS patterns.

**A single line ending in an ellipsis:**

```css
.title {
  width: 880px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

**A description limited to three lines:**

```css
.description {
  width: 880px;
  overflow: hidden;
  overflow-wrap: break-word;
  max-lines: 3;
  continue: discard;
  block-ellipsis: auto;
}
```

**Long URLs, hashes, and unbroken words:**

```css
.notes { overflow-wrap: break-word }
```

Use `word-break: break-all` for more aggressive wrapping. `overflow: hidden` alone clips; it does not add an ellipsis. Avoid clamping the full changelog when every entry must be preserved—let it paginate instead.

Crier's tested multi-line recipe uses `max-lines`, `continue`, and `block-ellipsis`. `-webkit-line-clamp`, `display: -webkit-box`, and the `line-clamp` shorthand are not supported substitutes. See [text overflow](https://github.com/yohimik/crier/blob/v1.1.1/docs/templates/text-overflow.md) and the [CSS support reference](https://github.com/yohimik/crier/blob/v1.1.1/docs/rendering/css-support.md).

## One layout, different platform sizes

Render at a different size with a per-platform `width` and `height`. Use template overlays when the contents should rearrange, or `fit` when the existing image should be scaled into another frame.

```yaml
publish:
  instagram:
    enabled: true
    story: true
    width: 1080
    height: 1920
    fit: contain
    fit-background: "#11243b"
```

`contain` keeps the full card with a background around it. `cover` fills the frame and crops the edges. `stretch` changes the aspect ratio. For text-heavy release cards, `contain` preserves the complete lines.

```sh
crier render --render-variant instagram --render-output story.png
```

Template `{{ block }}` sections can be replaced by `{{ define }}` blocks in a platform's `overlay` files. Platforms with the same size and overlays share a render. See [overlays and fitting](https://github.com/yohimik/crier/blob/v1.1.1/docs/templates/overlays.md).

## Video, GIFs, and music

### Render an MP4

Install FFmpeg separately and put it on `PATH`, or configure `render.video.ffmpeg-bin`. Add this to a single-page template's existing render configuration:

```yaml
render:
  template: template.html
  data: data.yaml
  width: 1080
  height: 1080
  output: announcement.mp4
  video:
    enabled: true
    format: mp4
    fps: 24
    duration: 4s
    codec-preset: h264
    audio: launch-theme.mp3
    audio-loop: true
```

Provide `launch-theme.mp3`, or remove the audio keys to render silently. `crier render` executes and lays out the template once per frame and streams frames into FFmpeg. It is a frame-rendering pipeline, not browser JavaScript or CSS animation playback. Four seconds at 24 FPS means 96 layout/render passes.

Templates can animate using the frame values:

```html
<div style="opacity: {{ .Video.Progress }}">The release is here.</div>
```

`.Video.Frame` starts at zero; `.Video.Frames` is the total count, `.Video.Time` is elapsed seconds, and `.Video.Progress` runs from 0 to 1. `render.video.frames` sets an exact frame count instead of deriving it from duration and FPS.

### Make an animated GIF

```yaml
render:
  output: announcement.gif
  video:
    enabled: true
    format: gif
    fps: 12
    duration: 2s
```

GIFs have no soundtrack; audio settings are ignored for that format. Telegram, Discord, Mastodon, X, Reddit, Slack, and VK accept GIFs through Crier. Use MP4 for the other video-capable publishers. Keep GIFs short to control output size.

### Three ways to add music

| Goal | Configuration | Result |
| --- | --- | --- |
| A soundtrack inside the video | `render.video.audio` | FFmpeg mixes audio into the MP4; the uploaded video carries it. |
| A separate audio file with a photo post | `publish.music-file` | Discord and Slack attach the file; Telegram sends it after the image/album as an audio message. |
| A platform-recommended track for TikTok photos | `publish.tiktok.auto-add-music: true` | TikTok chooses a recommended track; this does not select a song by ID. |

For separate audio attachments:

```yaml
publish:
  music-file: launch-theme.mp3
```

Use audio you are entitled to distribute. Crier 1.1.1 has no setting for choosing a licensed Instagram, Facebook, or TikTok library track by song ID. A soundtrack embedded in your own MP4 and an audio-file attachment are different features.

A pool chooses one audio file per run:

```yaml
render:
  video:
    audio-pool:
      - launch-theme.mp3
      - alternate-theme.mp3
```

### Instagram feed carousel plus a music-backed cover story

Keep the main render as still images, then add:

```yaml
render:
  video:
    enabled: false
    audio: launch-theme.mp3
publish:
  instagram:
    enabled: true
    cover-story: true
```

Crier publishes the normal photo feed post or carousel and generates a **separate 16-second MP4 Story from page one**, with the selected audio. This requires FFmpeg, a real audio file or audio pool, Instagram credentials, and public staging for the clip. `cover-story` cannot be combined with `story: true`, which changes the primary output to stories.

This is the music pattern used in Dispat's announcement setup. Alternatively, `publish.instagram.lead-video: intro.mp4` or `publish.telegram.lead-video: intro.mp4` prepends an existing MP4 to each photo carousel/album and consumes one attachment slot.

More: [video rendering](https://github.com/yohimik/crier/blob/v1.1.1/docs/rendering/video.md) · [music](https://github.com/yohimik/crier/blob/v1.1.1/docs/publishing/music.md) · [existing media and frames](https://github.com/yohimik/crier/blob/v1.1.1/docs/publishing/flows.md).

## Public media URLs: staging and tunneling

Instagram, Threads, and TikTok photo publishing need a publicly reachable media URL. The platform fetches the file from its own servers, so `localhost` is not sufficient. Crier stages the media using one of these modes:

| Mode | Use |
| --- | --- |
| `none` | Publishers that accept direct file uploads |
| `s3` | Upload to an S3-compatible object store and provide public or presigned URLs |
| `server` | Serve the staged files locally, through an existing public address or a tunnel |
| `url` | Supply an already hosted media URL yourself |

### ngrok or zrok

Install and configure your tunnel client first. Crier starts it when needed and closes the managed server and tunnel when the publication finishes.

```yaml
stage:
  mode: server
  server:
    listen: 127.0.0.1:0
    tunnel:
      mode: ngrok
      startup-timeout: 30s
```

Use `mode: zrok` for an installed and enabled zrok client. Tunnel binaries are not included in the npm package. The public URL must return the media directly: login pages, tunnel warning/interstitial pages, and inaccessible private addresses will prevent the platform from fetching it. Upstream documents this as a common problem with ngrok interstitials.

### A custom tunnel, such as cloudflared

```yaml
stage:
  mode: server
  server:
    listen: 127.0.0.1:0
    tunnel:
      mode: custom
      bin: cloudflared
      args: ["tunnel", "--url", "http://{addr}"]
      url-pattern: '(https://[a-z0-9-]+\.trycloudflare\.com)'
```

`{addr}` and `{port}` are substituted into arguments. The URL pattern must have **exactly one capture group**, as the parentheses above provide. Do not set `stage.server.public-url` alongside an automatic tunnel; either configure an existing public endpoint or let the tunnel discover one.

### S3-compatible staging

```yaml
stage:
  mode: s3
  s3:
    endpoint: s3.eu-west-1.amazonaws.com
    region: eu-west-1
    bucket: my-release-media
    prefix: announcements
    presign: true
    presign-expiry: 1h
    delete-after: true
```

```sh
export CRIER_STAGE_S3_ACCESS_KEY='your-access-key'
export CRIER_STAGE_S3_SECRET_KEY='your-secret-key'
```

Configure the endpoint and bucket for your provider. Presigned URLs allow the fetch without making the whole bucket public. The URL must remain valid throughout platform processing. `delete-after: true` removes staged objects after the run; retain them when your publishing flow requires later fetching.

For a file already hosted elsewhere:

```yaml
stage:
  mode: url
  url: https://cdn.example.com/release.jpg
```

Crier does not upload or verify that this URL represents your render. Use it only when your own process has already hosted the intended media. See [staging](https://github.com/yohimik/crier/blob/v1.1.1/docs/staging/README.md) and [tunnel configuration](https://github.com/yohimik/crier/blob/v1.1.1/docs/configuration/stage/tunnel.md).

## Commands at a glance

| Command | Purpose |
| --- | --- |
| `crier init` / `crier init --full` | Generate a starter or complete configuration |
| `crier render` | Render locally without publishing |
| `crier render --render-variant instagram` | Preview one platform's layout |
| `crier ping` | Check enabled destinations and configured media inputs without posting |
| `crier platforms` | List destination readiness and media requirements |
| `crier config` | Inspect resolved configuration with secrets redacted |
| `crier publish --dry-run --json` | Render and inspect the publishing plan without network publication |
| `crier publish` / `crier` | Render, stage as needed, and publish |
| `crier --version` | Show the native binary version |

Results use stdout and diagnostics use stderr. The npm launcher preserves arguments, input/output streams, working directory, environment, exit codes, and termination signals. Native command flags follow the subcommand, for example `crier render --config announce/crier.yaml`.

## Installation scripts and repair

If installation scripts were blocked or the download failed:

```sh
# Local npm installation
npm explore @dispat/crier -- node build/bin/postinstall.js

# Global npm installation, from any directory
npm explore --global @dispat/crier -- node build/bin/postinstall.js

# pnpm or Yarn with the node_modules linker
node node_modules/@dispat/crier/build/bin/postinstall.js
```

A missing binary also produces a repair command for that exact installation. Ordinary commands never trigger an automatic download. Installation needs HTTPS access to GitHub and its release-asset hosts; downloads honor `npm_config_https_proxy`, `npm_config_proxy`, `npm_config_noproxy`, and `npm_config_cafile`. Set `CRIER_NPM_DEBUG=1` for installer diagnostics on stderr.

## Update and remove

```sh
npm update @dispat/crier
# Global update:
npm install --global @dispat/crier@latest --allow-scripts=@dispat/crier
# Install a specific wrapper version:
npm install --global @dispat/crier@1.1.0 --allow-scripts=@dispat/crier
# Global removal:
npm uninstall --global @dispat/crier
```

Native `self-update` mutations are blocked because npm owns this installation. `crier self-update --check` and `crier self-update --help` remain available. Use your package manager to upgrade or roll back.

## This repository's Dispat configuration

This is one pnpm project with one root manifest. `@dispat/bin@1.10.3` is a pinned
development dependency, and [package.json](./package.json) pins pnpm `10.34.1`.
That pnpm line supports the package's Node 20.17 minimum; the CI matrix also runs
Node 22.9 and 24.18. [pnpm-workspace.yaml](./pnpm-workspace.yaml) approves only
Dispat's dependency build script and does not declare additional packages.

[dispat.yaml](./dispat.yaml) declares one standalone package named `crier` at
`src/`. Its npm manifest stays at the root. `changelog.file: ../CHANGELOG.md`
writes [CHANGELOG.md](./CHANGELOG.md) at the root, and the release commit includes
that file, package.json, and pnpm-lock.yaml.

```sh
pnpm install --frozen-lockfile
pnpm release:plan    # Read-only release plan.
pnpm release:notes   # Preview both the changelog and GitHub release body.
```

Planning needs at least one Git commit; an empty, uncommitted clone has no `HEAD`
for Dispat to inspect. `pnpm test` and the build commands below work before that
first commit. Use the `crier` commit scope for release-worthy root-only changes
such as `fix(crier): update installer documentation`; unscoped changes in `src/`
also belong to the package.

The prepared first npm version remains `1.1.0`. Dispat derives the release plan
from Git history and tags, not the parent manifest. The initial feature commit
includes the footer `Release-As: 1.1.0` to pin that first version. Before the first
authorized release, confirm that `pnpm release:plan` selects `1.1.0`.

The version stage updates the root manifest and refreshes pnpm-lock.yaml without
running install hooks. Release-time tests run before building. The build pins
native Crier `1.1.1`, unless `CRIER_BINARY_VERSION` selects another published
version, then packs one artifact. Before publication, Dispat checks its integrity
and exercises installation from that tarball. The npm helper publishes stable
versions on `latest` and prereleases on their channel.

After publication, Dispat records and pushes the release commit and `v{version}`
tag, writes the root changelog, and creates a GitHub release in
`yohimik/crier-npm`. The GitHub release includes the generated release notes and
a link to that exact version on npm, such as
`https://www.npmjs.com/package/@dispat/crier/v/1.1.0`.

### CI/CD

The workflow structure follows Dispat's own release process, using the installed
npm development dependency for every Dispat invocation:

| Workflow | When it runs | What it does |
| --- | --- | --- |
| [CI](./.github/workflows/ci.yml) | Pull requests, main pushes, manual checks | Calls the reusable full suite; never publishes. |
| [Full suite](./.github/workflows/checks.yml) | Called by CI and the release gate | Runs type checking, all tests and coverage, npm 12 script-approval checks, artifact checks, and six native installation targets. |
| [Release](./.github/workflows/release.yml) | Manual dispatch from main | Plans, runs the full suite, publishes through Dispat, records/pushes tags and GitHub release notes, then verifies the exact npm version. |

The full suite runs on Linux and macOS with Node 20.17, 22.9, and 24.18. Packed
installation and post-release registry checks cover Linux, macOS, and Windows on
both x64 and ARM64. CI and release use `pnpm exec dispat`; they do not build a Go
release driver or install Dispat globally. There are no announcement hooks, social
posting jobs, Crier account secrets, or tunnel steps in these workflows. The
[Dispat announcement example](#automate-announcements-with-dispat) is a separate
copyable example for projects that want social posts.

The release workflow queues concurrent releases and treats an empty plan as a
successful skip. A broken plan fails. The publication job re-runs tests and artifact
checks after versioning. Its `postPublish` hook records the published npm and native
versions so registry install checks can still run if later release recording fails.
Registry propagation is checked separately from the npm upload.

Configure npm trusted publishing for `yohimik/crier-npm` and workflow `release.yml`.
The release job has `id-token: write` for npm provenance and `contents: write` for
Dispat's lock, release commit, tags, and GitHub release. An optional `NPM_TOKEN`
repository secret supports the first publication before trusted publishing is
configured. Repository rules must permit the intended release writes. Credentials
are confined to the release job; the test jobs have read-only repository access.

Dispatching **Release** performs the real publication. Building or testing locally
does not dispatch it. Pushing to main runs CI checks; publication requires a separate
manual Release dispatch.

## Development and release preparation

This repository adapts [Dispat's packages/cli](https://github.com/yohimik/dispat/tree/main/packages/cli).
Native source stays in [yohimik/crier](https://github.com/yohimik/crier).

```sh
pnpm install --frozen-lockfile
pnpm test
CRIER_BINARY_VERSION=1.1.1 pnpm build
pnpm run pack
pnpm run test:artifact
```

On PowerShell, set `$env:CRIER_BINARY_VERSION = '1.1.1'` before the build.
`test:artifact` runs the detailed temporary-prefix npm/pnpm checks on macOS/Linux;
CI additionally runs the portable install check on all six native targets.
The project uses pnpm for dependency installation, scripts, and lockfile updates.
The artifact helpers deliberately call the npm CLI for `npm pack` and `npm publish`,
and the consumer tests exercise both npm and pnpm.

The build fetches metadata for the exact native tag and rejects missing assets,
invalid sizes/digests, and mismatched tags. Packing produces
`dist/dispat-crier-1.1.0.tgz` and an integrity record in `dist/artifact.json`.
The README, changelog, copied previews, and runnable examples are included;
generated example preview outputs are excluded. See [TESTING.md](./TESTING.md)
for the full validation and release procedure.

## Documentation and source

- [Crier documentation](https://github.com/yohimik/crier/tree/v1.1.1/docs): complete native feature documentation for the pinned binary.
- [Full configuration sample](https://github.com/yohimik/crier/blob/v1.1.1/crier.example.yaml): every configuration key and default.
- [Template syntax](https://github.com/yohimik/crier/blob/v1.1.1/docs/templates/README.md), [fonts](https://github.com/yohimik/crier/blob/v1.1.1/docs/templates/fonts.md), and [template pools](https://github.com/yohimik/crier/blob/v1.1.1/docs/templates/pools.md).
- [Dispat release announcements](https://github.com/yohimik/dispat/tree/main/services/dispat/announce): the working setup behind the integration example.
- [Wrapper issues](https://github.com/yohimik/crier-npm/issues) for npm installation; [Crier issues](https://github.com/yohimik/crier/issues) for rendering and publishing.

MIT licensed. Copied preview provenance is listed in [docs/images/README.md](./docs/images/README.md).
