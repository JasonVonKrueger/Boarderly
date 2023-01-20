/* Scripts for Boarderly remote */
const socket = io()
const snd_button_push = new Howl({ src: ['/resources/sounds/cork-85200.mp3'] });

const fileInput = document.querySelector('input[type="file"]');
const preview = document.querySelector('img.preview');
const reader = new FileReader();

fileInput.addEventListener('change', handleSelected);

document.addEventListener('DOMContentLoaded', function(e) {
  // see if the sender has used it before
  const d = JSON.parse(localStorage.getItem('boarderly'));
  if (d.fname && d.lname) {
      __fname.value = d.fname;
      __lname.value = d.lname;

      document.getElementById('btn_save').classList.add('hidden');
      document.getElementById('btn_reset').classList.remove('hidden');

      // pre-populate the message from field
      __from.value = `${d.fname} ${d.lname}`;
      __message.focus();
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
        date: d.toLocaleString()
    })

    document.getElementById('btn_send').classList.add('hidden')
    document.getElementById('message_answer').innerHTML = 'Message sent!'
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

  function registerDevice() {
    if (!__fname.value || !__lname.value) {
        return false;
    }

    const data = {};
    data.fname = __fname.value;
    data.lname = __lname.value;

    // playing with geolocation
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(pos) {
            data.location = `${pos.coords.latitude} ${pos.coords.longitude}`;
        });
    } 
    else {
        console.log("Geolocation isn't supported by this browser.");
    }

    localStorage.setItem('boarderly', JSON.stringify(data));

    document.getElementById('btn_save').classList.add('hidden');
    //document.getElementById('btn_reset').classList.remove('hidden');

    __register_answer.value = 'Thanks for registering!';
    __register_answer.classList.remove('hidden');
  }

  function resetDevice() {
    __fname.value = '';
    __lname.value = '';

    localStorage.removeItem('boarderly');
    document.getElementById('btn_reset').classList.add('hidden');
    document.getElementById('btn_save').classList.remove('hidden');
  }


function handleEvent(e) {
  if (e.type === "load") {
      preview.src = reader.result;
      preview.classList.remove('hidden');
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




  function readFile(file) {
    var reader = new FileReader();

    reader.onloadend = function() {
      //let file_contents = window.btoa(reader.result);
      //localStorage.setItem('boarderly-avatar', file-contents);
     // processFile(reader.result, file.type);
    }
  
    reader.onerror = function () {
      alert('There was an error reading the file!');
    }

    reader.onload = function(loadedEvent) {
      var image = document.getElementById("theImage");
      image.setAttribute("src", loadedEvent.target.result);

      console.log(loadedEvent.target.result)
  }
  
    //reader.readAsDataURL(file);

   // document.write(getPhoto());
  }

  function upload(event) {
    console.log("Uploading...");
    var reader = new FileReader();

    const fileField = document.getElementById('contact_pic');

    //formData.append('selectedFile', fileField.files[0]);


    reader.onloadend = function() {

    }



    fetch('/api/postpic', {
        method: 'POST',
        body: fileField.files[0]
    })
    .then((result) => {
        console.log('Success:', result);
    })
    ;
}

async function postData(data) {
	var formData = new FormData();
	formData.append('imageData', data);

  const url = '/api/postpic';

  const response = await fetch(url, {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      //'Content-Type': 'application/json'
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: data
  });

  return response.json(); 
}



