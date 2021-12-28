const colorConsoleLog = '#3aa757';
const ele_toast = document.createElement('div');
let story = new Object();
// show log extention active tabs nettuyen
console.log('%cExtention Download Nettuyen Is Active!',`color: ${colorConsoleLog}`);
// main code
// query all card story
document.getElementById('aspnetForm').addEventListener('submit', function(e) { e.preventDefault(); });
const items = document.querySelectorAll('.item > .clearfix');
for(let item of items) {
  // create button 
  const event_btn = createButton(item);
  // listener btn
  event_btn.addEventListener('click', handleBtn);
}

function createButton(obj) {
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
  upadateProcessToast(ele_toast, name_story, 0);
  ele_toast.classList.add('miru__toast');
  callToast(300, 'add');
  document.querySelector('body').appendChild(ele_toast);
  // check property name in object story is exist
  if(!story.hasOwnProperty('name')) {
    story['name'] = new String();
  }
  // get name story
  story['name'] = name_story;
  const html_story = await parseHTML(link_story);
  getInfomationStory(html_story);
  getLinkChap(html_story, parserObjectChapter);
  await getLinkImage(story, parserLinkImage);
  download(story, `${new Date}.json`, 'application/json');
  callToast(3000, 'remove');
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

function parserObjectChapter(linkChapter) {
  if(!story.hasOwnProperty('data')) {
    story['data'] = [];
  }
  story['data'].push(linkChapter);
}
// download json
function download(content, fileName, contentType) {
  let a = document.createElement("a");
  let file = new Blob([JSON.stringify(content)], { type: contentType });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
}

// handle download
async function parseHTML(link) {
  const res = await fetch(link, {
    method: 'GET',
    headers: {
      'Host': 'http://www.nettruyengo.com/',
      'Referer': 'http://www.nettruyengo.com/',
      'Connection': 'keep-alive',
    }
  });
  const html = await res.text();
  const container = document.createElement('div');
  container.innerHTML = html;
  return container;
}

function parserLinkImage(element) {
  const temp_array = new Array();
  const element_image = element.querySelectorAll('.page-chapter > img[data-original]')
  for(let item of element_image) {
    const ele_src = String(item.getAttribute('src'));
    temp_array.push(ele_src);
  }
  return temp_array;
}

function getInfomationStory(element) {
  const author = String(element.querySelector('li.author .col-xs-8').textContent);
  const status = String(element.querySelector('li.status > p.col-xs-8').textContent);
  const type = () => {
    const arr = [];
    const get_ele = element.querySelectorAll('li.kind a');
    for(let item of get_ele) {
      arr.push(item.textContent);
    }
    return arr;
  }
  const details = String(element.querySelector('div.detail-content > p').textContent);
  story['author'] = author;
  story['status'] = status;
  story['type'] = type();
  story['details'] = details;
}

async function getLinkImage(story, callback) {
  const length_story = story.data.length;
  let start = 0;
  for(let [index, item] of story.data.entries()) {
    const ele_html = await parseHTML(item.link);
    story.data[index]['images'] = callback(ele_html);
    start += 1;
    upadateProcessToast(Number((100 * start) / length_story).toFixed(1));
  }
}

function getLinkChap(element, callback) {
  const ele_a = element.querySelectorAll('.chapter > a[data-id]');
  const length_ele_a = ele_a.length;
  for(let i = 0; i < length_ele_a; i++) {
    const item = ele_a[length_ele_a - (i + 1)];
    const link_chap = item.getAttribute('href');
    const number_chapter = /[C,c]hapter [0-9]*/g.exec(String(item.textContent));
    const title_chapter = String(item.textContent).split(String(number_chapter[0]))[1].split(':')[1];
    callback({ chapter: number_chapter[0], link: link_chap, title: title_chapter?.trim() || 'no-content' });
  }
}
