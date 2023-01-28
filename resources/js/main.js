const socket = io();
const messages = [];

let __selected_card_index = -1;
let __sidebar = null;
let __content = null;

document.addEventListener('DOMContentLoaded', function(e) {
    __sidebar = document.getElementById('sidebar');
    __content = document.getElementById('contents');

    socket.on('REFRESH_MESSAGES', refreshMessages);
    socket.on('REFRESH_TASKS', refreshTasks);
    socket.on('BUTTON_PUSHED', handleRemBtnPush);
    socket.on('GET_ALBUMS', buildAlbumList);
    socket.emit('GET_MESSAGES');
    socket.emit('REFRESH_TASKS');
    socket.emit('GET_ALBUMS');

    getWeather();
    showTime();

    btn_playsound.addEventListener('click', function(e) {
        var snd_newmessage = new Howl({
            src: ['/resources/sounds/click.mp3'],
            onplayerror: function() {
                snd_newmessage.once('unlock', function() {
                    //snd_newmessage.play();
              });
            }
          });

        //snd_newmessage.play();
    });

    // load the qr code
    QRCode.toCanvas(document.getElementById('qrcode'), `${window.location}remote`, function (error) {
        if (error) console.error(error)
    })

    const domain = 'meet.jit.si';
    const options = {
        roomName: 'JitsiMeetAPIExample',
        width: 700,
        height: 500,
        parentNode: document.querySelector('#meet'),
        lang: 'en',
        userInfo: {
            email: 'sherrypoore1939@gmail.com',
            displayName: 'Sherry Poore'
        }
    };
    const api = new JitsiMeetExternalAPI(domain, options);




});

function getActiveSidebarButton() {
    let b = document.querySelector('#sidebar .active');
    let c = b.id;

    return c;
}

function show(el) {
    // var msg = new SpeechSynthesisUtterance();
    // msg.text = "He's a stupid cat.";
    // window.speechSynthesis.speak(msg);

    // reset selected card
    __selected_card_index = -1;

    // clear all the sectiions first
    Array.from(document.querySelectorAll("[id^='section_']")).forEach(function(element) {
        element.classList.add('hidden');
    })

    // clear active nav selections
    Array.from(document.querySelectorAll("[id^='nav_']")).forEach(function(element) {
        element.classList.remove('active');
    })

    document.getElementById(el.id).classList.add('active');
    document.getElementById(el.id).focus();
    document.getElementById(el.id.replace('nav_', 'section_')).classList.remove('hidden');
}

function handleRemBtnPush(data) {
    let section = getActiveSidebarButton().replace('nav', 'section');
    let cards = document.getElementById(section).querySelectorAll('.content-grid-item');

    switch (data.button) {
        case 'home':
            triggerEvent(document.getElementById('nav_home'), 'click');
            __content.focus();
            break;
        case 'pictures':
            triggerEvent(document.getElementById('nav_pictures'), 'click');
            __content.focus();
            break;
        case 'games':
            triggerEvent(document.getElementById('nav_games'), 'click');
            __content.focus();
            break;
        case 'news':
            triggerEvent(document.getElementById('nav_news'), 'click');
            __content.focus();
            break;
        case 'jitsi':
            triggerEvent(document.getElementById('nav_jitsi'), 'click');
            __content.focus();
            break;
        case 'tools':
            triggerEvent(document.getElementById('nav_tools'), 'click');
            __content.focus();
            break;
        case 'ArrowRight':
                if (__selected_card_index >= cards.length) return;
                
                if (__selected_card_index >= 0) {
                    cards[__selected_card_index].classList.remove('selected');
                }

                __selected_card_index++;
                cards[__selected_card_index].classList.add('selected');
            break;
        case 'ArrowLeft':        
            if (__selected_card_index <= -1) return;
                
            cards[__selected_card_index].classList.remove('selected');

            __selected_card_index--;
            cards[__selected_card_index].classList.add('selected');
            break;
        case 'enter':
            //alert('enter');
            break;
        case 'cancel':
            //alert('cancel');
            break;
    }

    // __sidebar.dispatchEvent(new Event('focus'));
    // __sidebar.dispatchEvent(new KeyboardEvent('keydown', { 'key': data.button }));  
}

function openModal(mo) {
    document.getElementById(mo).style.display = 'block';
}

function closeModal(mo) {
    document.getElementById(mo).style.display = 'none';
}

function triggerEvent(el, e) {
    el.dispatchEvent(new Event(e));
}

function refreshMessages(data) {
    let markup = '';

    // clear the list and rebuild
    while (__message_block.firstChild) {
        __message_block.removeChild(__message_block.firstChild);
    }

    for (let i = 0; i < data.length; i++) {
        markup += `
            <div style="display: flex; flex-direction: row;">
            <div><img src="/devices/${data[i].token}/${data[i].file_name}" class="thumb-avatar" /></div>
            <div class="bubble">${data[i].message}</div>
            </div>
        `;

        //triggerEvent(btn_playsound, 'click');
    }
    
    __message_block.innerHTML = markup + '<br /><br /><br />';
    __message_block.scroll(0, 9999);
}

function refreshTasks(data) {
    let markup = '', c = '';

    // clear the list and rebuild
    while (__task_block.firstChild) {
        __task_block.removeChild(__task_block.firstChild);
    }

    for (let i = 0; i < data.length; i++) {
        if (data[i].status === 'complete') {
            c = '<input type="checkbox" style="width: 20px; height: 20px;" checked="true" />';
        }
        else {
            c = `<input type="checkbox" style="width: 20px; height: 20px;" onclick="completeTask('${data[i].id}')" />`;
        }

        markup += `
            <div class="task">
                <span class="">${data[i].task}</span>
                <span class="">${c}</span>
            </div>
        `;

        __task_block.innerHTML = markup + '<br /><br /><br />';
        __task_block.scroll(0, 9999);       
    }
}

async function getWeather() {
    const key = '8815275c285e40149bd222225222712';
    //const url = `http://api.weatherapi.com/v1/current.json?key=${key}&q=30236&aqi=no`;
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${key}&q=30236&days=3&aqi=no&alerts=no`;

    let response = await fetch(url);
    let data = await response.json();
    const { location, current, forecast } = data;

    let markup = ` 
        <h2><span>${location.name}, ${location.region}</span></h2> 
        <img src=${current.condition.icon} style="width: 100px">
        <table style="width: 100%">
        <tr>
        <td></td>
        <td style="font-size: 2em;">${Math.round(current.temp_f)}<sup style="font-size: .6em">°F</sup></td>
        <td style="font-size: 2em;">${current.humidity}%</td>
        </tr>
        </table>`;

    markup += '<table style="width: 100%">';

    for (let i=0; i<forecast.forecastday.length; i++) {
        let d = forecast.forecastday[i];
        //let dow = new Date(d.date).toLocaleString('default', {weekday: 'long'});

        markup += `<tr><td>${d.date}</td>
            <td><img src="${d.day.condition.icon}" style="width: 50px" /></td>
            <td>${Math.round(d.day.maxtemp_f)}</td>
            <td>${d.day.avghumidity}%</td></tr>`;
    }

    markup += '</table>';

    __weather_block.innerHTML = markup
}

function showTime() {
    var date = new Date();
    var h = date.getHours(); 
    var m = date.getMinutes();
    var s = date.getSeconds();
    var session = "AM";
    
    if (h == 0) {
        h = 12;
    }
    
    if (h > 12) { 
        h = h - 12;
        session = "PM";
    }
    
    //h = (h < 10) ? "0" + h : h;
    m = (m < 10) ? "0" + m : m;
    s = (s < 10) ? "0" + s : s;
    
    var time = h + ":" + m + ":" + s + " " + session;
    document.getElementById("time").innerText = time;
    document.getElementById("time").textContent = time;
    
    setTimeout(showTime, 1000);
}

function buildAlbumList(data) {
    let button_markup = `<button class="btn active" onclick="filterSelection('all')"> Show all</button>`;
    let pic_markup = '';
    let a = [];

    data.forEach(function(o) {
        let album_name = o.album;
        let pic_name = o.name;

        if (!a.includes(album_name)) {
            a.push(album_name);
            button_markup += `
                <button class="btn" tabindex="0" onclick="filterSelection('${o.css_name}')">${o.album.replaceAll('_', ' ')}</button>
            `;   
        }

        pic_markup += getPicMarkup(o.album, o.name, o.css_name);
    });
   
    __album_buttons.innerHTML = button_markup;
    __pictures_block.innerHTML = pic_markup;
}

function getPicMarkup(album, name, css_name) {
    let markup = '';

    markup += `
        <div class="content-grid-item card" tabindex="0">
        <div class="card-body">
        <img src="/albums/${album}/${name}" alt="${name}" class="${css_name} pic-thumb" onclick="openModal('pictures_modal');">
        <p>${name.split('.')[0]}</p>
        </div>
        </div>
    `;

    return markup;
}

function handlePicClick(e) {
   
}






function facenameFlip() {
    let card = document.querySelector('.flip-card');
    card.classList.toggle('is-flipped');
}



//filterSelection("all")

function filterSelection(c) {
    document.querySelector(`.${c}`).parentElement.classList.add('hidden');
   
//   var x, i;
//   x = document.getElementsByClassName("column");
//   if (c == "all") c = "";
//   for (i = 0; i < x.length; i++) {
//     w3RemoveClass(x[i], "show");
//     if (x[i].className.indexOf(c) > -1) w3AddClass(x[i], "show");
//   }
}
