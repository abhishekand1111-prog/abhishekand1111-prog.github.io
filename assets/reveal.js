/* Pins and scroll reveals for the inner pages.
   Pass the cards to pin with data-pin on <body> (a CSS selector list); every section's direct children
   and every pinned card rise or drop in as they come on screen, one after another within a group. */
(function(){
  "use strict";
  var body = document.body;
  var pinSel = body.getAttribute('data-pin') || '';
  var tilt = 0;
  if (pinSel){
    [].forEach.call(document.querySelectorAll(pinSel), function(el){
      el.classList.add('pin', 'reveal', 'tilt-' + (tilt++ % 4 + 1));
    });
  }
  // Section headings and text that aren't pinned rise in.
  [].forEach.call(document.querySelectorAll('.sec > *'), function(el){
    if (!el.classList.contains('pin') && !el.querySelector('.pin, form, #cbForm')) el.classList.add('reveal');
  });
  // Stagger siblings.
  var items = [].slice.call(document.querySelectorAll('.reveal'));
  items.forEach(function(el){
    var i = 0, p = el.previousElementSibling;
    while (p){ if (p.classList.contains('reveal')) i++; p = p.previousElementSibling; }
    if (i) el.style.setProperty('--d', Math.min(i * 0.12, 0.6) + 's');
  });
  document.documentElement.classList.add('js');

  var pending = items, ticking = false;
  function check(){
    ticking = false;
    var line = window.innerHeight * 0.9;
    pending = pending.filter(function(el){
      var r = el.getBoundingClientRect();
      // Hidden elements (zero size) are revealed straight away so nothing stays invisible.
      if (r.top < line || (!r.width && !r.height)){ el.classList.add('in'); return false; }
      return true;
    });
    if (!pending.length){ window.removeEventListener('scroll', on); window.removeEventListener('resize', on); }
  }
  function on(){ if (!ticking){ ticking = true; setTimeout(check, 60); } }
  window.addEventListener('scroll', on, { passive:true });
  window.addEventListener('resize', on);
  check();
})();
