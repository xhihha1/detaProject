let fileMng = {}

fileMng.files = []

const filesListUI = document.getElementById('filesList');
const flexdivRight = document.querySelector('.flexdivRight');
const imageExtensionsRegex = /\.(jpg|jpeg|png|gif|bmp|svg|webp)$/i;
const audioExtensionsRegex = /\.(mp3|wav|ogg|flac|m4a|m4u)$/i;
const videoExtensionsRegex = /\.(mp4|mov|avi|mkv|flv|wmv|webm)$/i;

fileMng.deleteMedia = function (name) {
  flexdivRight.innerHTML = ''
  fetch(`/file/media/${name}`, {
    method: 'DELETE'
  })
  .then(response => response.json())
  .then(data => {
    fileMng.callMessages('Success', 'success')
  })
}

fileMng.playShow = function (name) {
  const path = `/file/media/${name}`;
  if (name.match(imageExtensionsRegex)) {
    fileMng.playImg(path)
  } else if (name.match(audioExtensionsRegex)) {
    fileMng.playAudio(path)
  } else if (name.match(videoExtensionsRegex)) {
    fileMng.playVideo(path)
  } else {
    flexdivRight.innerHTML = ''
  }
}

fileMng.playVideo = function (name) {
  flexdivRight.innerHTML = ''
  const audioPlay = document.createElement('video');
  audioPlay.src = name;
  audioPlay.controls =true;
  audioPlay.autoplay =true;
  flexdivRight.appendChild(audioPlay);
}

fileMng.playAudio = function (name) {
  flexdivRight.innerHTML = ''
  const audioPlay = document.createElement('audio');
  audioPlay.src = name;
  audioPlay.controls =true;
  audioPlay.autoplay =true;
  flexdivRight.appendChild(audioPlay);
}

fileMng.playImg = function (name) {
  flexdivRight.innerHTML = ''
  const audioPlay = document.createElement('img');
  audioPlay.src = name;
  flexdivRight.appendChild(audioPlay);
}

fileMng.getFilelist = function (item) {
  const li = document.createElement('li');
  li.className = 'fileLi';
  // li.dataset.messageId = message.key;
  const span = document.createElement('span');
  span.innerText = item;
  const div = document.createElement('div');
  const buttonShow = document.createElement('button');
  buttonShow.className = 'fileShow';
  buttonShow.dataset.key = item;
  buttonShow.innerText = '👁';
  const buttonDel = document.createElement('button');
  // const txt = document.createTextNode("\u00D7");
  buttonDel.className = 'fileDelt';
  buttonDel.dataset.key = item;
  buttonDel.innerText = '✘';
  // buttonDel.appendChild(txt);
  li.appendChild(span);
  li.appendChild(div);
  li.appendChild(buttonShow);
  li.appendChild(buttonDel);
  filesListUI.appendChild(li);
  buttonShow.addEventListener('click', () => {
    fileMng.playShow(item);
  });
  buttonDel.addEventListener('click', () => {
    fileMng.deleteMedia(item);
  });
}

fileMng.getFiles = function (last, size) {
  if (!last && fileMng.files.length > 0) {
    last = fileMng.files[fileMng.files.length - 1]
  }
  let param = ''
  param += last ? `last=${last}` : '';
  param += size ? `size=${size}` : '';
  fetch(`/file/list?${param}`)
    .then(response => response.json())
    .then(data => {
      // 清空留言板
      filesListUI.innerHTML = '';
      // 显示每个留言
      if (data.files) {
        fileMng.files.concat(data.files);
        data.files.forEach(item => {
          fileMng.getFilelist(item)
        });
      }
    })
    .catch(error => {
      console.error('Error fetching messages:', error);
    });
}

fileMng.callMessages = function (msg, type = '') {
  let msgAreaDiv = document.getElementById('msgArea');
  if (!msgAreaDiv) {
    msgAreaDiv = document.createElement('div');  
    msgAreaDiv.setAttribute('id', 'msgArea');
    document.body.appendChild(msgAreaDiv);
  }
  msgAreaDiv.style.position = 'fixed';
  msgAreaDiv.style.top = '50px';
  msgAreaDiv.style.right = '0px';
  msgAreaDiv.style.width = '300px';
  // msgAreaDiv.style.textAlign = '';
  const newBtn = document.createElement('alert-messages');
  newBtn.setAttribute('label', type)
  const z = document.createTextNode(msg);
  newBtn.appendChild(z)
  msgAreaDiv.appendChild(newBtn)
}