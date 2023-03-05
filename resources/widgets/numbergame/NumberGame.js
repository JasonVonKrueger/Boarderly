class NumberGame extends HTMLElement {
    constructor() {
        super();
    }

    render() {
        const socket = io()
        const numbers = []
        const player_guesses = []
        let level = 1
        const max_levels = 5
        let pg

        socket.on('NUMGAME_GUESS', handleGuess)

        const instructions = `I will show you a number and you type what you saw. Got it?`

        let style_markup = `
            <link rel="stylesheet" href="/resources/css/main.css" />
        `;

        let card_markup = `
            <style>
                #game_overview div { text-align: left; }
                #game_overview #btn_start {
                    font-size: 1rem;
                    padding: 1rem 2rem 1rem 2rem;
                }
            </style>

            <div id="game_overview">
                <div>${instructions}</div>
                <button id="btn_start" focus="true">Start</button>
            </div>
        `;

        let modal_markup = `
            <style>
                * { box-sizing: border-box; }

                .flex-container {
                    display: flex;
                    Xheight: 300px;
                    margin-top: 12%;
                    justify-content: center;
                    align-items: center;
                }
                .flex-container > div {
                    background-color: #f1f1f1;
                    color: white;
                    border-radius: 6px;
                    width: 400px;
                }

                #game_box { 
                    text-align: center;
                    background-color: #ddd; 
                    padding: 2rem;
                    color: #666;
                    margin-left: auto;
                    margin-right: auto;
                    font-size: 1.5rem;
                    opacity: 0;
                    animation-name: do-it;
                    animation-duration: 2s;
                    animation-delay: .5s;
                    animation-fill-mode: forwards;
                }
                @keyframes do-it {
                    100% { opacity: 1; }
                }

                #game_box #number { font-size: 4rem; }
                #game_box #player_guess {
                    text-align: center;
                    font-size: 1.5rem;
                    width: 75px;
                    border: 0px;
                    border-bottom: 2px solid #bbb;
                    padding: .5rem;
                    color: #000;
                    background: transparent;
                }
                #game_box #result_message {
                    margin-top: 1rem;
                }
            </style>

            <div class="flex-container">
                <div id="game_box">
                    <div id="number"></div>
                    <div id="player_message" class="hidden">
                    Enter the number you saw: 
                    <input type="text" id="player_guess"></input>
                    </div>
                    <div id="result_message"></div>
                </div>
            </div>
        `;

        $('#modal_content').innerHTML = modal_markup
        $('#modal_content').classList.remove('hidden')
        this.innerHTML = card_markup

        $('#btn_start').addEventListener('click', handleStartGame, false)

        function $(element) { return document.querySelector(element) }

        function handleStartGame() {
            $('#btn_start').classList.add('hidden')
            openModal('modal')
            socket.emit('CONNECT_REMOTE')
            showNumber()
        }

        async function handleGuess(data) {
            $('#player_guess').value += data.guess
            player_guesses.push(parseInt(data.guess))

            if (player_guesses.length === numbers.length) {
                if (player_guesses.join('') === numbers.join('')) {
                    $('#result_message').innerHTML = 'Good job!' 
                    await sleep(1200)
                    reset(true)               
                }
                else {
                    $('#result_message').innerHTML = 'Nope! Try again.'
                    await sleep(1200)
                    reset(false)
                }
            }
        }

        function reset(result) {
            if (result) level++
            else level = 1

            numbers.length = 0
            player_guesses.length = 0
            $('#player_message').classList.add('hidden')
            $('#player_guess').value = ''
            $('#result_message').innerHTML = ''

            showNumber()
        }

        async function showNumber() {
            for (let i=1; i<=level; i++) {
                numbers.push(Math.floor(Math.random() * 9))
            }
           
            $('#number').innerHTML = numbers.join('')
            await sleep(1500)
            $('#number').innerHTML = $('#number').innerHTML.replace(/\w|\W/gi, '*')
            $('#player_message').classList.remove('hidden')
        }

        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms))
        }
    }

    connectedCallback() {
        if (!this.rendered) {
            this.render()
            this.rendered = true
        }
    }

    static get observedAttributes() {
        return ['name', 'class']
    }

    attributeChangedCallback(name, oldValue, newValue) {
        this.render()
    }
}

customElements.define('number-game', NumberGame)