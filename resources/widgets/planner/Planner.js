class Planner extends HTMLElement {
  render() {
    let d = new Date().toLocaleDateString('en-us', {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric"
    })

    let markup = `
            <style>

          .container {
            margin: 0;
            width: 100%;
            text-align: left;
            background: none;
          }
          
          .light {
            background-color: #fff;
          }
          
          .calendar {
            width: 100%;
            font-family: "Roboto", sans-serif;
            padding: 10px 20px;
            color: #363b41;
            display: inline-block;
          }
          
          .calendar_plan {
            margin: 20px 0 40px;
          }
          
          .cl_plan {
            width: 100%;
            height: 140px;
            background-color: #524a64fa;
            padding: 30px;
            color: #fff;
          }
          
          .cl_copy {
            font-size: 20px;
            margin: 20px 0;
            display: inline-block;
          }
          
          .cl_add {
            display: inline-block;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background-color: #fff;
            cursor: pointer;
            margin: 0 0 0 65px;
            color: #c2c2c2;
            padding: 11px 13px;
          }
          
          .calendar_events {
            color: #A39D9E;
          }
          
          .ce_title {
            font-size: 14px;
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
            color: #363b41;
          }
          
          .ei_Copy {
            font-size: 12px;
            margin-left: 27px;
          }
          
            </style>

            <div class="container">
            <div class="calendar light">
              <div class="calendar_plan">
                <div class="cl_plan">
                  <div class="cl_title">Today</div>
                  <div class="cl_copy">${d}</div>
                </div>
              </div>
              <div class="calendar_events">
                <p class="ce_title">Upcoming Events</p>
                <div class="event_item">
                  <div class="ei_Dot dot_active"></div>
                  <div class="ei_Title">10:30 am</div>
                  <div class="ei_Copy">Monday briefing with the team</div>
                </div>
                <div class="event_item">
                  <div class="ei_Dot"></div>
                  <div class="ei_Title">12:00 pm</div>
                  <div class="ei_Copy">Lunch for with the besties</div>
                </div>
                <div class="event_item">
                  <div class="ei_Dot"></div>
                  <div class="ei_Title">13:00 pm</div>
                  <div class="ei_Copy">Meet with the client for final design <br> @foofinder</div>
                </div>
                <div class="event_item">
                  <div class="ei_Dot"></div>
                  <div class="ei_Title">14:30 am</div>
                  <div class="ei_Copy">Plan event night to inspire students</div>
                </div>
                <div class="event_item">
                  <div class="ei_Dot"></div>
                  <div class="ei_Title">15:30 am</div>
                  <div class="ei_Copy">Add some more events to the calendar</div>
                </div>
              </div>
            </div>          

        `;

    this.innerHTML = markup;
  }

  connectedCallback() {
    if (!this.rendered) {
      this.render();
      this.rendered = true;
    }
  }

  static get observedAttributes() {
    return ['name', 'class']
  }

  attributeChangedCallback(name, oldValue, newValue) {
    this.render();
  }
}

customElements.define('event-planner', Planner);