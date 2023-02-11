/* Scripts for Boarderly remote */
const socket = io({ forceBase64: true });
const snd_button_push = new Howl({
  src: ['/resources/sounds/click.mp3']
});

const __boarderly = JSON.parse(localStorage.getItem('boarderly'));

const fileInput = document.querySelector('input[type="file"]');
const preview = document.querySelector('img.preview');
const reader = new FileReader();

fileInput.addEventListener('change', handleSelected);
btn_todo.addEventListener('click', handleTodoClicked);

document.addEventListener('DOMContentLoaded', function(e) {
  // see if the sender has used it before
  if (__boarderly.fname && __boarderly.lname) {
    __fname.value = __boarderly.fname;
    __lname.value = __boarderly.lname;
    __fname.setAttribute('disabled', 'true');
    __lname.setAttribute('disabled', 'true');

    preview.src = __boarderly.image;
    showElement('btn_reset');
    showElement('avatar_preview');
    hideElement('btn_save');
    hideElement('contact_pic');

    // pre-populate the message from field
    __from.value = `${__boarderly.fname} ${__boarderly.lname}`;
    //__message.focus();
  }

  //socket.emit('REFRESH_TASKS');
  socket.on('REFRESH_TASKS', refreshTasks);
});

function goHome() {
  snd_button_push.play();
  window.location.reload();
}

function sendMessage() {
  if (!__from.value || !__message.value) return false

  let d = new Date()
  socket.emit('POST_MESSAGE', {
    from: __from.value,
    message: __message.value,
    date: d.toLocaleString(),
    token: __boarderly.token,
    file_name: __boarderly.file_name
  });

  hideElement('btn_send');
  setElementText('message_answer', 'Message sent!');
}

function showSection(section) {
  snd_button_push.play();

  hideElement('section_top');
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

function handleTodoClicked() {
  socket.emit('REFRESH_TASKS');
  hideElement('section_top');
  showElement('c_todo');
  showElement('btn_back');
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

  let d = new Date();
  socket.emit('POST_TASK', {
    task: new_task.value,
    date: d.toLocaleString(),
    created_by: `${__boarderly.fname} ${__boarderly.lname}`,
    token: __boarderly.token
  });

  //socket.emit('REFRESH_TASKS');
}

function completeTask(id) {
  socket.emit('COMPLETE_TASK', {
    id: id
  });
}

async function registerDevice() {
  if (!__fname.value || !__lname.value) {
    return false;
  }

  // go fetch a token
  let res = await fetch('/api/gettoken');
  let json = await res.json();
  const token = json.answer;
  const data = {};
 
  data.fname = __fname.value;
  data.lname = __lname.value;
  data.token = token;
  data.file_name = document.getElementById('contact_pic').files[0].name;
  data.image = reader.result;

  localStorage.setItem('boarderly', JSON.stringify(data));
 
  // save to server
  socket.emit('REGISTER_DEVICE', data, function(response) {
    //data.token = response.token;
    //data.avatar_link = 'bob'; //`/devices/${data.token}/avatar`;
    //__boarderly.token = data.token;
  });

  hideElement('contact_pic');
  hideElement('btn_save');
  showElement('register_answer');
  setElementText('register_answer', 'Thanks for registering!');
}

function resetDevice() {
  __fname.value = '';
  __lname.value = '';
  preview.src = null;
  
  localStorage.removeItem('boarderly');

  showElement('contact_pic');
  hideElement('avatar_preview');
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