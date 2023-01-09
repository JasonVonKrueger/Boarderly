const socket = io();
const messages = [];
let selected_card_index = -1;

let __sidebar = null;
let __content = null;

document.addEventListener("DOMContentLoaded", function(e) {
    __sidebar = document.getElementById('sidebar');
    __content = document.getElementById('content');

    // set margin of content pane
    __content.style.marginLeft =  __sidebar.clientWidth + 15 + 'px';

    socket.on('REFRESH_MESSAGES', refreshMessages);
    socket.on('REFRESH_TASKS', refreshTasks);
    socket.on('BUTTON_PUSHED', handleRemBtnPush);
    socket.emit('GET_MESSAGES');

    getWeather();
    showTime();
});

function getActiveSidebarButton() {
    let b = document.querySelector('#sidebar .active');
    let c = b.id;

    return c;
}

function show(el) {
    // reset selected card
    selected_card_index = -1;

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
        case 'tools':
            triggerEvent(document.getElementById('nav_tools'), 'click');
            __content.focus();
            break;
        case 'ArrowRight':
                if (selected_card_index >= cards.length) return;

                if (selected_card_index >= 0) {
                    cards[selected_card_index].classList.remove('selected');
                }

                selected_card_index++;
                cards[selected_card_index].classList.add('selected');
            break;
        case 'ArrowLeft':        
            if (selected_card_index <= 0) return;
            
            //if (selected_card_index >=0) {
                cards[selected_card_index].classList.remove('selected');
            //}

            selected_card_index--;
            cards[selected_card_index].classList.add('selected');
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

function triggerEvent(el, event) {
    el.dispatchEvent(new Event(event));
}

function refreshMessages(data) {
    const message_block = document.getElementById('message_block');

    for (let i = 0; i < data.length; i++) {
        const con = document.createElement('div');
        con.classList.add('msg-box');

        const sender = document.createElement('div');
        sender.classList.add('sender');
        sender.innerHTML = `${data[i].from} <br /> ${data[i].date}`;

        const message = document.createElement('div');
        message.classList.add('message');
        message.innerHTML = data[i].message;

        con.appendChild(sender);
        con.appendChild(message);

        message_block.appendChild(con);
        
       // __message_block.scrollTo(0,9999);
    }
}

function refreshTasks(data) {
    const task_block = document.getElementById('task_block');

    for (let i = 0; i < data.length; i++) {
        const task = document.createElement('div');
        const l = document.createElement('span');
        const r = document.createElement('span');

        l.innerHTML = data[i].task;
        r.innerHTML = '<span class="material-symbols-outlined">check_box_outline_blank</span>';
        //r.innerHTML = '<span class="material-symbols-outlined">check_box</span>';
        task.appendChild(l);
        task.appendChild(r);
        task.classList.add('task');
        
        task_block.appendChild(task);
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

    weather_block.innerHTML = markup
}

function showTime() {
    var date = new Date();
    var h = date.getHours(); // 0 - 23
    var m = date.getMinutes(); // 0 - 59
    var s = date.getSeconds(); // 0 - 59
    var session = "AM";
    
    if (h == 0) {
        h = 12;
    }
    
    if (h > 12) { 
        h = h - 12;
        session = "PM";
    }
    
    h = (h < 10) ? "0" + h : h;
    m = (m < 10) ? "0" + m : m;
    s = (s < 10) ? "0" + s : s;
    
    var time = h + ":" + m + ":" + s + " " + session;
    document.getElementById("MyClockDisplay").innerText = time;
    document.getElementById("MyClockDisplay").textContent = time;
    
    setTimeout(showTime, 1000);
}








async function getAlbums() {
    const url = 'https://photoslibrary.googleapis.com/v1/albums'
    const client_id = '948657149825-l9p5dkb7od1c85kupbutjqrfe1guakho.apps.googleusercontent.com'
    const client_secret = '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'
    const api_key = 'AIzaSyAzNeh8YHfwLXpsT92c1FMyopxhSLVvuUg'
    // key=API_KEY

    let response = await fetch(url)
    let data = await response.json()
}

async function fetchContent(page) {

    let response = await fetch(page)
    let data = await response.text()
    document.getElementById('bob').innerHTML = data
    console.log('RGP: ' + data)
    //return { stuff: data }
    //let response = fetch(page)

}
