const colorConsoleLog = '#3aa757';
const ele_toast = document.createElement('div');
const script = document.createElement('script');
const items = document.querySelectorAll('.item > .clearfix');
let socket;
// show log extention active tabs nettuyen
console.log('%cExtention Download Nettuyen Is Active!',`color: ${colorConsoleLog}`);
// main code
// query all card story
document.getElementById('aspnetForm').addEventListener('submit', function(e) { e.preventDefault(); });


function startWS() {
  let ws = new WebSocket('ws://127.0.0.1:3300');
  ws.onopen = function () {
    // connection is opened and ready to use
    console.log('Websoket is has been connection@!');
    socket = this;
  };
  
  ws.onerror = function (error) {
    // an error occurred when sending/receiving data
    console.log('Websoket is error connection@!');
  };
  
  ws.onmessage = function (message) {
    // handle incoming message
    if(message.data === 'COMPLETE') {
      console.log('Download is Successfull!');
      // callToast(3000, 'remove');
    }else {
      console.log('Download is Failure!');
    }
  };

  ws.onclose = function () {
    // connection is opened and ready to use
    console.log('Sever is close... => Start Reconnect!');
    ws = null;
    setTimeout(startWS, 2000);
  };

}
// start web socket
startWS();

for(let item of items) {
  // create button 
  const event_btn = createButton(item);
  // listener btn
  event_btn.addEventListener('click', handleBtn);
}

function createButton(obj) {
  /*
    create button for one of element manga
  */ 
  const classBtn = 'miru__btn';
  const nameBtn = 'Tải Xuống';
  const el_btn = document.createElement('button');
  const link_story = obj.querySelector('figcaption a').getAttribute('href');
  const name_story = obj.querySelector('figcaption a').textContent;
  el_btn.setAttribute('data-href', link_story);
  el_btn.setAttribute('name-story', name_story);
  el_btn.className = classBtn;
  el_btn.innerText = nameBtn;
  obj.appendChild(el_btn);
  return el_btn;
}

// handle click by btn download story
async function handleBtn(event) {
  const link_story = event.target.getAttribute('data-href');
  const name_story = event.target.getAttribute('name-story');
  // clear story
  story = new Object();
  // turn on message toast
  if(document.querySelectorAll('.miru__toast')) {
    document.querySelectorAll('.miru__toast').forEach(ele => {
      ele.remove();
    })
  }
  // upadateProcessToast(ele_toast, name_story, 0);
  ele_toast.classList.add('miru__toast');
  // callToast(300, 'add');
  document.querySelector('body').appendChild(ele_toast);
  callSocket(link_story);
}


function callSocket(URL_Manga) {
  socket.send(JSON.stringify({ linkManga: URL_Manga }));
}

function callToast(time, cmd) {
  setTimeout(() => {
    ele_toast.classList[cmd]('miru__toast--in');
  }, time)
}

function upadateProcessToast(percent, element = ele_toast, name_story = story.name) {
  element.innerHTML = '';
  element.innerHTML = `
    <h1 class="status">Đang tải: ${percent}%</h1>
    <p class="name_story">Tên: ${name_story}</p>
    <span style="width: ${percent}%;"></span>
  `;
}
