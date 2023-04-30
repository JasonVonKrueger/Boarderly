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
      const reg = document.querySelector('#c_register').content.cloneNode(true);
      document.body.appendChild(reg);
  }
  else {
      // enable the other buttons
      document.querySelectorAll('.reg-req').forEach(function(b) {
        b.classList.remove('reg-req');
      });

      // handle button events for top page
      if (document.querySelector('.active').id === 'c_top') {
        document.querySelector('#c_top').querySelectorAll('push-button').forEach(function(btn) {
          btn.addEventListener('click', function(e) {
            e.preventDefault();

            const sectiion = btn.getAttribute('for');
            renderSection(sectiion);
          })
        }, false);
      }   

      //socket.on('NUMGAME_GUESS', handleGuess, false);
     socket.on('CONNECT_REMOTE', handleBoardConnect, false);
       
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

// function triggerEvent(el, e) {
//   el.dispatchEvent(new Event(e));
// }

function renderSection(section) {
  document.querySelector('#c_top').classList.add('hidden');

  // deactivate all sections
  document.querySelectorAll('.section').forEach(function(section) {
    section.classList.remove('active');
  })

  const t = document.getElementById(section);
  const c = t.content.cloneNode(true);
  document.body.appendChild(c);

  document.querySelector('#btn_back').classList.remove('hidden');
}

function handleBoardConnect(data) {
  console.log('Remote connected');

  renderSection('c_numpad');
}

// function handleNumPadButton(e) {
//   const number = this.innerHTML

//   socket.emit('NUMGAME_GUESS', { guess: number })
//   // if (number === 'Go') {
//   //   socket.emit('NUMGAME_GUESS', { guess: document.querySelector('#player_guess').innerHTML })
//   // }
//   // else {
//   //   document.querySelector('#player_guess').innerHTML += this.innerHTML
//   // }
  
// }

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