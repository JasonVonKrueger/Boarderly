/* Scripts for Boarderly remote */

const socket = io()

const snd_button_push = new Howl({ src: ['/resources/sounds/cork-85200.mp3'] });

// see if the sender has used it before
let name = getCookie('name');
if (name) {
    document.getElementById('from').value = getCookie('name');
    document.getElementById('message').focus();
}
else {
    document.getElementById('from').focus();
}

socket.emit('REFRESH_TASKS');
socket.on('REFRESH_TASKS', refreshTasks);



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
    snd_button_push.play();

    document.getElementById('c_top').classList.add('hidden');
    document.getElementById(section).classList.remove('hidden');
    document.getElementById('btn_back').classList.remove('hidden');

    return false;
  }

  function sendPush(btn) {
   snd_button_push.play();

    socket.emit('BUTTON_PUSHED', { button: btn });
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
        }
        else {
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
   
    // document.querySelector('#task_block').innerHTML += `
    // <div class="task">
    //     <span id="taskname">
    //         ${new_task.value}
    //     </span>
    // </div>`;

    // var current_tasks = document.querySelectorAll(".delete");
    // for (var i = 0; i < current_tasks.length; i++) {
    //     current_tasks[i].onclick = function () {
    //         this.parentNode.remove();
    //     }
    // }

    let d = new Date()
    socket.emit('POST_TASK', {
        task: new_task.value,
        date: d.toLocaleString()
    })

    socket.emit('REFRESH_TASKS');
  }

  function completeTask(id) {
    socket.emit('COMPLETE_TASK', { id: id });
  }


