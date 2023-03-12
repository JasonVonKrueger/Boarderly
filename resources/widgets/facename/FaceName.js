class FaceName extends HTMLElement {
    constructor() {
        super();
    }

    render() {
        let card_markup = `
            <img src="${this.getAttribute('card-face')}" />
        `;

        let modal_markup = `
                <style>
                .box {
                    display: flex;
                    height: 300px;
                    margin-top: 12%;
                    justify-content: center;
                    align-items: center;
                }

                .box > div {
                    xbackground-color: #f1f1f1;
                    color: white;
                    border-radius: 6px;
                    width: 400px;
                }

                .scene {
                    width: 320px;
                    height: 310px;
                    perspective: 1000px;
                    padding: 1rem;
                }

                .scene:hover {
                    cursor: pointer;
                }

                .flip-card {
                    margin-left: 1rem;
                    width: 100%;
                    height: 100%;
                    position: relative;
                    transition: transform 1s;
                    transform-style: preserve-3d;
                    background-color: #fff;
                }

                .card-face {
                    position: absolute;
                    height: 100%;
                    width: 100%;
                    backface-visibility: hidden;
                }

                .card-face-front {
                    
                }

                .card-face-back {
                    background: rgb(37, 73, 202);
                    transform: rotateY(180deg);
                    color: #fff;
                    text-align: center;
                }

                .flip-card.is-flipped {
                    transform: rotateY(180deg);
                }
            </style>

            <div class="box">
                <div class="scene" onclick="facenameFlip()">
                <div class="flip-card">
                    <div class="card-face card-face-front">
                        <div class="card-body">
                            <img src="${this.getAttribute('path')}" style="width: 100%" />
                        </div> 
                    </div>
                    <div class="card-face card-face-back">
                        <h2>${this.getAttribute('name') || ''}</h2>
                    </div>
                </div>
                </div> 
            </div>
        `;

        this.addEventListener('click', handleStartGame, false);

       
        //$('#modal_content').innerHTML = modal_markup;
        //$('#modal_content').classList.remove('hidden');
        this.innerHTML = card_markup;

        function handleStartGame() {
            //openModal('modal');
            $('.drawer-placement-bottom').innerHTML = modal_markup;
            $('.drawer-placement-bottom').show();
        }

        function $(element) { return document.querySelector(element); }
    }

    connectedCallback() {
        // if (!this.rendered) {
        //   this.render();
        //   this.rendered = true;
        // }
      }

    disconnectedCallback() {
    // the browser calls this method, when the element is removed from the document
    // (it can be called many times if an element is added/removed many times)
    }

    static get observedAttributes() {
        return ['name', 'path', 'card-face'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        this.render();
    }
}

customElements.define('face-name', FaceName);