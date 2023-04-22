
const socket = io();
const messages = [];

let __selected_card_index = -1;
let __navbar= null;
let __content = null;
let countdown;

document.addEventListener('keydown', handleKeydown, false)

document.addEventListener('DOMContentLoaded', function(e) {
    // stuff for the screen saver
    document.body.addEventListener('click', resetScreenTimer, false)
    document.body.addEventListener('mousemove', resetScreenTimer, false)

    //resetTimer(); 

    __navbar = document.getElementById('navbar')
    __content = document.getElementById('contents')

    //socket.on('REFRESH_MESSAGES', refreshMessages)
    socket.on('BUTTON_PUSHED', handleRemBtnPush)
    // socket.on('GET_ALBUMS', buildAlbumList)
    //socket.emit('GET_MESSAGES')
    // socket.emit('GET_ALBUMS')

    getWeather()
    showTime()

    showToast('<sl-icon name="envelope-fill"></sl-icon> You have a new message!', 3000);

    // add event listeners to modal close buttons
    document.querySelectorAll('.modal-close').forEach(function(n) {
        n.addEventListener('click', function(e) {
            this.parentElement.classList.add('hidden')
            //closeModal(this)
        })
    })

    // add event listeners for screen saver
    //document.querySelector('#screensaver_modal').addEventListener('click', handleScrSavr);

    // handle notification sounds
    //btn_playsound.addEventListener('click', handleSound);

});

function $(element) { return document.querySelector(element); }

function getActiveNavbarButton() {
    let b = document.querySelector('.navbar .active');
    return b.id;
}

function getActiveCard() {
    let b = document.querySelector('.card .active');
    return b.id;
}

// function handleCardClick(e) {
//     const card = e.target
//     //alert(card.parentElement.innerHTML)
// }

// function handleScrSavr() {
//     closeModal('screensaver_modal');
// }

function handleSound() {
    // var snd_newmessage = new Howl({
    //     src: ['/resources/sounds/click.mp3'],
    //     onplayerror: function() {
    //         snd_newmessage.once('unlock', function() {
    //             //snd_newmessage.play();
    //       });
    //     }
    //   });

    //snd_newmessage.play();
}

// function show2(section) {
//     // clear active nav selections
//     Array.from(document.querySelectorAll("[id^='nav_']")).forEach(function(element) {
//         element.classList.remove('active');
//     })

//     document.getElementById(section.id).classList.add('active');

//     //let t = document.getElementById(section.value).innerHTML;
  
    
//     let template = document.getElementById(section.value);
//     //template = template.replace('{{bob}}', 'fred')
//     let templateContent = template.content.cloneNode(true);
    
//     //document.body.appendChild(templateContent);  
//    // alert(templateContent.innerHTML) //= templateContent.innerHTML.replace('{{bob}}', 'fred')
//     document.getElementById('contents').appendChild(templateContent);


//     // deactivate all sections
//     // document.querySelectorAll('.active').forEach(function(element) {
//     //     element.classList.remove('active');
//     // });


//     //const t = document.getElementById(section.value);
//     //const c = s.content.cloneNode(true);
//    // document.body.appendChild(c);

 
    
//    //template.classList.add('active');
// }

function show(section) {
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

    document.getElementById(section.id).classList.add('active');
    document.getElementById(section.id).focus();
    document.getElementById(section.id.replace('nav_', 'section_')).classList.remove('hidden');
}

function handleRemBtnPush(data) {
    // turn off screen saver
    triggerEvent(document.body, 'mousemove')

    //alert(data)

    let section = getActiveNavbarButton().replace('nav', 'section')
    let cards = document.getElementById(section).querySelectorAll('.card')

    switch (data.button) {
        case 'home':
            triggerEvent(document.getElementById('nav_home'), 'click');
           // __content.focus();
            break;
        case 'gallery':
            triggerEvent(document.getElementById('nav_gallery'), 'click');
            //__content.focus();
            break;
        case 'games':
            triggerEvent(document.getElementById('nav_games'), 'click');
           // __content.focus();
            break;
        case 'messages':
            triggerEvent(document.getElementById('nav_messages'), 'click');
            //__content.focus();
            break;
        case 'settings':
            triggerEvent(document.getElementById('nav_settings'), 'click');
            //__content.focus();
            break;
        case 'ArrowRight':
            if (__selected_card_index >= (cards.length -1)) return;
            
            if (__selected_card_index >= 0) {
                cards[__selected_card_index].classList.remove('active');
            }

            __selected_card_index++;
            cards[__selected_card_index].classList.add('active');
            break;
        case 'ArrowLeft':        
            if (__selected_card_index <= -1) return;
                
            cards[__selected_card_index].classList.remove('active');

            __selected_card_index--;
            cards[__selected_card_index].classList.add('active');
            break;
        case 'enter':
            triggerEvent(document.querySelector('.card.active'), 'click');       
            break;
        case 'exit':
            document.querySelectorAll('.modal').forEach(function(m) {
                m.classList.remove('active')
                m.classList.add('hidden')
            })
            //triggerEvent(document.querySelector('.modal-close.active'), 'click');
            break;
    }
}

function handleKeydown(e) {
    switch (e.key) {
        case 'Escape':
            document.querySelectorAll('.modal').forEach(function(m) {
                m.classList.add('hidden')
            })
            break;
    }

    // 9 is tab
    // 40 is down
    // 38 is up
    // 37 is left
    // 39 is right or ArrowRight
    // 27 is Esc
}

function openModal(modal) {
    document.getElementById(modal).classList.add('active');
    document.getElementById(modal).classList.remove('hidden');
}

function closeModal(modal) {
    document.getElementById(modal).classList.remove('active');
    document.getElementById(modal).classList.add('hidden');
}

function triggerEvent(el, e) {
    el.dispatchEvent(new Event(e));
}

// function refreshMessages(data) {
//     let markup = '';

//     // clear the list and rebuild
//     while (__message_block.firstChild) {
//         __message_block.removeChild(__message_block.firstChild);
//     }

//     for (let i = 0; i < data.length; i++) {
//         // get initials from dame
//         //const initials = data[i].from.match(/(\b\S)?/g).join('').toUpperCase();

//         markup += `
//             <div class="message-container">
//                 <div class="message-props">
//                     ${data[i].from}
//                     ${data[i].date}
//                 </div>
//                 <div class="message">${data[i].message}</div>
//             </div>
//         `;
//     }
    
//     __message_block.innerHTML = markup + '<br /><br /><br />'
//     __message_block.scroll(0, 9999)
// }

async function getWeather() {
    const key = '8815275c285e40149bd222225222712'
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
        let dd = new Date(d.date).toLocaleDateString('en-us', {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric"
        })

        markup += `<tr><td>${dd}</td>
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

function showToast(message, ms=3000) {
    $('#toast').innerHTML = message;
    $('#toast').classList.add('show');
    
    setTimeout(function(){ 
        $('#toast').classList.remove('show');
    }, ms);
}

// function buildAlbumList(data) {
//     let button_markup = `<button class="btn active" onclick="filterSelection('all')"> Show all</button>`;
//     let pic_markup = '';
//     let a = [];

//     data.forEach(function(o) {
//         let album_name = o.album;

//         if (!a.includes(album_name)) {
//             a.push(album_name);
//             button_markup += `
//                 <button class="btn" onclick="filterSelection('${o.css_name}')">${o.album.replaceAll('_', ' ')}</button>
//             `;   
//         }

//         pic_markup += getPicMarkup(o.album, o.name);
//     });
   
//    // __album_buttons.innerHTML = button_markup;
//     __pictures_block.innerHTML = pic_markup;
// }

// function getPicMarkup(album, name) {
//     let markup = `<img src="/albums/${album}/${name}" />`;

//     return markup;
// }

function resetScreenTimer() {
    // if (countdown) {
    //     document.getElementById('screensaver_modal').classList.remove('active');
    //     document.getElementById('screensaver_modal').classList.add('hidden');
    //     clearTimeout(countdown)
    // }

    // countdown = setTimeout(function() {
    //     document.getElementById('screensaver_modal').classList.add('active');
    //     document.getElementById('screensaver_modal').classList.remove('hidden');
    // }, 50000);
}
