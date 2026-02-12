( function(wp) {
  var el = wp.element.createElement;
  var registerBlockType = wp.blocks.registerBlockType;
  var Fragment = wp.element.Fragment;
  var __ = wp.i18n.__;
  var MediaUpload = wp.blockEditor.MediaUpload;
  var MediaUploadCheck = wp.blockEditor.MediaUploadCheck;
  var InspectorControls = wp.blockEditor.InspectorControls;
  var PanelBody = wp.components.PanelBody;
  var TextControl = wp.components.TextControl;
  var SelectControl = wp.components.SelectControl;
  var ToggleControl = wp.components.ToggleControl;
  var Button = wp.components.Button;

  // Ensure script/style handles exist (registered by block.json editorScript mapping in PHP)
  // We only define the UI; save is null (server render).

  function ItemRow( props ) {
    var item = props.item;
    var idx = props.index;

    function set(field, value){
      var next = props.items.slice();
      next[idx] = Object.assign({}, next[idx], (function(o){ o[field]=value; return o; })({}));
      props.onChange(next);
    }

    function remove(){
      var next = props.items.slice();
      next.splice(idx,1);
      props.onChange(next);
    }

    return el('div', { className: 'ppmlv-item', style:{padding:'8px', border:'1px solid #ddd', borderRadius:'8px', marginBottom:'10px'} },
      el('div', { style:{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px'} },
        el(TextControl, {
          label: __('Language code (e.g. en, pl, de)', 'pp-multilang-video'),
          value: item.lang || '',
          onChange: function(v){ set('lang', v.trim()); }
        }),
        el(TextControl, {
          label: __('Label (e.g. English, Polski)', 'pp-multilang-video'),
          value: item.label || '',
          onChange: function(v){ set('label', v); }
        })
      ),
      el('div', { style:{display:'grid', gridTemplateColumns:'1fr auto', gap:'8px', alignItems:'end', marginTop:'8px'} },
        el(TextControl, {
          label: __('Video file URL', 'pp-multilang-video'),
          value: item.src || '',
          onChange: function(v){ set('src', v); },
          help: __('MP4/WebM/HLS (.m3u8).', 'pp-multilang-video')
        }),
        el(MediaUploadCheck, {},
          el(MediaUpload, {
            onSelect: function(media){ if (media && media.url) set('src', media.url); },
            allowedTypes: ['video'],
            render: function(obj){
              return el(Button, { onClick: obj.open, variant:'secondary' }, __('Select video', 'pp-multilang-video'));
            }
          })
        )
      ),
      el('div', { style:{display:'grid', gridTemplateColumns:'1fr auto', gap:'8px', alignItems:'end', marginTop:'8px'} },
        el(TextControl, {
          label: __('Captions (VTT) URL (optional)', 'pp-multilang-video'),
          value: item.caption || '',
          onChange: function(v){ set('caption', v); }
        }),
        el(MediaUploadCheck, {},
          el(MediaUpload, {
            onSelect: function(media){ if (media && media.url) set('caption', media.url); },
            allowedTypes: ['text/vtt', 'text'],
            render: function(obj){
              return el(Button, { onClick: obj.open, variant:'secondary' }, __('Select VTT', 'pp-multilang-video'));
            }
          })
        )
      ),
      el('div', { style:{marginTop:'8px', textAlign:'right'} },
        el(Button, { isDestructive:true, onClick: remove }, __('Remove', 'pp-multilang-video'))
      )
    );
  }

  registerBlockType('pp/multilang-video', {
    edit: function(props){
      var atts = props.attributes;
      var setAtt = function(k,v){ var n={}; n[k]=v; props.setAttributes(n); };

      function addItem(){
        var next = (atts.items || []).slice();
        next.push({ lang:'', label:'', src:'', caption:'' });
        setAtt('items', next);
      }

      var itemsEl = (atts.items || []).map(function(item, i){
        return el(ItemRow, { key:i, index:i, item:item, items:atts.items, onChange:function(next){ setAtt('items', next); } });
      });

      return el(Fragment, {},
        el(InspectorControls, {},
          el(PanelBody, { title: __('Player Options', 'pp-multilang-video'), initialOpen:true },
            el(SelectControl, {
              label: __('UI style', 'pp-multilang-video'),
              value: atts.ui || 'buttons',
              options: [
                { label: __('Buttons', 'pp-multilang-video'), value:'buttons' },
                { label: __('Dropdown', 'pp-multilang-video'), value:'select' }
              ],
              onChange: function(v){ setAtt('ui', v); }
            }),
            el(ToggleControl, {
              label: __('Require language selection before playback', 'pp-multilang-video'),
              checked: !!atts.require_select,
              onChange: function(v){ setAtt('require_select', v); }
            }),
            el(ToggleControl, {
              label: __('Show native video controls', 'pp-multilang-video'),
              checked: !!atts.controls,
              onChange: function(v){ setAtt('controls', v); }
            }),
            el(ToggleControl, {
              label: __('Muted on load', 'pp-multilang-video'),
              checked: !!atts.muted,
              onChange: function(v){ setAtt('muted', v); }
            }),
            el(SelectControl, {
              label: __('Preload', 'pp-multilang-video'),
              value: atts.preload || 'metadata',
              options: [
                { label:'metadata', value:'metadata' },
                { label:'auto', value:'auto' },
                { label:'none', value:'none' }
              ],
              onChange: function(v){ setAtt('preload', v); }
            }),
            el(TextControl, {
              label: __('Default language key (e.g. en)', 'pp-multilang-video'),
              value: atts.default || '',
              onChange: function(v){ setAtt('default', v.trim()); }
            })
          ),
          el(PanelBody, { title: __('Layout', 'pp-multilang-video'), initialOpen:false },
            el(TextControl, {
              label: __('Width (CSS)', 'pp-multilang-video'),
              value: atts.width || '100%',
              onChange: function(v){ setAtt('width', v); }
            }),
            el(TextControl, {
              label: __('Height (CSS)', 'pp-multilang-video'),
              value: atts.height || '',
              onChange: function(v){ setAtt('height', v); }
            }),
            el('div', { style:{display:'grid', gridTemplateColumns:'1fr auto', gap:'8px', alignItems:'end'} },
              el(TextControl, {
                label: __('Poster URL', 'pp-multilang-video'),
                value: atts.poster || '',
                onChange: function(v){ setAtt('poster', v); }
              }),
              el(MediaUploadCheck, {},
                el(MediaUpload, {
                  onSelect: function(media){ if (media && media.url) setAtt('poster', media.url); },
                  allowedTypes: ['image'],
                  render: function(obj){
                    return el(Button, { onClick: obj.open, variant:'secondary' }, __('Select poster', 'pp-multilang-video'));
                  }
                })
              )
            )
          )
        ),

        el('div', { className:'ppmlv-editor' },
          el('div', { style:{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px'} },
            el('h3', null, __('Languages & Files', 'pp-multilang-video')),
            el(Button, { variant:'primary', onClick: addItem }, __('Add language', 'pp-multilang-video'))
          ),
          itemsEl.length ? itemsEl : el('p', null, __('Add at least one language with a video file.', 'pp-multilang-video')),
          el('div', { style:{marginTop:'12px', padding:'10px', border:'1px dashed #ccc', borderRadius:'8px', background:'#fafafa'} },
            el('strong', null, __('Preview hint:', 'pp-multilang-video')),
            el('span', { style:{marginLeft:'6px'} }, __('This block is server-rendered on the front end; in-editor shows settings only.', 'pp-multilang-video'))
          )
        )
      );
    },
    save: function(){ return null; }
  });

  // Register the editorScript handle that block.json references
  // (WP automatically handles this when register_block_type reads block.json in PHP and maps "editorScript" to this handle.)
  wp.domReady(function(){});
})(window.wp);
