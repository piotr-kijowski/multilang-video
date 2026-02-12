(function(){
  function getQueryLang(){
    var m = location.search.match(/[?&]lang=([a-zA-Z-]+)/);
    return m ? m[1].toLowerCase() : null;
  }

  function setVideoSrc(video, url, langKey, captionUrl, wasPlaying, time) {
    video.querySelectorAll('track').forEach(function(t){ t.remove(); });
    var source = video.querySelector('source');
    if (!source) { source = document.createElement('source'); video.appendChild(source); }

    var mime = 'video/mp4';
    if (url.endsWith('.webm')) mime = 'video/webm';
    if (url.endsWith('.m3u8')) mime = 'application/vnd.apple.mpegurl';
    if (url.endsWith('.ogv') || url.endsWith('.ogg')) mime = 'video/ogg';

    source.setAttribute('src', url);
    source.setAttribute('type', mime);

    if (captionUrl) {
      var tr = document.createElement('track');
      tr.setAttribute('kind','subtitles');
      tr.setAttribute('srclang', langKey);
      tr.setAttribute('src', captionUrl);
      tr.setAttribute('default','');
      video.appendChild(tr);
    }

    video.load();
    video.addEventListener('loadedmetadata', function handler(){
      video.removeEventListener('loadedmetadata', handler);
      try { if (!isNaN(time) && time > 0 && time < video.duration) video.currentTime = time; } catch(e){}
      if (wasPlaying) video.play().catch(function(){});
    });
  }

  function initInstance(id, data){
    var root = document.getElementById(id);
    if (!root) return;
    var video = root.querySelector('video');
    if (!video) return;

    var overlay = root.querySelector('.ppmlv-overlay');
    var storageKey = 'ppmlv_lang_' + id;
    var queryLang = getQueryLang();
    var saved = localStorage.getItem(storageKey);
    var lang = (queryLang || saved || data.default || '').toLowerCase();
    if (!data.langs[lang]) lang = data.default;

    var buttons = root.querySelectorAll('.ppmlv-btn');
    var select = root.querySelector('.ppmlv-select');

    function updateUI(activeLang){
      buttons.forEach(function(btn){
        btn.setAttribute('aria-pressed', btn.getAttribute('data-lang') === activeLang ? 'true' : 'false');
      });
      if (select) select.value = activeLang;
    }

    function choose(newLang, autoPlay){
      if (!data.langs[newLang]) return;
      var wasPlaying = autoPlay ? true : (!video.paused && !video.ended);
      var time = video.currentTime || 0;
      localStorage.setItem(storageKey, newLang);
      updateUI(newLang);
      setVideoSrc(video, data.langs[newLang], newLang, data.captions ? data.captions[newLang] : null, wasPlaying, time);
    }

    if (data.require_select) {
      if (queryLang || saved) {
        updateUI(lang);
        if (overlay) overlay.remove();
        video.removeAttribute('data-ppmlv-locked');
        choose(lang, false);
      } else {
        function blockUntilChosen(e){
          if (video.hasAttribute('data-ppmlv-locked')) {
            e.preventDefault(); e.stopImmediatePropagation();
            if (overlay) overlay.style.display = 'flex';
          }
        }
        video.addEventListener('play', blockUntilChosen, true);
        video.addEventListener('click', blockUntilChosen, true);

        if (overlay) {
          overlay.addEventListener('click', function(e){
            if (e.target.classList.contains('ppmlv-overlay-btn')) {
              var chosen = e.target.getAttribute('data-lang');
              updateUI(chosen);
              video.removeAttribute('data-ppmlv-locked');
              overlay.remove();
              choose(chosen, true);
            }
          });
        }
      }
    } else {
      var currentSrc = (video.querySelector('source') || {}).src || '';
      var wantSrc = data.langs[lang] || '';
      updateUI(lang);
      if (wantSrc && currentSrc !== wantSrc) {
        setVideoSrc(video, wantSrc, lang, data.captions ? data.captions[lang] : null, false, 0);
      }
    }

    buttons.forEach(function(btn){
      btn.addEventListener('click', function(){ choose(btn.getAttribute('data-lang'), false); });
      btn.addEventListener('keydown', function(e){
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          var keys = Object.keys(data.langs);
          var idx = keys.indexOf(btn.getAttribute('data-lang'));
          if (idx === -1) return;
          var next = e.key === 'ArrowRight' ? (idx+1)%keys.length : (idx-1+keys.length)%keys.length;
          choose(keys[next], false);
        }
      });
    });
    if (select) select.addEventListener('change', function(){ choose(select.value, false); });
  }

  document.addEventListener('DOMContentLoaded', function(){
    if (!window.PPMLV) return;
    Object.keys(PPMLV).forEach(function(id){
      try { initInstance(id, PPMLV[id]); } catch(e){}
    });
  });
})();
