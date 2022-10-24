const fs = require('fs');
const axios = require('axios');

class Busquedas{

    historial = [];  
    dbPath = './db/database.json';

    constructor(){
        this.leerDeBD();
    }

    // componer los parámetros de la request a mapbox
    get paramsMapBox(){
        return {
            'language': 'es',
            'limit': 5,
            'access_token': process.env.MAPBOX_KEY,
        }
    }

    get paramsOpenWheather(){
        return {   
            'appid': process.env.OPENWHEATHER_KEY,
            'units': 'metric',
            'lang': 'es'
        }
    }

    async ciudad(lugar = ''){
        try{
            //crear instancia de axios
            const instance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${lugar}.json`,
                params: this.paramsMapBox                 
        });    
        
            // http get para recibir los lugares
            const resp = await instance.get();
            
            // transformamos y devolvemos
            return resp.data.features.map( lugar => (
                {
                    id: lugar.id,
                    nombre: lugar.place_name,
                    lng: lugar.center[0],
                    lat: lugar.center[1]
                }
            ));
        }
        catch(error){
            return []
        }
    }

    async climaLugar(lat, lon){
        try{
            
            const instance = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/weather?`,
                params: {...this.paramsOpenWheather, lat , lon}
            });
            

            const resp = await instance.get();
            const {weather, main} = resp.data;
            return {
                'desc': weather[0].description,
                'min': main.temp_min,
                'max': main.temp_max,
                'temperatura':main.temp
            }

        }
        catch(error){
            console.log(error);
        }
    }

    agregarHistorial(lugar = ''){
        const exists = this.historial.find(lug => lug === lugar);
        if (!exists)
            this.historial.unshift(lugar);
        
        // eliminamos el quinto
        this.historial = this.historial.splice(0,5);

        // guardar en bd
        this.guardarEnBD();
    }

    guardarEnBD(){
        const payload = {
            historial: this.historial
        }
        fs.writeFileSync(this.dbPath, JSON.stringify(payload));
    }

    leerDeBD(){
        // comprobamos que existe 
        if (!fs.existsSync(this.dbPath)) return ;

        const data = JSON.parse(fs.readFileSync(this.dbPath,{encoding:'utf-8'}));

        this.historial = data.historial;

    }
}

module.exports = Busquedas;