/* Widget for Boarderly remote */
class NumPad extends HTMLElement {
    constructor() {
        super();
    }

    render() {
        let markup = `
            <style>
            .numpad {
                height: 500px;
                display: flex;
                flex-flow: row wrap;
              }
              
              .numpad-button {
                display: flex;
                align-items: center;
                justify-content: center;
                flex: 1 0 33.3333%;
                color: white;
                font-size: 2rem;
              }
              
              .numpad-button.push-button {
                transition: 0.5s;
                box-shadow: none;
              }
              
              .numpad-button.push-button:active,
              .numpad-button.push-button.activated {
                transform: translateY(8px);
              }
              
              .button:nth-of-type(10) {
                flex-basis: 66.6667%;
              }
            </style>

            <div class="numpad">
                <div class="numpad-button push-button">1</div>
                <div class="numpad-button push-button">2</div>
                <div class="numpad-button push-button">3</div>
                <div class="numpad-button push-button">4</div>
                <div class="numpad-button push-button">5</div>
                <div class="numpad-button push-button">6</div>
                <div class="numpad-button push-button">7</div>
                <div class="numpad-button push-button">8</div>
                <div class="numpad-button push-button">9</div>
                <div class="numpad-button push-button">0</div>
            </div>   
        `;

        this.innerHTML = markup;

        if (typeof socket === 'undefined') {
            const socket = io();
        }

        this.querySelectorAll('.numpad-button').forEach(function(btn) {
            btn.addEventListener('click', handleNumPadButton, false);
        })

        function handleNumPadButton(e) {
            const number = this.innerHTML
          
            socket.emit('NUMPAD_BUTTON_CLICK', { number: number });

            // if (number === 'Go') {
            //   socket.emit('NUMGAME_GUESS', { guess: document.querySelector('#player_guess').innerHTML })
            // }
            // else {
            //   document.querySelector('#player_guess').innerHTML += this.innerHTML
            // }
            
          }

    }

    connectedCallback() {
        if (!this.rendered ) {
            this.render();
            this.rendered = true;
        }
    }

    disconnectedCallback() {
        // the browser calls this method, when the element is removed from the document
        // (it can be called many times if an element is added/removed many times)
      }

    static get observedAttributes() {
       return ['name', 'class'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
       // this.render()
    }
}

customElements.define('bdly-numpad', NumPad)