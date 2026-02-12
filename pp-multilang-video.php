<?php
/**
 * Plugin Name: Multi-Lang Video Switcher
 * Description: Video with multiple language versions; preselect overlay + on-the-fly swaps. Includes a Gutenberg block to pick files per language.
 * Version: 1.2.3
 * Author:      Piotr Kijowski [piotr.kijowski@gmail.com]
 * Author URI:  https://github.com/piotr-kijowski
 * License:     GPL-3.0+
 * License URI: https://www.gnu.org/licenses/gpl-3.0.html
 */

if (!defined('ABSPATH')) exit;

class PP_MultiLang_Video_Switcher {
    private static $instance = null;

    public static function instance() {
        if (self::$instance === null) self::$instance = new self();
        return self::$instance;
    }

    private function __construct() {
        add_shortcode('pp_multilang_video', [$this, 'shortcode']);
        add_action('wp_enqueue_scripts', [$this, 'assets']);
        add_action('init', [$this, 'register_assets']);
        add_action('init', [$this, 'register_block']);
    }

    public function assets() {
        $v = '1.2.3';
        $base = plugin_dir_url(__FILE__);
        wp_register_style('ppmlv-css', $base . 'ppmlv.css', [], $v);
        wp_register_script('ppmlv-js', $base . 'ppmlv.js', [], $v, false);
        // Register the Gutenberg editor script handle for the block so block.json can enqueue it
        wp_register_script(
            'ppmlv-block-editor',
            $base . 'block/index.js',
            array('wp-blocks','wp-element','wp-i18n','wp-components','wp-block-editor'),
            $v,
            true
        );

    }

    public function register_assets() {
        $v = '1.2.3';
        $base = plugin_dir_url(__FILE__);
        // Editor script for the block must be registered on init so the editor can enqueue it
        wp_register_script(
            'ppmlv-block-editor',
            $base . 'block/index.js',
            array('wp-blocks','wp-element','wp-i18n','wp-components','wp-block-editor'),
            $v,
            true
        );
    }

    public function register_block() {
        // Load block.json and let WP handle deps. Server render via render_callback.
        register_block_type(__DIR__ . '/block', [
            'render_callback' => [$this, 'render_block'],
        ]);
    }

    public function render_block($attributes, $content = '', $block = null) {
        // Attributes to shortcode-like params
        $items      = isset($attributes['items']) && is_array($attributes['items']) ? $attributes['items'] : [];
        $labels_raw = [];
        $langs_raw  = [];
        $caps_raw   = [];

        foreach ($items as $it) {
            $lang = isset($it['lang']) ? trim($it['lang']) : '';
            $src  = isset($it['src']) ? trim($it['src']) : '';
            $lab  = isset($it['label']) ? trim($it['label']) : '';
            $cap  = isset($it['caption']) ? trim($it['caption']) : '';
            if ($lang && $src) {
                $langs_raw[]  = $lang . ':' . $src;
                if ($lab) $labels_raw[] = $lang . ':' . $lab;
                if ($cap) $caps_raw[]   = $lang . ':' . $cap;
            }
        }

        $atts = [
            'languages'      => implode('|', $langs_raw),
            'labels'         => implode('|', $labels_raw),
            'captions'       => implode('|', $caps_raw),
            'default'        => isset($attributes['default']) ? $attributes['default'] : '',
            'poster'         => isset($attributes['poster']) ? $attributes['poster'] : '',
            'ui'             => isset($attributes['ui']) ? $attributes['ui'] : 'buttons',
            'controls'       => !empty($attributes['controls']) ? '1' : '0',
            'muted'          => !empty($attributes['muted']) ? '1' : '0',
            'preload'        => isset($attributes['preload']) ? $attributes['preload'] : 'metadata',
            'width'          => isset($attributes['width']) ? $attributes['width'] : '100%',
            'height'         => isset($attributes['height']) ? $attributes['height'] : '',
            'require_select' => !empty($attributes['require_select']) ? '1' : '0',
        ];

        // Reuse shortcode renderer so both block + shortcode share logic
        return $this->shortcode($atts, '');
    }

    public function shortcode($atts, $content = '') {
        $atts = shortcode_atts([
            'languages'      => '',
            'labels'         => '',
            'captions'       => '',
            'default'        => '',
            'poster'         => '',
            'ui'             => 'buttons',
            'controls'       => '1',
            'muted'          => '0',
            'preload'        => 'metadata',
            'width'          => '100%',
            'height'         => '',
            'require_select' => '0',
        ], $atts, 'pp_multilang_video');

        if (empty($atts['languages'])) {
            return '<p><em>[pp_multilang_video]: No languages provided.</em></p>';
        }

        $lang_map    = self::parse_pairs($atts['languages']);
        $label_map   = self::parse_pairs($atts['labels']);
        $caption_map = self::parse_pairs($atts['captions']);

        $default_lang = $atts['default'];
        if (!$default_lang || !isset($lang_map[$default_lang])) {
            $keys = array_keys($lang_map);
            $default_lang = reset($keys);
        }

        $instance_id = 'ppmlv_' . wp_generate_uuid4();
        $require_select = ($atts['require_select'] === '1');

        $data = [
            'langs'          => $lang_map,
            'labels'         => $label_map,
            'captions'       => $caption_map,
            'default'        => $default_lang,
            'ui'             => $atts['ui'],
            'require_select' => $require_select,
        ];

        wp_enqueue_style('ppmlv-css');
        wp_enqueue_script('ppmlv-js');
                $controls = $atts['controls'] === '1' ? ' controls' : '';
        $muted    = $atts['muted'] === '1' ? ' muted' : '';
        $preload  = in_array($atts['preload'], ['auto','metadata','none'], true) ? $atts['preload'] : 'metadata';

        $style = 'max-width:100%; width:' . esc_attr($atts['width']) . ';';
        if (!empty($atts['height'])) $style .= ' height:' . esc_attr($atts['height']) . ';';

        $initial_source = $require_select ? '' : esc_url($lang_map[$default_lang]);
        $initial_type   = $require_select ? '' : esc_attr(self::guess_mime($lang_map[$default_lang]));

        $tracks_html = '';
        if (!$require_select && !empty($caption_map[$default_lang])) {
            $tracks_html .= '<track kind="subtitles" srclang="' . esc_attr($default_lang) . '" src="' . esc_url($caption_map[$default_lang]) . '" default>';
        }

        ob_start(); ?>
        <div class="ppmlv-wrap" id="<?php echo esc_attr($instance_id); ?>" style="<?php echo esc_attr($style); ?>">
            <div class="ppmlv-video">
                <video
                    playsinline
                    preload="<?php echo esc_attr($preload); ?>"
                    poster="<?php echo esc_url($atts['poster']); ?>"
                    <?php echo $controls . $muted; ?>
                    aria-label="Multilingual video player"
                    <?php if ($require_select) echo ' data-ppmlv-locked="1"'; ?>
                >
                    <?php if (!$require_select): ?>
                        <source src="<?php echo $initial_source; ?>" type="<?php echo $initial_type; ?>">
                        <?php echo $tracks_html; ?>
                    <?php endif; ?>
                    Your browser does not support the video tag.
                </video>

                <?php if ($require_select): ?>
                    <div class="ppmlv-overlay" aria-label="<?php esc_attr_e('Choose language','pp-multilang-video'); ?>">
                        <div class="ppmlv-overlay-card">
                            <div class="ppmlv-overlay-title"><?php esc_html_e('Choose language','pp-multilang-video'); ?></div>
                            <div class="ppmlv-overlay-buttons">
                                <?php foreach ($lang_map as $k => $_url):
                                    $label = !empty($label_map[$k]) ? $label_map[$k] : strtoupper($k); ?>
                                    <button type="button" class="ppmlv-overlay-btn" data-lang="<?php echo esc_attr($k); ?>">
                                        <?php echo esc_html($label); ?>
                                    </button>
                                <?php endforeach; ?>
                            </div>
                        </div>
                    </div>
                <?php endif; ?>
            </div>

            <div class="ppmlv-controls" role="group" aria-label="<?php esc_attr_e('Language selector','pp-multilang-video'); ?>">
                <?php if ($atts['ui'] === 'select'): ?>
                    <label>
                        <span class="screen-reader-text"><?php esc_html_e('Language','pp-multilang-video'); ?></span>
                        <select class="ppmlv-select" aria-label="<?php esc_attr_e('Select language','pp-multilang-video'); ?>">
                            <?php foreach ($lang_map as $k => $_url):
                                $label = !empty($label_map[$k]) ? $label_map[$k] : strtoupper($k); ?>
                                <option value="<?php echo esc_attr($k); ?>" <?php selected($k, $default_lang); ?>>
                                    <?php echo esc_html($label); ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </label>
                <?php else: ?>
                    <div class="ppmlv-buttons">
                        <?php foreach ($lang_map as $k => $_url):
                            $label = !empty($label_map[$k]) ? $label_map[$k] : strtoupper($k);
                            $pressed = (!$require_select && $k === $default_lang) ? 'true' : 'false'; ?>
                            <button type="button" class="ppmlv-btn" data-lang="<?php echo esc_attr($k); ?>" aria-pressed="<?php echo esc_attr($pressed); ?>">
                                <?php echo esc_html($label); ?>
                            </button>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
            </div>
        </div>
        <?php
        ?>
        <script>
        (function(){
           try {
             window.PPMLV = window.PPMLV || {};
             PPMLV["<?php echo esc_js($instance_id); ?>"] = <?php echo wp_json_encode($data); ?>;
           } catch(e) { console && console.error && console.error('PPMLV data inject failed', e); }
        })();
        </script>
        <?php
        return ob_get_clean();
    }

    private static function parse_pairs($raw) {
        $out = [];
        $raw = trim((string)$raw);
        if ($raw === '') return $out;
        $pairs = explode('|', $raw);
        foreach ($pairs as $pair) {
            $pair = trim($pair);
            if ($pair === '') continue;
            $parts = explode(':', $pair, 2);
            if (count($parts) === 2) {
                $k = trim($parts[0]);
                $v = trim($parts[1]);
                if ($k !== '' && $v !== '') $out[$k] = $v;
            }
        }
        return $out;
    }

    private static function guess_mime($url) {
        $path = parse_url($url, PHP_URL_PATH);
        $ext = strtolower(pathinfo($path ?? '', PATHINFO_EXTENSION));
        switch ($ext) {
            case 'mp4': return 'video/mp4';
            case 'webm': return 'video/webm';
            case 'ogg':
            case 'ogv': return 'video/ogg';
            case 'm3u8': return 'application/vnd.apple.mpegurl';
            default: return 'video/mp4';
        }
    }
}
PP_MultiLang_Video_Switcher::instance();
