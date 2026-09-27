// Set this to the HTTPS URL where your backend is hosted.
const API_BASE = "https://YOUR-JARVIS-BACKEND.example.com";

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
