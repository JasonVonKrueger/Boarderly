class Me extends HTMLElement {
    render() {
        let markup = `
            <style>
                :root {
                    --count: 0;
                }
            
                .typewriter {
                    display: inline-block;
                    padding: 2rem;
                    font-family: monospace;
                    font-size: 2rem;
                    margin-top: 10%;
                }
                
                .typed {
                    overflow: hidden;
                    white-space: nowrap;
                    width: 0;
                    border-right: 1ch solid rgba(255, 255, 255, .95);
                    animation: typing 4s steps(64) 1s 1 normal both,
                        blinkCursor .7s steps(64) var(--count) normal;
                }
                
                @keyframes typing {
                    from { width: 0 }
                    to { width: 100% }
                }
                
                @keyframes blinkCursor {
                    from { border-right-color: rgba(255, 255, 255, .75); }
                    to { border-right-color: transparent; }
                }          
            </style>

            <div class="typewriter" style="color: #ccc;">
            <p class="hidden">My name is Kathleen Poore but I am also known as Sherry.</p>
            <p class="hidden">I was born on April 5th, 1939 in Somewhere, XY.</p>
            <p class="hidden">I have four kids: Debbie, Diane, Rick and Roger.</p>
            <p class="hidden">My sisters are Karen Micarelli and Lynn Richmann.</p>
            <p class="hidden">My brothers are Joe Sheridan and Dennis Sheridan.</p>
            </div>
        `;

        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        async function process(i) {
            // set the number of chars in the element
            const t = p[i].innerHTML;
            p[i].style.setProperty('--count', t.length);
            p[i].classList.remove('hidden');
            p[i].classList.add('typed');
            await sleep(5000);
            p[i].classList.remove('typed');
        }

        async function present() {
            for (let i = 0; i < p.length; i++) {
                await process(i);
            }
        }

        this.innerHTML = markup;
        const p = document.querySelectorAll('.typewriter p');

        present();
    }

    connectedCallback() {
        if (!this.rendered) {
            this.render();
            this.rendered = true;
        }
    }

    static get observedAttributes() {
        return ['name', 'class'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        this.render();
    }
}

customElements.define('about-me', Me);