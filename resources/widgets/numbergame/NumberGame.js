class NumberGame extends HTMLElement {
    constructor() {
        super();
    }

    render() {
        const socket = io()
        let keypress_count = 0
        const numbers = []
        let level = 1
        const max_levels = 5

        //   socket.emit('REFRESH_PLANNER_EVENTS');
        //   socket.on('REFRESH_PLANNER_EVENTS', this.refreshPlnrEvents, false);

        const instructions = `I will show you a number and you type what you saw. Got it?`
        //let rnd_number = Math.floor(Math.random() * 9)

        let markup = `
            <link rel="stylesheet" href="/resources/css/main.css" />
            <style>
            .game-content p {
                text-align: left;
            }

            #game_form {
                
            }

            #number {
                font-size: 2rem;
            }

            .game-content input {
                outline: none;
                border: none;
                margin: 0 0 20px 3px;
                padding: 8px 5px 0px 0;
                background: transparent;
                color: rgba(250,250,255,1);
                font-size: 1.5rem;
                border-bottom: 1px dotted rgba(91,114,127,1);
                text-align: center;
            }

            .game-content button {
                font-size: 1.5rem;
                padding: .5rem;
                background-color: var(--accent-color);
                color: #ccc;
                border: none;
                border-radius: 6px;
            }

            </style>
             
            <div class="game-content">
                <p>${instructions}</p>
                <div id="game_form" class="hidden">
                    <div id="number"></div>
                    <form>
                    Enter the number you saw:
                    <input type="text" id="player_guess" />
                    </form>
                </div>
                <button id="btn_start">Start</button>
                <div id="result_message"></div>
            </div>
  
          `;


        this.innerHTML = markup;

        document.querySelector('#btn_start').addEventListener('click', handleStartGame, false)
        document.querySelector('#player_guess').addEventListener('keyup', handlePlayerInput, false)

        function handleStartGame() {
            document.querySelector('#game_form').classList.remove('hidden')
            document.querySelector('#btn_start').classList.add('hidden')
            document.querySelector('#player_guess').focus()

            socket.emit('CONNECT_REMOTE')
            
            showNumber()
    
            // let number = document.getElementById('number')
    
            // setTimeout(function () {
            //     number.innerHTML = number.innerHTML.replace(/\w|\W/gi, '*')
            // }, 2200)
        }

        function compare() {
            const n_player = parseInt(document.querySelector('#player_guess').value)
            const n_cpu = parseInt(numbers.join(''))

            if (n_player === n_cpu) {
                document.querySelector('#result_message').innerHTML = 'Good job!'
                level++
            }
            else {
                document.querySelector('#result_message').innerHTML = 'Nope! Try again.'
                return false
            }
        }

        async function handlePlayerInput(e) {
            keypress_count++

            if (keypress_count === numbers.length) {
                keypress_count = 0
                
                if (!compare()) {
                    await sleep(1200)
                    reset()
                }
            }
        }

        function reset() {
            level = 1
            keypress_count = 0
            numbers.length = 0
            document.querySelector('#player_guess').value = ''
            document.querySelector('#result_message').innerHTML = ''
            showNumber()
        }

        async function showNumber() {
            numbers.push(Math.floor(Math.random() * 9))

            let number = document.getElementById('number')
            number.innerHTML = numbers
            await sleep(1000)
            number.innerHTML = number.innerHTML.replace(/\w|\W/gi, '*')
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