class Game extends HTMLElement {
    constructor() {
        super();
    }

    render() {
        let card_desc = '<i>No description provided.</i>';

        if (this.getAttribute('card-text')){
            card_desc = `<div style="text-align: left;">${this.getAttribute('card-text')}</div>`;
        }

        if (this.getAttribute('card-image')) {
            card_desc = `<img src="${this.getAttribute('card-image')}" />`;
        }

        let markup = `
            <style>
                .game-overview .start-game {
                    margin-top: 5%;
                    font-size: 1rem;
                    padding: 1rem 2rem 1rem 2rem;
                }

                .overlay {
                    position: fixed;
                    z-index: 2; 
                    left: 0;
                    top: 0;
                    width: 100%;
                    height: 100%;
                    overflow: auto;
                    xbackground-color: rgb(0,0,0);
                    background-color: rgba(0,0,0,0.9);
                    opacity: 0;
                    transition: opacity .4s ease;
                    xfilter: blur(26px);
                  }

                .overlay.show {
                    opacity: 1;
                }

                .overlay:not(.show) {
                    opacity: 0;
                }

                #game-box {
                    background-color: #fff;
                    z-index: 20;
                    xposition: absolute;
                    xtop: 50%;
                    xtransform: translateY(-50%);
                }
                  
                #xgame-box {
                    z-index: 10;
                    position: absolute;
                 
                    display: block;
                    box-sizing: border-box;
                    margin: 0 auto;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 640px;
                    padding: 2rem;
                    border-radius: 0.25rem;
                    /*border: 1px solid #969696;*/
                    background: #fff;
                    box-shadow: 1px 1px 6px rgba(0,0,0,0.3);
                    max-height: 0;
                    opacity: 1;
                    padding-top: 0;
                    padding-bottom: 0;
                    overflow: hidden;
                    transition: all .5s;                   
                }

                .hidden {
                    display: none;
                }

                iframe {
                    width: 50vw;
                    height: 50vh;
                    margin-top: 12%;
                }
                
            </style>
            
            <div class="game-overview">
                <div>${card_desc}</div>
                <button class="start-game" style="display: none;">Play</button>
            </div>

            <div class="overlay">
                <div id="game-box">
                </div>
            </div>
        `;

        this.innerHTML = markup;

        document.addEventListener('keydown', handleKeyDown, false);
        this.querySelector('.overlay').addEventListener('click', handleStartGame, false);

        function $(element) { return document.querySelector(element); }

        function handleStartGame() {
            this.querySelector('.overlay').classList.add('show');
            $('#game-box').innerHTML = `<iframe src="/resources/widgets/${this.getAttribute('game')}/index.html"></iframe>`;
            //$('.modal').classList.remove('hidden'); 
        }

        function handleKeyDown(e) {
            switch (e.key) {
                case 'Escape':
                    this.querySelector('.overlay').classList.remove('show');
                    break;
            }
        }
    }

    connectedCallback() {
        if (!this.rendered) {
          this.render();
          this.rendered = true;
        }
    }

    disconnectedCallback() {
        console.log('Game disconnected')
        // the browser calls this method, when the element is removed from the document
        // (it can be called many times if an element is added/removed many times)
    }

    static get observedAttributes() {
        return ['name', 'game', 'card-image', 'card-text'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        this.render();
    }
}

customElements.define('bly-game', Game);