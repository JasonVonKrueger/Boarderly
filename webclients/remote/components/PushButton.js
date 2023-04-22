/* Widget for Boarderly remote */
class PushButton extends HTMLElement {
    constructor() {
        super();
    }

    render() {
        const clicker = new Audio();
        clicker.src = '/resources/sounds/cork-85200.mp3';

        let markup = `
            <style>
                .push-button {
                    width: 80px;
                    text-align: center;
                    cursor: pointer;
                    padding: .5rem;
                    background-color: #f25022;
                    box-shadow: 0 0 0 0 #f25022 inset, 0 0 0 2px rgba(255, 255, 255, 0.15) inset, 0 8px 0 0 #c93a12, 0 8px 0 1px rgba(0, 0, 0, 0.4), 0 8px 8px 1px rgba(0, 0, 0, 0.5);
                    transition: 0.15s;
                    font-size: 1rem;
                }

                .push-button .push-button:hover,
                .push-button:focus {
                  background-color: #ff451a;
                  box-shadow: 0 0 0 1px #FF3000 inset, 0 0 0 2px rgba(255, 255, 255, 0.15) inset, 0 10px 0 0 #e62b00, 0 10px 0 1px rgba(0, 0, 0, 0.4), 0 10px 8px 1px rgba(0, 0, 0, 0.6);
                }

                .push-button:active,
                .push-button.activated {
                    box-shadow: 0 0 0 1px #ff5c36 inset, 0 0 0 2px rgba(255, 255, 255, 0.15) inset, 0 0 0 1px rgba(0, 0, 0, 0.4);
                    background-color: #ff5c36;
                    transform: translateY(10px);
                }

                .push-button > span {
                    vertical-align: middle;
                    text-align: center;
                }

                .push-button sl-icon {
                    font-size: 1.5rem;
                    padding: 0px .5rem 0px .5rem;
                    vertical-align: middle;
                    text-align: center;
                }
            </style>

            <div class="push-button">
                <span class="pb-icon"><sl-icon name="${this.getAttribute('icon') || ''}"></sl-icon></span>
                <span>${this.getAttribute('label')}</span>
            </div>
            
        `;

        this.innerHTML = markup;

        // this.addEventListener('mousedown', function(e) {
        //     clicker.play();
        // }, false);

        if (typeof socket === 'undefined') {
            const socket = io();
        }
        
        // take out the left span if no icon is provided
        if (!this.getAttribute('icon')) {
            this.querySelector('.pb-icon').classList.add('hidden');
        }
    }

    connectedCallback() {
        if (!this.rendered ) {
            this.render();
            this.rendered = true;
        }
    }

    static get observedAttributes() {
       return ['name', 'class', 'icon', 'label', 'for', 'handler']
    }

    attributeChangedCallback(name, oldValue, newValue) {
       // this.render()
    }
}

customElements.define('push-button', PushButton)