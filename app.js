// Set this to the HTTPS URL where your backend is hosted.
const API_BASE = const API_BASE = "https://jarvis-backbend-4.onrender.com"; 
const $ = id => document.getElementById(id);
const messages = $("messages");
let recognition = null, listening = false;

function add(text,user=false){const r=document.createElement("div");r.className="msg "+(user?"user":"");const b=document.createElement("div");b.className="bubble";b.textContent=text;r.appendChild(b);messages.appendChild(r);messages.scrollIntoView({behavior:"smooth",block:"nearest"})}
function speak(text){if(!speechSynthesis)return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.rate=.9;u.pitch=.86;speechSynthesis.speak(u)}

function runShortcut(name,input){
  // Apple Shortcuts URL scheme. The shortcut must already exist on the iPhone.
  const url = "shortcuts://run-shortcut?name="+encodeURIComponent(name)+"&input="+encodeURIComponent(input||"");
  window.location.href=url;
}

async function send(text=$("input").value){
  text=text.trim(); if(!text)return;
  $("input").value=""; $("transcript").textContent=text; add(text,true);
  $("state").textContent="PROCESSING"; $("label").textContent="PROCESSING…";
  try{
    const r=await fetch(API_BASE+"/jarvis",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:text})});
    if(!r.ok) throw new Error("Backend error");
    const data=await r.json();
    add(data.reply,false); speak(data.reply);
    $("state").textContent="ONLINE"; $("label").textContent="TAP TO SPEAK";
    if(data.action && data.action!=="none" && data.shortcut){
      setTimeout(()=>runShortcut(data.shortcut,data.input),350);
    }
  }catch(e){
    const msg="I can't reach my AI backend. Check the backend URL and internet connection.";
    add(msg,false); speak(msg); $("state").textContent="OFFLINE"; $("label").textContent="RETRY";
  }
}

$("send").onclick=()=>send();
$("input").addEventListener("keydown",e=>{if(e.key==="Enter")send()});
$("clear").onclick=()=>messages.innerHTML="";
document.querySelectorAll("[data-cmd]").forEach(b=>b.onclick=()=>{ $("input").value=b.dataset.cmd; send(); });

function setupSpeech(){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){$("transcript").textContent="Voice input is unavailable here. Use the text field or an iPhone Shortcut.";return}
  recognition=new SR(); recognition.lang="en-US"; recognition.interimResults=true; recognition.continuous=false;
  recognition.onstart=()=>{listening=true;document.body.classList.add("listening");$("state").textContent="LISTENING";$("label").textContent="LISTENING…"};
  recognition.onresult=e=>{let t="";for(const x of e.results)t+=x[0].transcript;$("input").value=t;$("transcript").textContent=t};
  recognition.onerror=()=>stop();
  recognition.onend=()=>{if(listening){stop();if($("input").value.trim())send()}};
}
function stop(){listening=false;document.body.classList.remove("listening");$("state").textContent="ONLINE";$("label").textContent="TAP TO SPEAK"}
$("mic").onclick=()=>{if(!recognition)setupSpeech();if(!recognition)return;if(listening){recognition.stop();stop()}else recognition.start()};
add("Systems online. How can I assist you?",false); setupSpeech();
// ===== JARVIS V2 VISUAL CORE =====

const jarvisV2Style = document.createElement("style");

jarvisV2Style.textContent = `
#mic {
  position: relative;
  transition: transform .25s ease, box-shadow .25s ease;
}

#mic.jarvis-active {
  animation: jarvisPulse 1.2s infinite;
  box-shadow: 0 0 15px #2196ff, 0 0 35px #2196ff;
  transform: scale(1.06);
}

@keyframes jarvisPulse {
  0%,100% {
    box-shadow: 0 0 10px #2196ff, 0 0 20px #2196ff;
  }
  50% {
    box-shadow: 0 0 25px #2196ff, 0 0 55px #2196ff;
  }
}
`;

document.head.appendChild(jarvisV2Style);

// Watch JARVIS status
const jarvisState = document.getElementById("state");
const jarvisMic = document.getElementById("mic");

if (jarvisState && jarvisMic) {

  const updateJarvisVisual = () => {

    const state = jarvisState.textContent.toUpperCase();

    if (
      state.includes("LISTEN") ||
      state.includes("PROCESS") ||
      state.includes("THINK")
    ) {
      jarvisMic.classList.add("jarvis-active");
    } else {
      jarvisMic.classList.remove("jarvis-active");
    }
  };

  const observer = new MutationObserver(updateJarvisVisual);

  observer.observe(jarvisState, {
    childList: true,
    characterData: true,
    subtree: true
  });

  updateJarvisVisual();
}
// ===== JARVIS V2 HUD STATES =====

const core = document.getElementById("core");
const stateEl = document.getElementById("state");

const hudStyle = document.createElement("style");

hudStyle.textContent = `
/* Fix iPhone header spacing */
header {
  padding-top: 10px;
  min-height: 58px;
}

.brand {
  font-size: 24px;
  letter-spacing: 6px;
  white-space: nowrap;
}

/* JARVIS CORE STATES */
#core {
  transition: transform .4s ease, filter .4s ease;
}

#core.state-online {
  animation: coreIdle 3s ease-in-out infinite;
}

#core.state-listening {
  animation: coreListening 1.1s ease-in-out infinite;
  filter: drop-shadow(0 0 18px #1597ff);
}

#core.state-processing {
  animation: coreThinking .65s linear infinite;
  filter: drop-shadow(0 0 28px #1597ff);
}

#core.state-speaking {
  animation: coreSpeaking .8s ease-in-out infinite;
  filter: drop-shadow(0 0 35px #67c4ff);
}

@keyframes coreIdle {
  0%,100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.025);
  }
}

@keyframes coreListening {
  0%,100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.07);
  }
}

@keyframes coreThinking {
  from {
    transform: rotate(0deg) scale(1);
  }
  to {
    transform: rotate(360deg) scale(1.04);
  }
}

@keyframes coreSpeaking {
  0%,100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

/* Extra energy glow */
#core.state-listening .inner {
  box-shadow:
    0 0 30px #1597ff88,
    0 0 65px #1597ff55;
}

#core.state-processing .inner {
  box-shadow:
    0 0 40px #1597ffcc,
    0 0 80px #1597ff66;
}

#core.state-speaking .inner {
  box-shadow:
    0 0 45px #67c4ffcc,
    0 0 100px #1597ff77;
}
`;

document.head.appendChild(hudStyle);

function updateCoreState() {
  if (!core || !stateEl) return;

  const state = stateEl.textContent.trim().toUpperCase();

  core.classList.remove(
    "state-online",
    "state-listening",
    "state-processing",
    "state-speaking"
  );

  if (state.includes("LISTEN")) {
    core.classList.add("state-listening");
  }
  else if (
    state.includes("PROCESS") ||
    state.includes("THINK")
  ) {
    core.classList.add("state-processing");
  }
  else if (
    state.includes("SPEAK")
  ) {
    core.classList.add("state-speaking");
  }
  else {
    core.classList.add("state-online");
  }
}

if (stateEl && core) {
  const coreObserver = new MutationObserver(updateCoreState);

  coreObserver.observe(stateEl, {
    childList: true,
    characterData: true,
    subtree: true
  });

  updateCoreState();
}
