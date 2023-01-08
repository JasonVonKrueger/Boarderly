/* Scripts for Boarderly remote */

const socket = io()

// see if the sender has used it before
let name = getCookie('name');
if (name) {
    document.getElementById('from').value = getCookie('name');
    document.getElementById('message').focus();
}
else {
    document.getElementById('from').focus();
}

function sendMessage() {
    let from = document.getElementById('from').value
    let message = document.getElementById('message').value

    if (!from || !message) return false

    // save the sender's name
    setCookie('name', from, 90);

    let d = new Date()
    socket.emit('POST_MESSAGE', {
        from: from,
        message: message,
        date: d.toLocaleString()
    })

    document.getElementById('btnSend').classList.add('hidden')
    document.getElementById('answer').innerHTML = 'Message sent!'
}

function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');

    for (let i = 0; i <ca.length; i++) { 
        let c = ca[i]; 
        while (c.charAt(0) == ' ' ) { 
            c = c.substring(1); 
        } 
        
        if (c.indexOf(name) == 0) { 
            return c.substring(name.length, c.length); 
        } 
    } 
        
    return false; 
}

function showSection(section) {
    document.getElementById('c_top').classList.add('hidden');
    document.getElementById(section).classList.remove('hidden');

    document.getElementById('btn_back').classList.remove('hidden');

    return false;
  }

  function sendPush(btn) {
    document.getElementById('clicker').play();

    socket.emit('BUTTON_PUSHED', {
      button: btn
    });
  }

  function addTask() {
    const new_task = document.getElementById('new_task');

    if (new_task.value.length == 0) return;
   
    document.querySelector('#tasks').innerHTML += `
    <div class="task">
        <span id="taskname">
            ${new_task.value}
        </span>
        <button class="delete">
            <i class="far fa-trash-alt"></i>
        </button>
    </div>
`;

    var current_tasks = document.querySelectorAll(".delete");
    for (var i = 0; i < current_tasks.length; i++) {
        current_tasks[i].onclick = function () {
            this.parentNode.remove();
        }
    }

    let d = new Date()
    socket.emit('POST_TASK', {
        task: new_task.value,
        date: d.toLocaleString()
    })
    
  }

  function completeTask() {
    
  }
