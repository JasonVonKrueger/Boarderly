/* Scripts for Boarderly remote */
const socket = io({ 
  forceBase64: false,
  extraHeaders: {
    'IO-Board-Key': '123'
  } 
});

document.addEventListener('DOMContentLoaded', function(e) {
  if (!localStorage.getItem('boarderly')) {
      // register the device
      const reg = $('#c_register').content.cloneNode(true);
      document.body.appendChild(reg);
  }
  else {
      // enable the other buttons
      document.querySelectorAll('.reg-req').forEach(function(b) {
        b.classList.remove('reg-req');
      });

      // handle button events for top page
      if ($('.active').id === 'c_top') {
        $('#c_top').querySelectorAll('push-button').forEach(function(btn) {
          btn.addEventListener('click', function(e) {
            e.preventDefault();

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
       
  }

 

  // see if the sender has used it before
  // if (__boarderly.fname && __boarderly.lname && __boarderly.token) {


  //   // pre-populate first and last name
  //   __fname.value = __boarderly.fname
  //   __lname.value = __boarderly.lname
  //   __fname.setAttribute('disabled', 'true')
  //   __lname.setAttribute('disabled', 'true')

  //   preview.src = __boarderly.image
  //   showElement('btn_reset')
  //   showElement('avatar_preview')
  //   hideElement('btn_save')
  //   hideElement('contact_pic')

  //   socket.on('CONNECT_REMOTE', handlePushConnect)

  //   // add click handler for button sounds
  //   // document.querySelectorAll('.push-button').forEach(function(b) {
  //   //   b.addEventListener('click', handleButtonPush, false)
  //   // })

  //   document.querySelectorAll('.numpad-button').forEach(function(b) {
  //     b.addEventListener('click', handleNumPadButton, false)
  //   })  
  // }
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