/* Scripts for Boarderly remote */
const socket = io({ forceBase64: true });
// const snd_button_push = new Howl({
//   src: ['/resources/sounds/click.mp3']
// })

const __boarderly = JSON.parse(localStorage.getItem('boarderly'));
const __fname = document.getElementById('fname')
const __lname = document.getElementById('lname')

const fileInput = document.querySelector('input[type="file"]')
const preview = document.querySelector('img.preview')
const reader = new FileReader()

fileInput.addEventListener('change', handleSelected);

document.addEventListener('DOMContentLoaded', function(e) {
  // handle button events for top page
  if ($('.active').id === 'c_top') {
    $('#c_top').querySelectorAll('push-button').forEach(function(btn) {
      btn.addEventListener('click', function() {
        $('#c_top').classList.add('hidden');

        // deactivate all sections
        document.querySelectorAll('.section').forEach(function(element) {
            element.classList.remove('active');
        })

        const t = document.getElementById(btn.getAttribute('for'));
        const c = t.content.cloneNode(true);
        document.body.appendChild(c);

        $('#btn_back').classList.remove('hidden');

      })
    }, false);
  }

  // see if the sender has used it before
  if (__boarderly.fname && __boarderly.lname && __boarderly.token) {

    // enable the other buttons
    document.querySelectorAll('.reg-req').forEach(function(b) {
      b.classList.remove('reg-req')
    })

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

    socket.on('CONNECT_REMOTE', handlePushConnect)

    // add click handler for button sounds
    // document.querySelectorAll('.push-button').forEach(function(b) {
    //   b.addEventListener('click', handleButtonPush, false)
    // })

    document.querySelectorAll('.numpad-button').forEach(function(b) {
      b.addEventListener('click', handleNumPadButton, false)
    })  
  }
});

function $(element) { return document.querySelector(element); }

function handlePushConnect(data) {
  showSection('c_numpad')
}

function handleNumPadButton(e) {
  const number = this.innerHTML

  socket.emit('NUMGAME_GUESS', { guess: number })
  // if (number === 'Go') {
  //   socket.emit('NUMGAME_GUESS', { guess: document.querySelector('#player_guess').innerHTML })
  // }
  // else {
  //   document.querySelector('#player_guess').innerHTML += this.innerHTML
  // }
  
}

function goHome() {
  window.location.reload()
}

async function registerDevice() {
  if (!fname.value || !lname.value) return false
  
  // go fetch a token
  let res = await fetch('/api/gettoken')
  let json = await res.json()
  const token = json.answer
  const data = {}
 
  data.fname = fname.value
  data.lname = lname.value
  data.token = token
  data.file_name = document.getElementById('contact_pic').files[0].name
  data.image = reader.result

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
    preview.src = reader.result
    showElement('avatar_preview')
    showElement('btn_save')
  }
}

// function addListeners(reader) {
//   reader.addEventListener('load', handleEvent);
// }

function handleSelected(e) {
  const selectedFile = fileInput.files[0]
  if (selectedFile) {
    reader.addEventListener('load', handleEvent)
    reader.readAsDataURL(selectedFile)
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