# Widget theming

How to make the web widget look like your site, not like a widget.

## Open the widget editor

**Widgets → New** to create one, or click a widget to edit it. The editor has four tabs: **Appearance**, **Layout**, **Design AI**, and **Install**.

## 1. Set the identity

**Appearance → Identity**:

- **Display name** — the agent's name shown in the widget.
- **Welcome message** — the first thing visitors see. Max 200 characters. See [Writing a welcome message](/docs/agents) for what makes a good one.
- **Avatar** — upload an image (JPG, PNG, WebP, GIF, max 2MB) or pick a preset. Presets are organized by category: Support, Business, Education, Productivity, Developer, Researcher, Custom.
- **Launcher label** — optional text beside the launcher button, max 50 characters.

## 2. Match your colors

**Appearance → Colors**:

- **Theme mode** — Auto, Light, or Dark. Auto follows the visitor's system preference.
- **Primary** — launcher and user message bubbles.
- **Background** — the widget window.
- **Text** — message text.
- **AI response** — the AI bubble background.
- **Border**, **Input bg**, **Send button**, **Footer bg** — the rest of the surface.

Each field has preset swatches and a hex picker.

**Appearance → Header**:

- **Gradient header** — toggle on, pick start and end colors, set the direction (0–360°).
- **Title** and **Subtitle** — header text.
- **Online indicator** — show a green dot.
- **Powered by Convio** — locked on free plans.
- **Quick replies** — up to 4 chips (max 60 characters each) that visitors can tap instead of typing.

## 3. Set the layout

**Layout**:

| Setting | Options |
|---|---|
| **Position** | Bottom right / Bottom left |
| **Height** | Compact (420px) / Default (540px) / Tall (660px) / Full (760px) |
| **Width** | Narrow (320px) / Default (380px) / Wide (440px) |
| **Launcher size** | Small (48px) / Default (56px) / Large (64px) |
| **Launcher shape** | Circle / Pill / Square |
| **Corner radius** | Sharp / Rounded / Full |
| **On mobile** | Default / Fullscreen |

**Advanced** (collapsed by default): custom width (300–500px), custom height (300–1200px), bottom spacing (0–200px), a teaser message with delay, and **hide widget on pages** — URL path prefixes where the widget should not load (max 20).

## 4. Or describe the look

**Design AI** — describe the widget in plain words and let the AI draft the design:

1. Type a description, e.g. "Fintech dark" or "Wellness light" (or press Tab to cycle the examples).
2. The AI drafts a name, header text, color palette, and quick replies.
3. **Apply this design** to load the draft into the form, then adjust by hand.

## 5. Install it

**Install** tab:

1. Copy the embed snippet and paste it before `</body>` on your site.
2. Add at least one **domain** to the allowlist — the widget only loads on these origins (max 20). See [Channels & deployment](/docs/channels) for why this matters.
3. Click **Publish**. The widget renders nothing until you do.

## Preview before you publish

The right panel shows a live preview with a desktop/mobile toggle. Turn on **Demo responses** to see sample replies without contacting the agent. **Open live preview** opens the widget in a new tab.

![The widget editor, showing the Appearance tab with the live preview and demo responses](https://placehold.co/1280x720)
