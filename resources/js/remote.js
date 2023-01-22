/* Scripts for Boarderly remote */
const socket = io({ forceBase64: true });
const snd_button_push = new Howl({
  src: ['/resources/sounds/cork-85200.mp3']
});

const __boarderly = JSON.parse(localStorage.getItem('boarderly'));

const fileInput = document.querySelector('input[type="file"]');
const preview = document.querySelector('img.preview');
const reader = new FileReader();

fileInput.addEventListener('change', handleSelected);

document.addEventListener('DOMContentLoaded', function (e) {
  // see if the sender has used it before
  if (__boarderly.fname && __boarderly.lname) {
    __fname.value = __boarderly.fname;
    __lname.value = __boarderly.lname;

    preview.src = __boarderly.image;
    showElement('avatar_preview');
    hideElement('btn_save');
    showElement('btn_reset');

    // pre-populate the message from field
    __from.value = `${__boarderly.fname} ${__boarderly.lname}`;
    //__message.focus();
  }

  socket.emit('REFRESH_TASKS');
  socket.on('REFRESH_TASKS', refreshTasks);
});


function sendMessage() {
  if (!__from.value || !__message.value) return false

  let d = new Date()
  socket.emit('POST_MESSAGE', {
    from: __from.value,
    message: __message.value,
    date: d.toLocaleString(),
    device_token: __boarderly.token,
    image: __boarderly.image
  })

  hideElement('btn_send');
  setElementText('message_answer', 'Message sent!');
}

function showSection(section) {
  snd_button_push.play();

  hideElement('c_top');
  showElement(section);
  showElement('btn_back');

  return false;
}

function sendPush(btn) {
  snd_button_push.play();
  socket.emit('BUTTON_PUSHED', {
    button: btn
  });
}

function refreshTasks(data) {
  const task_block = document.getElementById('task_block');

  for (let i = 0; i < data.length; i++) {
    const task = document.createElement('div');
    const l = document.createElement('span');
    const r = document.createElement('span');

    l.innerHTML = data[i].task;

    if (data[i].status === 'complete') {
      l.style.textDecoration = 'line-through';
      r.innerHTML = '<input type="checkbox" style="width: 20px; height: 20px;" checked="true" />';
    } else {
      r.innerHTML = `<input type="checkbox" style="width: 20px; height: 20px;" onclick="completeTask('${data[i].id}')" />`;
    }

    task.appendChild(l);
    task.appendChild(r);
    task.classList.add('task');

    task_block.appendChild(task);
  }
}

function addTask() {
  // clear the list and rebuild
  while (document.getElementById('task_block').firstChild) {
    document.getElementById('task_block').removeChild(document.getElementById('task_block').firstChild);
  }

  const new_task = document.getElementById('new_task');

  if (new_task.value.length == 0) return;

  let d = new Date()
  socket.emit('POST_TASK', {
    task: new_task.value,
    date: d.toLocaleString(),
    device_token: __boarderly.token
  })

  socket.emit('REFRESH_TASKS');
}

function completeTask(id) {
  socket.emit('COMPLETE_TASK', {
    id: id
  });
}

function registerDevice() {
  if (!__fname.value || !__lname.value) {
    return false;
  }

  const data = {};
  data.fname = __fname.value;
  data.lname = __lname.value;
  data.file_name = document.getElementById('contact_pic').files[0].name;
  data.image = reader.result;
 
  socket.emit('REGISTER_DEVICE', data, function(response) {
    data.token = response.token;
    //__boarderly.device_token = data.token;
  });

  localStorage.setItem('boarderly', JSON.stringify(data));

  hideElement('btn_save');
  setElementText('register_answer', 'Thanks for registering!');
  showElement('register_answer');
}

function resetDevice() {
  __fname.value = '';
  __lname.value = '';
  preview.src = null;
  hideElement('avatar_preview');

  localStorage.removeItem('boarderly');

  hideElement('btn_reset');
  hideElement('btn_save');
}

function handleEvent(e) {
  if (e.type === "load") {
    preview.src = reader.result;
    showElement('avatar_preview');
    showElement('btn_save');
  }
}

function addListeners(reader) {
  reader.addEventListener('load', handleEvent);
}

function handleSelected(e) {
  const selectedFile = fileInput.files[0];
  if (selectedFile) {
    addListeners(reader);
    reader.readAsDataURL(selectedFile);
  }
}

function showElement(element) {
  document.getElementById(element).classList.remove('hidden');
  return;
}

function hideElement(element) {
  document.getElementById(element).classList.add('hidden');
  return;
}

function setElementText(element, text) {
  document.getElementById(element).innerHTML = text;
  return;
}