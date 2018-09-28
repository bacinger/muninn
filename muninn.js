// We use https://jscompress.com to compress our script so you can test
// if this script is indeed the same script as the minified version we
// published on https://cdn.simpleanalytics.io/hello.js

(function(window,d){
  try {
    if (!window) return;
    var nav = window.navigator;
    var loc = window.location;
    var doc = window.document;
    var userAgent = nav.userAgent;
    var lastSendUrl;
    
    // We do advanced bot detection in our API, but this line filters already most bots
    if (userAgent.search(/(bot|spider|crawl)/ig) > -1) return;

    var post = function() {
      // Obfuscate personal data in URL by dropping the search and hash
      var url = loc.protocol + '//' + loc.hostname + loc.pathname;

      // Don't send the last URL again (this could happen when pushState is used to change the URL hash or search)
      if (lastSendUrl === url) return;
      lastSendUrl = url;

      // Skip prerender requests
      if ('visibilityState' in doc && doc.visibilityState === 'prerender') return;

      // Don't track when Do Not Track is set to true
      if ('doNotTrack' in nav && nav.doNotTrack === '1') return;
  
      // From the search we grab the utm_source and ref and save only that
      var refMatches = loc.search.match(/[?&](utm_source|source|ref)=([^?&]+)/gi);
      var refs = refMatches ? refMatches.map(function(m) { return m.split('=')[1] }) : [];

      var data = { source: 'js', url: url };
      if (userAgent) data.ua = userAgent;
      if (refs && refs[0]) data.urlReferrer = refs[0];
      if (doc.referrer) data.referrer = doc.referrer;
      if (window.innerWidth) data.width = window.innerWidth;
      if (window.innerHeight) data.height = window.innerHeight;

      var request = new XMLHttpRequest();
      request.open('POST', d + '/post', true);

      // We use content type text/plain here because we don't want to send an
      // pre-flight OPTIONS request
      request.setRequestHeader('Content-Type', 'text/plain; charset=UTF-8');
      request.send(JSON.stringify(data));
    }

    // Thanks to https://gist.github.com/rudiedirkx/fd568b08d7bffd6bd372
    var his = window.history;
    if (his && his.pushState && Event && window.dispatchEvent) {
      var stateListener = function(type) {
        var orig = his[type];
        return function() {
          var rv = orig.apply(this, arguments);
          var event = new Event(type);
          event.arguments = arguments;
          window.dispatchEvent(event);
          return rv;
        };
      };
      his.pushState = stateListener('pushState');
      window.addEventListener('pushState', function() {
        post();
      });
    }

    post();
  } catch (e) {
    if (console && console.error) console.error(e);
    var bodies = document.getElementsByTagName('body');
    var img = new Image();
    var url = d + '/hello.gif';
    if (e && e.message) url = url + '?error=' + encodeURIComponent(e.message);
    img.src = url;
    img.alt = '';
    if (bodies[0]) bodies[0].appendChild(img);
  }
})(window, 'https://api.simpleanalytics.io');