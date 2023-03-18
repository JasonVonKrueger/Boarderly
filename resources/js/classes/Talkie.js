class Talkie extends HTMLElement {
    constructor() {
        super();
    }

    render() {
        const socket = io();

        let markup = `
            <style>
                .play-button {
                    height: 200px;
                    width: 200px;
                    display: block;
                    margin: 30px auto;
                    overflow: hidden;
                    position: relative;
                }
            
                .left {
                    height: 100%;
                    float: left;
                    background-color: #fff;
                    width: 36%;
                    transition: all 0.25s ease;
                    overflow: hidden;
                }
            
                .triangle-1 {
                    -webkit-transform: translate(0, -100%);
                    transform: translate(0, -100%);
                }
            
                .triangle-2 {
                    -webkit-transform: translate(0, 100%);
                    transform: translate(0, 100%);
                }
            
                .triangle-1,
                .triangle-2 {
                    position: absolute;
                    top: 0;
                    right: 0;
                    background-color: transparent;
                    width: 0;
                    height: 0;
                    border-right: 300px solid #c0392b;
                    border-top: 150px solid transparent;
                    border-bottom: 150px solid transparent;
                    transition: -webkit-transform 0.25s ease;
                    transition: transform 0.25s ease;
                    transition: transform 0.25s ease, -webkit-transform 0.25s ease;
                }
            
                .right {
                    height: 100%;
                    float: right;
                    width: 36%;
                    background-color: #fff;
                    transition: all 0.25s ease;
                }
            
                .paused .left {
                    width: 50%;
                }
            
                .paused .right {
                    width: 50%;
                }
            
                .paused .triangle-1 {
                    -webkit-transform: translate(0, -50%);
                    transform: translate(0, -50%);
                }
            
                .paused .triangle-2 {
                    -webkit-transform: translate(0, 50%);
                    transform: translate(0, 50%);
                }

                #btn_action {
                    background: #456BD9;
                    border: .5rem solid #ccc;
                    border-radius: 50%;
                    box-shadow: 0.375em 0.375em 0 0 rgba(255, 28, 63, 0.125);
                    height: 7em;
                    width: 7em;

                    display: flex;
                    align-items: center;
                    text-align: center;
                }

                #btn_action.talking{
                    background-color: red;
                }

                #action {
                    font-size: 2rem;
                }

                #speaker {
                    display: grid;
                    grid-template-columns: auto auto auto auto auto auto;
                    height: 6rem;
                    width: 8rem;
                }

                #speaker > div {
                    background-color: #666;
                    border .5rem solid #000;
                    border-radius: 50%;
                    width: .3rem;
                    height: .3rem;
                }
            </style>

            <div style="min-height: 50vh;">
                <div id="speaker">
                    <div></div><div></div><div></div><div></div>
                    <div></div><div></div><div></div><div></div>
                    <div></div><div></div><div></div><div></div>
                    <div></div><div></div><div></div><div></div>
                    <div></div><div></div><div></div><div></div>
                    <div></div><div></div><div></div><div></div>
                    <div></div><div></div><div></div><div></div>
                    <div></div><div></div><div></div><div></div>
                    <div></div><div></div><div></div><div></div>
                </div>

                <div id="btn_action"><span id="action"></span></div>

                <a class="play-button paused" href="#" style="display: none;">
                    <div class="left"></div>
                    <div class="right"></div>
                    <div class="triangle-1"></div>
                    <div class="triangle-2"></div>
                </a>

                <div style="text-align:center;">
                    <a>Users online:</a>
                    <a class="usercount"></a>
                </div>
            </div>
            
        `;
        
        this.innerHTML = markup;

        //$('#btn_action').addEventListener('mousedown', handleMouseDown, false);

        socket.on('TALKIE_MESSAGE', function (audioChunks) {
            const audioBlob = new Blob(audioChunks);
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            audio.play();
        });

        socket.on('TALKIE_USERS', function (usercount) {
            $('.usercount').innerHTML = usercount;
        });
    
        // navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        //     let mediaRecorder = new MediaRecorder(stream);
        //     let audioChunks = [];

        //     $('#btn_action').addEventListener('click', function(e) {
        //         if (mediaRecorder.state === 'inactive') {
        //             $('#btn_action').classList.add('talking');
        //             mediaRecorder.start();
        //         }
        //         else {
        //             mediaRecorder.stop();      
        //         }
        //     });

        //     mediaRecorder.addEventListener("dataavailable", event => {
        //         audioChunks.push(event.data);
        //     });

        //     mediaRecorder.addEventListener("stop", () => {
        //         $('#btn_action').classList.remove('talking');
        //         //socket.broadcast.emit('audioMessage', audioChunks);
        //         socket.emit('TALKIE_MESSAGE', audioChunks);
        //         audioChunks = [];
        //     });
        // });


        //const shadow = this.attachShadow({ mode: 'open' });

        function $(element) { return document.querySelector(element) }
    }

    connectedCallback() {
        if (!this.rendered) {
            this.render();
            this.rendered = true;
        }
    }

    disconnectedCallback() {
        // the browser calls this method, when the element is removed from the document
        // (it can be called many times if an element is added/removed many times)
      }

    static get observedAttributes() {
       //return ['name', 'class', 'icon', 'label', 'for']
    }

    attributeChangedCallback(name, oldValue, newValue) {
        this.render()
    }
}

customElements.define('bdly-talkie', Talkie)