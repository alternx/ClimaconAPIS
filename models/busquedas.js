const fs = require('fs');

const axios = require('axios');

class Busquedas {

    historial = [];
    dbPath = './db/database.json';


    constructor() {
        this.leerDB();
    }

    get historialCapitalizado() {

        return this.historial.map(lugar => {
            let palabras = lugar.split(' ');
            palabras = palabras.map(p => p[0].toUpperCase() + p.substring(1));

            return palabras.join(' ');

        });


    }


    get paramsMapbox() {
        return {
            'access_token': process.env.MAPBOX_KEY,
            'limit': 5,
            'language': 'es'

        };
    }

    get paramsOpenWeather() {
        return {
            'appid': process.env.OPENWEATHER_KEY,
            'units': 'metric',
            'lang': 'es'
        };
    }


    async ciudad(lugar = '') {

        try {
            //Petición http

            const instance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${lugar}.json`,
                params: this.paramsMapbox
            });

            const resp = await instance.get();

            //retornar los lugares que conicidan

            return resp.data.features.map(lugar => ({
                id: lugar.id,
                nombre: lugar.place_name,
                lng: lugar.center[0],
                lat: lugar.center[1]
            }));

        } catch (error) {
            return []; //retornar vacío
        }
    }


    async climaLugar(lat, lon) {

        try {
            //Petición http

            const instance = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/weather`,
                params: {...this.paramsOpenWeather, lat, lon }
            });

            const resp = await instance.get();

            const { weather, main } = resp.data;

            //Retornar los datos del clima

            return {
                desc: weather[0].description,
                min: main.temp_min,
                max: main.temp_max,
                temp: main.temp
            }


        } catch (error) {
            console.log(error);
        }
    }

    agregarHistorial(lugar = '') {

        if (this.historial.includes(lugar.toLowerCase())) {
            return;
        }

        this.historial = this.historial.splice(0, 5);

        this.historial.unshift(lugar.toLowerCase());

        this.guardarDB();

    }

    guardarDB() {

        const payload = {
            historial: this.historial
        }

        fs.writeFileSync(this.dbPath, JSON.stringify(payload));
    }

    leerDB() {

        //Si existe la DB (o sea el archivo)
        if (fs.existsSync(this.dbPath)) {

            //Lee y parsea el historial            
            const info = fs.readFileSync(this.dbPath, { enconding: 'utf-8' });
            const data = JSON.parse(info);

            //Carga el historial ya parseado
            this.historial = data.historial;
        }
    }


}

module.exports = Busquedas;