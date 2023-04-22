class Messages extends HTMLElement {
    constructor() {
        super();
    }

    render() {
        const __component = this;

        if (typeof socket === 'undefined') {
            const socket = io();
        }

        socket.emit('GET_MESSAGES');

        socket.on('POST_MESSAGE', function() {
          showToast('<sl-icon name="envelope-fill"></sl-icon> You have a new message!', 3000);
        });

        socket.on('REFRESH_MESSAGES', function(data) {
          let markup = `
            <style>
              #message_history {
                list-style-type: none;
                padding: 0;
                margin: 0;
              }

              .message-props {
                text-align: left;
                color: #fff;
                font-size: 1rem;
                padding: .25rem;
                padding-bottom: 1rem;
              }
              
              .message-props.bubble {
                line-height: 4rem;
                padding: 4rem;
              }

              .message-data-time {
                color: #bbb;
                padding-left: .5rem;
                font-style: italic;
              }

              .bubble {
                position: relative;
                background: #fff;
                color: #666;
                text-align: left;
                height: 3rem;
                border-radius: 10px;
                padding: .6em;
                margin-bottom: 1em;
              }

              .bubble:after {
                  content: '';
                  position: absolute;
                  display: block;
                  width: 0;
                  z-index: 1;
                  border-style: solid;
                  border-color: #fff transparent;
                  border-width: 0 13px 12px;
                  top: -12px;
                  left: 10%;
                  margin-left: -13px;
              }
              
            </style>
          `;

          markup += '<ul id="message_history">'

          for (let i = 0; i < data.length; i++) {
            markup += `
                <li class="clearfix">
                  <div class="message-props">
                    <span class="message-data-name">${data[i].from}</span>
                    <span class="message-data-time">${getRelativeTime(data[i].date)}</span>
                  </div>
                  <div class="bubble">${data[i].message}</div>
                </li>
            `;
          }

          markup += '</ul>';
          __component.innerHTML = markup;

        });

        function getRelativeTime(__date) {
          let date = new Date(__date);
          let timeMs = date.getTime();
          
          const deltaSeconds = Math.round((timeMs - Date.now()) / 1000);
          const cutoffs = [60, 3600, 86400, 86400 * 7, 86400 * 30, 86400 * 365, Infinity];
          const units = ["second", "minute", "hour", "day", "week", "month", "year"];
          const unitIndex = cutoffs.findIndex(cutoff => cutoff > Math.abs(deltaSeconds));
          const divisor = unitIndex ? cutoffs[unitIndex - 1] : 1;
          const rtf = new Intl.RelativeTimeFormat(navigator.language, { numeric: "auto" });
          
          return rtf.format(Math.floor(deltaSeconds / divisor), units[unitIndex]);
        }

        function showToast(message, ms=3000) {
          $('#toast').innerHTML = message;
          $('#toast').classList.add('show');
          
          setTimeout(function(){ 
              $('#toast').classList.remove('show');
          }, ms);
        }

        function $(element) { return document.querySelector(element); }
    }

    connectedCallback() {
        if (!this.rendered) {
          this.render();
          this.rendered = true;
        }
    }

    disconnectedCallback() {
        console.log('Messages disconnected')
        // the browser calls this method, when the element is removed from the document
        // (it can be called many times if an element is added/removed many times)
    }

    static get observedAttributes() {
        return ['name', 'cols'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        //this.render();
    }
}

customElements.define('bdly-messages', Messages);