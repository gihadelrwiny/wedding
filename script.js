// ==========================================
// 1. Countdown to 30 Nov 2026 18:00 local
// ==========================================
(function(){
  const target = new Date('2026-11-30T18:00:00').getTime();
  const d = document.getElementById('cd-d');
  const h = document.getElementById('cd-h');
  const m = document.getElementById('cd-m');
  const s = document.getElementById('cd-s');
  
  function tick(){
    const now = Date.now();
    let diff = Math.max(0, target - now);
    const days = Math.floor(diff / 86400000); diff -= days*86400000;
    const hrs  = Math.floor(diff / 3600000);  diff -= hrs*3600000;
    const mins = Math.floor(diff / 60000);    diff -= mins*60000;
    const secs = Math.floor(diff / 1000);
    if(d) d.textContent = days;
    if(h) h.textContent = String(hrs).padStart(2,'0');
    if(m) m.textContent = String(mins).padStart(2,'0');
    if(s) s.textContent = String(secs).padStart(2,'0');
  }
  tick(); setInterval(tick, 1000);
})();

// ==========================================
// 2. Intro gate: envelope opens -> chat reveal
// ==========================================
(function(){
  var gate = document.getElementById('introGate');
  if(!gate) return;
  if(gate.style.display === 'none') return; 

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var stageEnvelope = document.getElementById('stageEnvelope');
  var stageChat = document.getElementById('stageChatIn');
  var envelope = document.getElementById('envelope');
  var chatBody = document.getElementById('chatBodyIn');
  var skipBtn = document.getElementById('introSkip');

  var messages = [
    { from: 'in', text: 'hiii 🤍' },
    { from: 'in', text: 'we have something to tell you...' },
    { from: 'in', text: "WE'RE GETTING MARRIED 💌✨" },
    { from: 'cta', text: 'Open your invitation' }
  ];

  function closeGate(){
    gate.classList.add('gate-closing');
    document.body.classList.remove('gate-active');
    try{ sessionStorage.setItem('mn-invite-seen', '1'); }catch(e){}
    setTimeout(function(){ gate.style.display = 'none'; }, 700);
  }

  function playMessages(i){
    i = i || 0;
    if(i >= messages.length) return;
    var m = messages[i];
    var typingDelay = reduceMotion ? 0 : 800;

    var typing = null;
    if(m.from !== 'cta'){
      typing = document.createElement('div');
      typing.className = 'typing-indicator';
      typing.innerHTML = '<span></span><span></span><span></span>';
      chatBody.appendChild(typing);
      chatBody.scrollTop = chatBody.scrollHeight;
    }

    setTimeout(function(){
      if(typing && typing.parentNode) typing.remove();
      var bubble = document.createElement('div');
      if(m.from === 'cta'){
        bubble.className = 'chat-cta-wrap';
        bubble.innerHTML = '<button type="button" class="chat-cta-btn" id="chatOpenBtn">' + m.text + ' <span aria-hidden="true">→</span></button>';
      } else {
        bubble.className = 'msg msg-' + m.from;
        bubble.textContent = m.text;
      }
      chatBody.appendChild(bubble);
      chatBody.scrollTop = chatBody.scrollHeight;
      requestAnimationFrame(function(){ bubble.classList.add('show'); });

      if(m.from === 'cta'){
        var openBtn = document.getElementById('chatOpenBtn');
        if(openBtn) openBtn.addEventListener('click', closeGate);
      } else {
        setTimeout(function(){ playMessages(i + 1); }, typingDelay);
      }
    }, typingDelay);
  }

  function openEnvelope(){
    if(envelope.classList.contains('open')) return;
    envelope.classList.add('open');
    var delay = reduceMotion ? 150 : 1400;
    setTimeout(function(){
      stageEnvelope.classList.add('stage-exit');
      stageChat.classList.add('stage-enter');
      playMessages(0);
    }, delay);
  }

  if(envelope) {
    envelope.addEventListener('click', openEnvelope);
    envelope.addEventListener('keypress', function(e){
      if(e.key === 'Enter' || e.key === ' '){
        e.preventDefault();
        openEnvelope();
      }
    });
  }
  if(skipBtn) skipBtn.addEventListener('click', closeGate);
})();

// ==========================================
// 3. Scroll-triggered fade-ins (.reveal)
// ==========================================
(function(){
  var els = document.querySelectorAll('.reveal');
  if(!els.length) return;
  if(!('IntersectionObserver' in window)){
    els.forEach(function(el){ el.classList.add('in-view'); });
    return;
  }
  var obs = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        entry.target.classList.add('in-view');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  els.forEach(function(el){ obs.observe(el); });
})();

// ==========================================
// 4. RSVP Handling and API Submission (بدون الرسمة)
// ==========================================
(function() {
  // تفعيل الـ Reveal للأقسام مع دعم الـ Delay التتابعي
  var revealElements = document.querySelectorAll('.reveal-section');
  if (revealElements.length) {
    if (!('IntersectionObserver' in window)) {
      revealElements.forEach(function(el) { el.classList.add('in-view'); });
    } else {
      var revealObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            var el = entry.target;
            var delay = el.getAttribute('data-delay') || 0;
            setTimeout(function() {
              el.classList.add('in-view');
            }, delay);
            revealObserver.unobserve(el);
          }
        });
      }, { threshold: 0.15 });

      revealElements.forEach(function(el) { revealObserver.observe(el); });
    }
  }

  // منطق وإدارة عناصر الفورم
  var form = document.getElementById('weddingRsvpForm');
  if (!form) return;

  var btnComing = document.getElementById('btnComing');
  var btnSending = document.getElementById('btnSending');
  var inputAttendance = document.getElementById('rsvpAttendance');
  var inputName = document.getElementById('rsvpName');
  var btnSubmit = document.getElementById('btnRsvpSubmit');
  var msgSuccess = document.getElementById('rsvpSuccessMsg');

  function selectPill(type) {
    if (type === 'coming') {
      btnComing.classList.add('selected', 'coming');
      btnSending.classList.remove('selected', 'sending');
      inputAttendance.value = 'coming';
    } else {
      btnSending.classList.add('selected', 'sending');
      btnComing.classList.remove('selected', 'coming');
      inputAttendance.value = 'sending';
    }
    checkValidation();
  }

  if(btnComing) btnComing.addEventListener('click', function() { selectPill('coming'); });
  if(btnSending) btnSending.addEventListener('click', function() { selectPill('sending'); });

  function checkValidation() {
    var isNameFilled = inputName.value.trim().length > 0;
    var isAttendanceSelected = inputAttendance.value !== "";
    btnSubmit.disabled = !(isNameFilled && isAttendanceSelected);
  }
  if(inputName) inputName.addEventListener('input', checkValidation);

  // إرسال الفورم لـ Web3Forms عبر الـ API مباشرة
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    btnSubmit.disabled = true;
    btnSubmit.innerText = "Sending...";

    var formData = new FormData(form);
    var object = Object.fromEntries(formData);
    var json = JSON.stringify(object);

    fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: json
    })
    .then(async function(response) {
        var res = await response.json();
        if (response.status == 200) {
            btnSubmit.style.display = 'none';
            msgSuccess.style.display = 'block';
        } else {
            console.log(res);
            alert("Something went wrong. Please try again!");
            btnSubmit.disabled = false;
            btnSubmit.innerText = "Confirm With Love";
        }
    })
    .catch(function(error) {
        console.log(error);
        alert("Network error. Please check your connection.");
        btnSubmit.disabled = false;
        btnSubmit.innerText = "Confirm With Love";
    });
  });
})();