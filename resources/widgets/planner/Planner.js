class Planner extends HTMLElement {
  constructor() {
    super();
    // this.style.backgroundColor = "blue";
    // this.style.color = "white";
    // this.addEventListener("click", () => alert("Hello world!"));
  }
  
  render() {
    let d = new Date().toLocaleDateString('en-us', {
      weekday: "long", year: "numeric", month: "short", day: "numeric"
    })

    const socket = io();

    socket.emit('REFRESH_PLANNER_EVENTS');
    socket.on('REFRESH_PLANNER_EVENTS', this.refreshPlnrEvents, false);

    let markup = `
            <style>
            .calendar {
              margin: 0;
              text-align: left;
              width: 100%;
              font-family: "Roboto", sans-serif;
              padding: 10px 20px;
              color: #fff;
              display: inline-block;
            }
            
            .calendar_plan {
              margin: 20px 0 40px;
            }
          
            .cl_plan {
              border: 1px solid #bbb;
              border-radius: 6px;
              padding: 1rem;
              color: #fff;
              background-color: #57a8a6;
            }
            
            .cl_copy {
              font-size: 2rem;
              display: inline-block;
            }
            
            .ce_title {
              font-size: 1.3rem;
              padding: .5rem;
              border: 1px solid #bbb;
              border-radius: 6px;
              background-color: #64b7d8bf;
            }
            
            .event_item {
              margin: 18px 0;
              padding: 5px;
              cursor: pointer;
            }

            .event_item:hover {
              background-color: #524a64fa;
              box-shadow: 0px 0px 52px -18px rgba(0, 0, 0, 0.75);
            }

            .event_item:hover .ei_Dot {
              background-color: #fff;
            }

            .event_item:hover .ei_Copy, .event_item:hover .ei_Title {
              color: #fff;
            }
            
            .ei_Dot, .ei_Title {
              display: inline-block;
            }
            
            .ei_Dot {
              border-radius: 50%;
              width: 10px;
              height: 10px;
              background-color: #A39D9E;
              box-shadow: 0px 0px 52px -18px rgba(0, 0, 0, 0.75);
            }
            
            .dot_active {
              background-color: #FF8494;
            }
          
            .ei_Title {
              margin-left: 10px;
              color: #aaa;
            }
            
            .ei_Copy {
              font-size: 1rem;
              margin-left: 27px;
            }
            </style>
            
            <div class="calendar">
              <div class="calendar_plan">
                <div class="cl_plan">
                  <div class="cl_title">Today</div>
                  <div class="cl_copy">${d}</div>
                </div>
              </div>
              <div class="calendar_events">
                <p class="ce_title">Upcoming Events</p>
                <div id="__plnr_items"></div>
              </div>
            </div> 
        `;

    this.innerHTML = markup;
  }

  connectedCallback() {
    if (!this.rendered) {
      this.render()
      this.rendered = true
    }
  }

  refreshPlnrEvents(data) {
    // clear the list and rebuild
    while (__plnr_items.firstChild) {
      __plnr_items.removeChild(__plnr_items.firstChild);
    }   
   
    let today = new Date().toLocaleDateString('en-us', {
      weekday: "long", year: "numeric", month: "short", day: "numeric"
    })

    let markup = ''
   
    for (let i = 0; i < data.length; i++) {
      // format the date and time
      let m = data[i].date + ' ' + data[i].time

      let t = new Date(m).toLocaleString('en-US', { 
        hour: 'numeric', minute: 'numeric', hour12: true 
      })

      let d = new Date(m).toLocaleDateString('en-us', {
        weekday: "long", year: "numeric", month: "short", day: "numeric"
      })

      markup += `
        <div class="event_item">
        <div class="ei_Dot ${(today === d) ? 'dot_active' : ''}"></div>
        <div class="ei_Title">${t} on ${d}</div>
        <div class="ei_Copy">${data[i].event}</div>
        </div>`;
    }

    __plnr_items.innerHTML = markup
  }

  static get observedAttributes() {
    return ['name', 'class']
  }

  compareDates(date_to_compare) {
    let today = new Date().toLocaleDateString('en-us', {
      weekday: "long", year: "numeric", month: "short", day: "numeric"
    })
  }

  attributeChangedCallback(name, oldValue, newValue) {
    this.render();
  }
}

customElements.define('event-planner', Planner);