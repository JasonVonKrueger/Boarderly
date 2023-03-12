const socket = io()
const numbers = []
const player_guesses = []
let level = 1
const max_levels = 5

socket.on('NUMGAME_GUESS', handleGuess)

function $(element) { return document.querySelector(element) }

async function handleGuess(data) {
    $('#player_guess').value += data.guess;
    player_guesses.push(parseInt(data.guess));

    if (player_guesses.length === numbers.length) {
        if (player_guesses.join('') === numbers.join('')) {
            $('#result_message').innerHTML = 'Good job!';
            await sleep(1200);
            reset(true);              
        }
        else {
            $('#result_message').innerHTML = 'Nope! Try again.';
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
    $('#player_message').classList.add('hidden');
    $('#player_guess').value = '';
    $('#result_message').innerHTML = '';

    showNumber();
}

async function showNumber() {
    for (let i=1; i<=level; i++) {
        numbers.push(Math.floor(Math.random() * 9));
    }
   
    $('#number').innerHTML = numbers.join('');
    await sleep(1500);
    $('#number').innerHTML = $('#number').innerHTML.replace(/\w|\W/gi, '*');
    $('#player_message').classList.remove('hidden');
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

