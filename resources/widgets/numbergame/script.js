const socket = io()
const numbers = []
const player_guesses = []
let level = 1
const max_levels = 5

// start the game
showNumber();

socket.on('NUMPAD_BUTTON_CLICK', handleGuess);

async function handleGuess(data) {
    document.querySelector('#player_guess').value += data.number;
    player_guesses.push(parseInt(data.number));

    if (player_guesses.length === numbers.length) {
        if (player_guesses.join('') === numbers.join('')) {
            document.querySelector('#result_message').innerHTML = 'Good job!';
            await sleep(1200);
            reset(true);              
        }
        else {
            document.querySelector('#result_message').innerHTML = 'Nope! Try again.';
            await sleep(1200);
            reset(false);
        }
    }
}

function reset(result) {
    if (result) level++
    else level = 1

    numbers.length = 0;
    player_guesses.length = 0;
    document.querySelector('#player_message').classList.add('hidden');
    document.querySelector('#player_guess').value = '';
    document.querySelector('#result_message').innerHTML = '';

    showNumber();
}

async function showNumber() {
    for (let i=1; i<=level; i++) {
        numbers.push(Math.floor(Math.random() * 9));
    }
   
    document.querySelector('#number').innerHTML = numbers.join('');
    await sleep(1500);
    document.querySelector('#number').innerHTML = document.querySelector('#number').innerHTML.replace(/\w|\W/gi, '*');
    document.querySelector('#player_message').classList.remove('hidden');
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

