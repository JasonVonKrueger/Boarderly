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

                .modal {
                    position: fixed;
                    z-index: 10; 
                    left: 0;
                    top: 0;
                    width: 100%;
                    height: 100%; 
                    overflow: auto;
                    background-color: rgb(0,0,0);
                    background-color: rgba(0,0,0,0.9);
                    transition: transform .7s;
                  }
                  
                  .modal-content {

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

            <div class="modal hidden">
                <div class="modal-content"></div>
            </div>
        `;

        this.innerHTML = markup;
        this.addEventListener('click', handleStartGame, false);

        function $(element) { return document.querySelector(element); }

        function handleStartGame() {
            $('.modal-content').innerHTML = `<iframe src="/resources/widgets/${this.getAttribute('game')}/index.html"></iframe>`;
            $('.modal').classList.remove('hidden');
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