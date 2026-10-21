/* "Request a call back" form for the hotels and franchise pages.
   Writes the same create-only kind:'inquiry' document as the System Map page, so it shows up
   in the app's Call Requests and needs no rules change. The form's data-topic is put at the
   start of the message so the app shows where the request came from.
   On localhost it pretends to send, so the page can be tested without writing to Firestore. */
(function(){
  "use strict";
  var fy = document.getElementById('fyear'); if (fy) fy.textContent = new Date().getFullYear();

  var form = document.getElementById('cbForm'); if (!form) return;
  var LOCAL = /^(localhost|127\.0\.0\.1|)$/.test(location.hostname);
  var db = null;
  try{
    var fbApp = firebase.initializeApp({
      apiKey: "AIzaSyBbEjsvTcWKqQs5pGsSdVYTxWtwKdr3zcU",
      authDomain: "diahnosis-room.firebaseapp.com",
      projectId: "diahnosis-room",
      storageBucket: "diahnosis-room.firebasestorage.app",
      messagingSenderId: "197732013160",
      appId: "1:197732013160:web:86f938ffbabb1858fa57dd"
    }, 'systemmap');
    db = fbApp.firestore();
  }catch(e){ db = null; }

  function newId(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,10); }
  function normPhone(v){
    var d = String(v||'').replace(/[\s\-().]/g,'');
    if (/^\+91/.test(d)) d = d.slice(3); else if (/^91\d{10}$/.test(d)) d = d.slice(2); else if (/^0\d{10}$/.test(d)) d = d.slice(1);
    return d;
  }
  function writeDoc(data){
    if (LOCAL) return new Promise(function(r){ setTimeout(r, 400); });
    if (!db) return Promise.reject(new Error('offline'));
    var ref = db.collection('systemMaps').doc(newId());
    return new Promise(function(resolve, reject){
      var timer = setTimeout(function(){ reject(new Error('timeout')); }, 15000);
      ref.set(data).then(function(){ clearTimeout(timer); resolve(); }, function(e){ clearTimeout(timer); reject(e); });
    });
  }

  var errBox = document.getElementById('cbError'), btn = document.getElementById('cbSubmit'), when = '';
  var topic = form.getAttribute('data-topic') || 'Website';
  var bizLabel = form.getAttribute('data-biz-label') || 'business name';
  function val(id){ var el = document.getElementById(id); return el ? el.value.trim() : ''; }

  document.getElementById('cbTimes').addEventListener('click', function(e){
    var b = e.target.closest('[data-cb-time]'); if (!b) return;
    when = when===b.dataset.cbTime ? '' : b.dataset.cbTime;
    [].forEach.call(this.querySelectorAll('[data-cb-time]'), function(x){ x.classList.toggle('on', x.dataset.cbTime===when); });
  });
  form.addEventListener('submit', function(e){
    e.preventDefault();
    var name = val('cbName'), biz = val('cbBiz'), phone = normPhone(val('cbPhone'));
    if (!name || !biz || !val('cbPhone')){ errBox.textContent = 'Please fill in your name, '+bizLabel+' and phone number.'; return; }
    if (!/^[6-9]\d{9}$/.test(phone)){ errBox.textContent = 'Enter a valid 10-digit mobile number.'; return; }
    errBox.textContent = '';
    btn.disabled = true; btn.textContent = 'Sending…';
    var extra = val('cbSize');
    writeDoc({
      v:2, kind:'inquiry', status:'new',
      contact:{ name:name.slice(0,80), phone:phone, business:biz.slice(0,80), location:val('cbLoc').slice(0,80), email:'',
        message:(topic+' call back request.'+(extra ? ' Size: '+extra+'.' : '')+(when ? ' Best time: '+when+'.' : '')+(val('cbMsg') ? ' Note: '+val('cbMsg') : '')).slice(0,1000) },
      createdAt: (window.firebase && firebase.firestore) ? firebase.firestore.FieldValue.serverTimestamp() : null
    }).then(function(){
      form.style.display = 'none';
      document.getElementById('cbThanksTime').textContent = when ? ', in the '+when.toLowerCase() : '';
      document.getElementById('cbThanks').hidden = false;
    }, function(){
      btn.disabled = false; btn.textContent = 'Request a call back';
      errBox.textContent = 'Couldn\'t send right now. Check your connection and try again.';
    });
  });
})();
