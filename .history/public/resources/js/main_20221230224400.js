const socket = io();
const messages = [];
let current_page_index = 0;

document.addEventListener("DOMContentLoaded", function(e) {
    const __sidebar = document.getElementById('sidebar');

    socket.on('REFRESH_MESSAGES', refreshMessages);
    socket.on('BUTTON_PUSHED', handleRemBtnPush);
    socket.emit('GET_MESSAGES');

    getWeather();

    __sidebar.focus();

    // handle modal closing
    document.querySelector('.modal-close').onclick = function() {
        document.querySelector('.modal').style.display = 'none';
    }

    // document.onkeydown = function(e) {
    //     let a = getActiveSidebarButton()

    //     switch(e.key) {
    //         case 'ArrowDown':
    //             if (document.activeElement.id === 'sidebar') {
    //                 if (a === 'nav_home') {
    //                     triggerEvent(document.getElementById('nav_pictures'), 'click')
    //                 }

    //                 if (a === 'nav_pictures') {
    //                     triggerEvent(document.getElementById('nav_games'), 'click')
    //                 }   
    //             }
    //             break
    //         case 'ArrowUp':
    //             if (document.activeElement.id === 'sidebar') {
    //                 if (a === 'nav_games') {
    //                     triggerEvent(document.getElementById('nav_pictures'), 'click')
    //                 }

    //                 if (a === 'nav_pictures') {
    //                     triggerEvent(document.getElementById('nav_home'), 'click')
    //                 }   
    //             }
    //             break
    //     }      
    // }

    
    __sidebar.onkeydown = function(e) {
        let a = getActiveSidebarButton();

        switch(e.key) {
            case 'ArrowDown':
                if (a === 'nav_home') {
                    triggerEvent(document.getElementById('nav_pictures'), 'click');
                }

                if (a === 'nav_pictures') {
                    triggerEvent(document.getElementById('nav_games'), 'click');
                } 
                break;
            case 'ArrowUp':
                if (a === 'nav_games') {
                    triggerEvent(document.getElementById('nav_pictures'), 'click');
                }

                if (a === 'nav_pictures') {
                    triggerEvent(document.getElementById('nav_home'), 'click');
                }  
                break;
        }
    }
  
})

function getActiveSidebarButton() {
    let b = document.querySelector('#sidebar .active');
    let c = b.id;

    return c;
}

function show(el) {
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
    //alert(document.activeElement.id)
}

function handleRemBtnPush(data) {
    //alert('yo' + data.button)
    triggerEvent(document.getElementById('nav_games'), 'click');
}

function openModal(mo) {
    document.getElementById(mo).style.display = 'block';
}

function triggerEvent(el, event) {
    let clickEvent = new Event(event);
    el.dispatchEvent(clickEvent);
}

function refreshMessages(data) {
    const message_block = document.querySelector('#message_block');

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
    }
}

async function getWeather() {
    const key = '8815275c285e40149bd222225222712';
    const url = `http://api.weatherapi.com/v1/current.json?key=${key}&q=30236&aqi=no`;

    let response = await fetch(url);
    let data = await response.json();
    const {
        location,
        current
    } = data;

    const markup = ` 
    <h2><span>${location.name}, ${location.region}</span></h2> 
    <img src=${current.condition.icon} style="width: 100px">
    <table style="width: 100%">
    <tr>
    <td></td>
    <td style="font-size: 2em;">${Math.round(current.temp_f)}<sup style="font-size: .6em">°F</sup></td>
    <td style="font-size: 2em;">${current.humidity}%</td>
    </tr>
    </table>`;

    weather_block.innerHTML = markup
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
