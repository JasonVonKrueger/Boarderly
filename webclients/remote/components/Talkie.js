class Talkie extends HTMLElement {
    constructor() {
        super();

        this.boarderly = JSON.parse(localStorage.getItem('boarderly'));
    }

    render() {
        var peer = new Peer();
        peer.on('open', function(id) {
            console.log('My peer ID is: ' + id);
        });

        var conn = peer.connect('663cf26e-84af-4111-ab77-8a70decf3c3d');
        // on open will be launch when you successfully connect to PeerServer
        conn.on('open', function(){
          // here you have conn.id
          conn.send('hi!');
        });


        peer.on('connection', function(conn) {
            conn.on('data', function(data){
              // Will print 'hi!'
              console.log(data);
            });
          });


        let markup = `
            <style>   
                .col-1 {
                    display: grid;
                    grid-template-columns: auto; 
                    row-gap: 4rem;
                    width: 100%;
                    justify-content: space-evenly;
                    align-content: center;
                }

                .col-1 > div {
                    width: 100%;
                }

                #btn_action {
                    background: #456BD9;
                    border: .5rem solid #ccc;
                    border-radius: 50%;
                    box-shadow: 0.375em 0.375em 0 0 rgba(255, 28, 63, 0.125);
                    height: 7em;
                    width: 7em;
                    xmargin-top: 4rem;
                    margin-left: auto;
                    margin-right: auto;
                }

                #btn_action.talking{
                    background-color: red;
                }

                #action {
                    font-size: 2rem;
                }

                #speaker {
                    display: grid;
                    grid-template-columns: auto auto auto auto auto auto auto auto auto;
                    col-gap: 1rem;
                    height: 8rem;
                    width: 12rem;
                }

                #speaker > div {
                    background-color: #666;
                    border .5rem solid #000;
                    border-radius: 50%;
                    width: .3rem;
                    height: .3rem;
                }
            </style>

            <div class="col-1">
                <div id="talkers">
                    <div>Talkers here now:&nbsp; <span id="talkers_block"></span></div>
                </div>

                <div>
                    <div id="speaker">
                        <div></div><div></div><div></div><div></div><div></div><div></div>
                        <div></div><div></div><div></div><div></div><div></div><div></div>
                        <div></div><div></div><div></div><div></div><div></div><div></div>
                        <div></div><div></div><div></div><div></div><div></div><div></div>
                        <div></div><div></div><div></div><div></div><div></div><div></div>
                        <div></div><div></div><div></div><div></div><div></div><div></div>
                        <div></div><div></div><div></div><div></div><div></div><div></div>
                        <div></div><div></div><div></div><div></div><div></div><div></div>
                        <div></div><div></div><div></div><div></div><div></div><div></div>
                    </div>
                </div>

                <div>
                    <div id="btn_action"><span id="action"></span></div>
                </div>
            </div>
        `;
  
        this.innerHTML = markup;

        if (typeof socket === 'undefined') {
            const socket = io();
        }

        const snd_button_push = new Howl({
            src: ['/resources/sounds/din-ding-89718.mp3']
        })

        socket.emit('NEW_TALKER', this.boarderly.fname);
        socket.on('NEW_TALKER', function(data) {
            let talker_markup = `${data}`;
            // data.split(',').forEach(function(talker) {
            //     talker_markup += `<div>${talker}</div>`;
            // });

            $('#talkers_block').innerHTML = talker_markup;
        });
        
        socket.on('TALKIE_MESSAGE', function (audioChunks) {
            const audioBlob = new Blob(audioChunks);
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            snd_button_push.play()
            audio.play();
        });
    
        navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
            let mediaRecorder = new MediaRecorder(stream);
            let audioChunks = [];

            $('#btn_action').addEventListener('click', function(e) {
                e.preventDefault();
                
                if (mediaRecorder.state === 'inactive') {
                    $('#btn_action').classList.add('talking');
                    mediaRecorder.start();
                }
                else {
                    mediaRecorder.stop();      
                }
            });

            mediaRecorder.addEventListener("dataavailable", event => {
                audioChunks.push(event.data);
            });

            mediaRecorder.addEventListener("stop", () => {
                $('#btn_action').classList.remove('talking');
                //socket.broadcast.emit('TALKIE_MESSAGE', audioChunks);
                socket.emit('TALKIE_MESSAGE', audioChunks);
                audioChunks = [];
            });
        });

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
        //this.render()
    }
}

customElements.define('bdly-talkie', Talkie)