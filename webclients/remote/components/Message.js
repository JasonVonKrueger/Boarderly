/* Widget for Boarderly remote */
class Message extends HTMLElement {
    constructor() {
        super();

        this.boarderly = JSON.parse(localStorage.getItem('boarderly'));
    }

    render() {
        let markup = `
            <style>

            </style>
            <fieldset>
                <legend>New Message</legend>
                <textarea id="__message" name="__message" placeholder="Write something.." style="height:200px"></textarea>
                <push-button id="btn_send_message" label="Send" for="c_message">
                </push-button>
                <div id="message_answer"></div>
            </fieldset>
        `;

        this.innerHTML = markup;

        if (typeof socket === 'undefined') {
            const socket = io();
        }

        this.querySelector('#btn_send_message').addEventListener('click', handleSendMessage, false);

        function handleSendMessage() {
            if (!this.boarderly.fname || !this.boarderly.lname || !this.boarderly.token) return false
          
            let d = new Date()
            socket.emit('POST_MESSAGE', {
              from: `${this.boarderly.fname} ${this.boarderly.lname}`,
              message: __message.value,
              date: d.toLocaleString(),
              token: this.boarderly.token,
              file_name: this.boarderly.file_name
            })
          
            this.classList.add('hidden');
            document.querySelector('#message_answer').innerHTML = 'Message sent!';
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

customElements.define('bdly-message', Message)