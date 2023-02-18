class Weather extends HTMLElement {
    render() {
        let markup = `
            <style>
                      
            </style>

            <h2><span>${location.name}, ${location.region}</span></h2> 
            <img src=${current.condition.icon} style="width: 100px">
            <table style="width: 100%">
            <tr>
            <td></td>
            <td style="font-size: 2em;">${Math.round(current.temp_f)}<sup style="font-size: .6em">°F</sup></td>
            <td style="font-size: 2em;">${current.humidity}%</td>
            </tr>
            </table>

            <table style="width: 100%">
            </table>
        `;

        async function getWeather() {
            const key = '8815275c285e40149bd222225222712';
            //const url = `http://api.weatherapi.com/v1/current.json?key=${key}&q=30236&aqi=no`;
            const url = `https://api.weatherapi.com/v1/forecast.json?key=${key}&q=30236&days=3&aqi=no&alerts=no`;
        
            let response = await fetch(url);
            let data = await response.json();
            const { location, current, forecast } = data;
        
            let markup = ` 
                <h2><span>${location.name}, ${location.region}</span></h2> 
                <img src=${current.condition.icon} style="width: 100px">
                <table style="width: 100%">
                <tr>
                <td></td>
                <td style="font-size: 2em;">${Math.round(current.temp_f)}<sup style="font-size: .6em">°F</sup></td>
                <td style="font-size: 2em;">${current.humidity}%</td>
                </tr>
                </table>`;
        
            markup += '<table style="width: 100%">';
        
            for (let i=0; i<forecast.forecastday.length; i++) {
                let d = forecast.forecastday[i];
                let dd = new Date(d.date).toLocaleDateString('en-us', {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric"
                  })
        
                markup += `<tr><td>${dd}</td>
                    <td><img src="${d.day.condition.icon}" style="width: 50px" /></td>
                    <td>${Math.round(d.day.maxtemp_f)}</td>
                    <td>${d.day.avghumidity}%</td></tr>`;
            }
        
            markup += '</table>';
        
            __weather_block.innerHTML = markup
        }


        this.innerHTML = markup;
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

customElements.define('brdrly-weather', Weather);