/* Widget for Boarderly remote */
class Planner extends HTMLElement {
    constructor() {
        super();
    }

    render() {
        let markup = `
            <style>
            .fc-events {
                display: flex;
                flex-direction: column;
            }
              
            .event {
                border-radius: 5px;
                align-items: center;
                justify-content: space-between;
                border: 1px solid #939697;
                background-color: #fcff9e;
                height: 50px;
                margin-bottom: 8px;
                padding: 5px 10px;
                display: flex;
                color: #ddd;
                background: rgba(255,255,255,0.1);
            }
            </style>

            <fieldset>
                <legend>New Event</legend>
                <div id="newevent" class="fc-events">
                <div style="flex: 100%;">
                    <input id="event_subject" type="text" placeholder="Event details">
                </div>
                <div style="flex: 100%;">
                    <input type="date" id="event_date">
                </div>
                <div style="flex: 100%;">
                    <input type="time" id="event_time">
                </div>
                <div style="margin-left: auto; order: 2;">
                    <push-button label="Add Event"></push-button>
                </div>
                </div>
            </fieldset>

          <div id="event_block" style="flex: 100%; padding-top: 2rem;"></div>
        `;

        this.innerHTML = markup;

        if (typeof socket === 'undefined') {
            const socket = io();
        }

        if (typeof boarderly === 'undefined') {
            const boarderly = JSON.parse(localStorage.getItem('boarderly'));
        }

        const event_subject = this.querySelector('#event_subject');
        const event_date = this.querySelector('#event_date');
        const event_time = this.querySelector('#event_time');
        const event_block = this.querySelector('#event_block');
        const push_button = this.querySelector('push-button');

        socket.emit('REFRESH_PLANNER_EVENTS');
        socket.on('REFRESH_PLANNER_EVENTS', refreshEvents)
        
        push_button.addEventListener('click', handleNewEvent, false);

        function handleNewEvent() {
            if (!boarderly.fname || !boarderly.lname || !boarderly.token) return false;
            if (event_subject.value.length == 0) return;

            push_button.classList.add('hidden');

            // clear the list and rebuild
            while (event_block.firstChild) {
                event_block.removeChild(event_block.firstChild)
            }

            let d = new Date()
            socket.emit('POST_PLANNER_EVENT', {
                event: event_subject.value,
                date: event_date.value,
                time: event_time.value,
                created_by: `${boarderly.fname} ${boarderly.lname}`,
                created_on: d.toLocaleString(),
                token: boarderly.token
            })

            socket.emit('REFRESH_PLANNER_EVENTS');
        }

        function refreshEvents(data) {
            for (let i = 0; i < data.length; i++) {  
              const event = document.createElement('div')
              const l = document.createElement('span')
              const r = document.createElement('span')
          
              l.innerHTML = data[i].event;
              r.innerHTML = `<span class="material-symbols-outlined" style="cursor: pointer; color: #cf5e5e;" onclick="deleteEvent('${data[i].id}')">delete</span>`
          
              event.appendChild(l)
              event.appendChild(r)
              event.classList.add('event')
          
              event_block.appendChild(event)
            }
        }

        function deleteEvent(id) {
            socket.emit('DELETE_PLANNER_EVENT', { id: id })
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

customElements.define('bdly-planner', Planner)