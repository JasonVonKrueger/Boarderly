/* Scripts for Boarderly remote */
const socket = io({ forceBase64: true });
const snd_button_push = new Howl({
  src: ['/resources/sounds/click.mp3']
});

const __boarderly = JSON.parse(localStorage.getItem('boarderly'));
const __fname = document.getElementById('fname');
const __lname = document.getElementById('lname');

const fileInput = document.querySelector('input[type="file"]');
const preview = document.querySelector('img.preview');
const reader = new FileReader();

fileInput.addEventListener('change', handleSelected);
btn_todo.addEventListener('click', handleTodoClicked);

document.addEventListener('DOMContentLoaded', function(e) {
  // see if the sender has used it before
  if (__boarderly.fname && __boarderly.lname && __boarderly.token) {

    // enable the other buttons
    document.querySelectorAll('.reg-req').forEach(function(b) {
      b.classList.remove('reg-req')
    });

    // pre-populate first and last name
    __fname.value = __boarderly.fname
    __lname.value = __boarderly.lname
    __fname.setAttribute('disabled', 'true')
    __lname.setAttribute('disabled', 'true')

    preview.src = __boarderly.image
    showElement('btn_reset')
    showElement('avatar_preview')
    hideElement('btn_save')
    hideElement('contact_pic')
  }

  // add click handler for button sounds
  document.querySelectorAll('.push-button').forEach(function(b) {
    b.addEventListener('click', handleButtonPush, false)
  })

  //socket.emit('REFRESH_eventS');
  socket.on('REFRESH_PLANNER_EVENTS', refreshEvents);
});

function handleButtonPush(e) {
  snd_button_push.play();
}

function goHome() {
  window.location.reload();
}

function sendMessage() {
  if (!__boarderly.fname || !__boarderly.lname || !__boarderly.token) return false;

  let d = new Date()
  socket.emit('POST_MESSAGE', {
    from: `${__boarderly.fname} ${__boarderly.lname}`,
    message: __message.value,
    date: d.toLocaleString(),
    token: __boarderly.token,
    file_name: __boarderly.file_name
  });

  hideElement('btn_send');
  setElementText('message_answer', 'Message sent!');
}

function showSection(section) {
  hideElement('section_top');
  showElement(section);
  showElement('btn_back');

  return false;
}

function sendPush(btn) {
  snd_button_push.play()
  socket.emit('BUTTON_PUSHED', { button: btn })
}

function handleTodoClicked() {
  socket.emit('REFRESH_PLANNER_EVENTS')
  hideElement('section_top')
  showElement('c_todo')
  showElement('btn_back')
}

function refreshEvents(data) {
  const event_block = document.getElementById('event_block')

  for (let i = 0; i < data.length; i++) {  
    const event = document.createElement('div')
    const l = document.createElement('span')
    const r = document.createElement('span')

    l.innerHTML = data[i].event;
    r.innerHTML = `<span class="material-symbols-outlined" style="cursor: pointer; color: #cf5e5e;" onclick="deleteEvent('${data[i].id}')">delete</span>`

    event.appendChild(l);
    event.appendChild(r);
    event.classList.add('event');

    event_block.appendChild(event);
  }
}

function addEvent() {
  // clear the list and rebuild
  while (document.getElementById('event_block').firstChild) {
    document.getElementById('event_block').removeChild(document.getElementById('event_block').firstChild);
  }

  const event_subject = document.getElementById('event_subject')
  const event_date = document.getElementById('event_date')
  const event_time = document.getElementById('event_time')

  if (event_subject.value.length == 0) return;

  let d = new Date()
  socket.emit('POST_PLANNER_EVENT', {
    event: event_subject.value,
    date: event_date.value,
    time: event_time.value,
    created_by: `${__boarderly.fname} ${__boarderly.lname}`,
    created_on: d.toLocaleString(),
    token: __boarderly.token
  })

  //socket.emit('REFRESH_eventS');
}

function completeevent(id) {
  socket.emit('COMPLETE_PLANNER_EVENT', { id: id })
}

async function registerDevice() {
  if (!fname.value || !lname.value) return false
  
  // go fetch a token
  let res = await fetch('/api/gettoken');
  let json = await res.json();
  const token = json.answer;
  const data = {};
 
  data.fname = fname.value;
  data.lname = lname.value;
  data.token = token;
  data.file_name = document.getElementById('contact_pic').files[0].name;
  data.image = reader.result;

  localStorage.setItem('boarderly', JSON.stringify(data));
 
  // save to server
  socket.emit('REGISTER_DEVICE', data)

  hideElement('contact_pic');
  hideElement('btn_save');
  showElement('register_answer');
  setElementText('register_answer', 'Thanks for registering!');
}

function resetDevice() {
  localStorage.removeItem('boarderly');
  goHome();
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