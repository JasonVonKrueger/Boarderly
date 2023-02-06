class FaceName extends HTMLElement {
    render() {
        let markup = '';

        markup = `
                <style>
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
        `;

        this.innerHTML = markup;
    }

    connectedCallback() { // (2)
        if (!this.rendered) {
          this.render();
          this.rendered = true;
        }
      }

    static get observedAttributes() {
        return ['name', 'path'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        this.render();
    }
}

customElements.define('face-name', FaceName);