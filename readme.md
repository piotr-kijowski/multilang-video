=== Multi-Lang Video ===
Contributors: piotr.kijowski
Tags: video, multilingual, block, media, overlay, captions
Requires at least: 6.5
Tested up to: 6.9
Requires PHP: 7.4
Stable tag: 1.2.3
License: GPLv3 or later
License URI: https://www.gnu.org/licenses/gpl-3.0.html

Display a single video block with multiple language versions and optional pre-play language selection overlay.

== Description ==

Multi-Lang Video allows you to display one video player that supports multiple language versions of the same content.

Each language version is assigned its own video file. Visitors can:

- Select their preferred language before playback (optional overlay)
- Switch languages while watching
- Automatically load a default language
- Use captions if provided
- Have their selected language remembered in the browser

The plugin provides:

- A Gutenberg block
- A shortcode for Classic Editor or templates
- Seamless front-end language switching
- Caption (.vtt) support per language

This plugin does NOT replace WordPress media handling. It extends it by allowing structured multi-language playback within a single player instance.

Perfect for:

- Product videos with voice-over variations
- Training and onboarding material
- International landing pages
- Multi-language promotional campaigns
- Accessibility-focused content delivery

== Features ==

* Gutenberg block: "Multi-Lang Video"
* Multiple video files per language
* Optional pre-play language selection overlay
* Button or dropdown language selector
* Caption (.vtt) support per language
* Remembers selected language via localStorage
* Seamless source switching without page reload
* Responsive layout
* Supports MP4, WebM, OGV, and HLS (.m3u8)
* Shortcode fallback for Classic Editor
* Multiple instances supported per page
* No external dependencies required

== Installation ==

1. Upload the plugin folder to `/wp-content/plugins/multilang-video/`
2. Activate the plugin through the **Plugins** menu in WordPress
3. Open the block editor and add the "Multi-Lang Video" block

No additional configuration required.

== Usage ==

= Block Usage =

1. Open a page or post in the WordPress block editor
2. Click **Add Block**
3. Search for **PP Multi-Lang Video**
4. Insert the block
5. Click **Add Language** for each language version

For each language item:
- Enter a Language Key (e.g. en, pl, de)
- Enter a Label (display name shown to visitors)
- Select or paste a Video File URL
- Optionally add a Caption (.vtt) file

Then configure optional settings in the block sidebar:
- Default Language
- Require language selection before playback
- UI style (Buttons or Dropdown)
- Poster image
- Controls on/off
- Muted on load
- Preload behavior
- Width / Height (CSS values)

Click Publish or Update.

= Shortcode Usage =

You can also use the shortcode:

[pp_multilang_video
  languages="en:https://example.com/video-en.mp4|pl:https://example.com/video-pl.mp4"
  labels="en:English|pl:Polski"
  captions="en:https://example.com/en.vtt|pl:https://example.com/pl.vtt"
  poster="https://example.com/poster.jpg"
  default="en"
  ui="buttons"
  require_select="1"
  controls="1"
  muted="0"
  preload="metadata"
  width="100%"
]

== Block Options ==

= items =
Array of language entries containing:
- lang (language key)
- label (display name)
- src (video file URL)
- captions (optional .vtt file URL)

= default =
Sets which language loads automatically when overlay is disabled.

= require_select =
If enabled:
- Displays a pre-play overlay
- Prevents video loading until language is chosen

= ui =
Selector style:
- buttons (default)
- dropdown

= controls =
Enable or disable native video controls.

= muted =
Start playback muted if enabled.

= preload =
Controls browser loading behavior:
- metadata (default)
- auto
- none

= poster =
Optional poster image shown before playback.

= width / height =
Accepts any valid CSS value:
- 100%
- 960px
- min(100%, 960px)
- 50vw

Height is optional and typically not required for responsive layouts.

== Front-End Behavior ==

Overlay Mode:
- Displays a language selection overlay
- Loads selected video on click
- Stores selection in localStorage

Standard Mode:
- Loads default language automatically
- Users can switch languages anytime
- Playback position is preserved when switching

Caption Support:
- If .vtt files are provided, tracks are dynamically injected
- Caption track updates when language changes

Multiple blocks per page are fully supported.

== Requirements ==

* WordPress 6.5 or newer
* PHP 7.4+
* Modern browser with HTML5 video support

Optional:
* HLS stream support (.m3u8) if using streaming sources

== FAQ ==

= Does this replace WordPress video embeds? =
No. It extends standard video handling by adding structured language switching.

= Can I use videos hosted on a CDN? =
Yes. Absolute URLs are recommended.

= Can I use multiple video blocks on one page? =
Yes. Each instance is isolated and handled independently.

= Does it work with caching plugins? =
Yes. Inline configuration injection ensures proper initialization even with deferred scripts.

= Does it support captions? =
Yes. Provide .vtt files per language.

= What happens if no default language is set? =
The first language item added will be used automatically.

== Changelog ==

= 1.2.3 =
* Reliable inline data injection for initialization
* Improved overlay behavior
* Stability improvements
* Multiple instance handling refinements

= 1.2.2 =
* Script loading order fix
* Improved compatibility with themes lacking wp_footer()

= 1.2.1 =
* Correct Gutenberg block registration
* Editor script handle fix

= 1.2.0 =
* Added pre-play language selection overlay
* Improved UI switching logic

= 1.0.0 =
* Initial release

== Upgrade Notice ==

= 1.2.3 =
Recommended upgrade. Improves initialization reliability and multi-instance stability.

== License ==

This plugin is licensed under the GPL v3 or later.
