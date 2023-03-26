class Register extends HTMLElement {
    constructor() {
        super();
    }

    render() {
        let markup = `
            <style>   

            </style>

            <p style="text-align: left;">Please register this device to use it with Boarderly!</p>

            <input type="text" id="fname" placeholder="First name..." />
            <input type="text" id="lname" placeholder="Last name..." />
            <!-- <input type="text" id="__board_code" placeholder="Board code..." /> -->
        
            <p>(Optional) Add a contact picture to help with visual memory stimulation!</p>
        
            <p><input type="file" id="contact_pic" accept="image/*"></p>
            <p><img src="" id="avatar_preview" class="preview hidden" alt="Image preview" style="width: auto; height: 120px;" />
            </p>
        
            <push-button id="btn_save" label="Save" icon="save"></push-button>
        
            <button id="btn_reset" class="hidden" onclick="resetDevice()">
              <span>Reset</span>
            </button>
        
            <div id="register_answer" class="hidden"></div>
        `;

        this.innerHTML = markup;

        if (typeof socket === 'undefined') {
            const socket = io();
        }

        const fname = this.querySelector('#fname');
        const lname = this.querySelector('#lname');
        const fileInput = this.querySelector('input[type="file"]')
        const preview = this.querySelector('img.preview')
        const reader = new FileReader()

        this.querySelector('#btn_save').addEventListener('click', handleSaveRegistration, false);
        fileInput.addEventListener('change', handleSelected, false);

        function handleEvent(e) {
            if (e.type === "load") {
                preview.src = reader.result
                showElement('avatar_preview')
                showElement('btn_save')
            }
        }

        function handleSelected(e) {
            const selectedFile = fileInput.files[0]
            if (selectedFile) {
                reader.addEventListener('load', handleEvent)
                reader.readAsDataURL(selectedFile)
            }
        }

        async function handleSaveRegistration() {
            if (!fname.value || !lname.value) return false

            // go fetch a token
            let res = await fetch('/api/gettoken')
            let json = await res.json()
            const token = json.answer
            const data = {}

            data.fname = fname.value
            data.lname = lname.value
            data.token = token
            data.file_name = document.getElementById('contact_pic').files[0].name
            data.image = reader.result

            localStorage.setItem('boarderly', JSON.stringify(data));

            // save to server
            socket.emit('REGISTER_DEVICE', data)

            $('#btn_save').classList.add('hidden');
            $('#register_answer').innerHTML = 'Thanks for registering!';
            $('#register_answer').classList.remove('hidden');

            setTimeout(function(){ 
                window.location.reload();
            }, 4000);
        }

        function resetDevice() {
            localStorage.removeItem('boarderly');
            goHome();
        }

        function $(element) {
            return document.querySelector(element)
        }
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

customElements.define('bdly-register', Register)