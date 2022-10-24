require('dotenv').config();
const { leerInput, inquirerMenu, pausa, listarLugares } = require("./helpers/inquirer");
const Busquedas = require("./models/busquedas");

const main = async()=> {
    const busquedas = new Busquedas();
    let opt;

    do {
        opt = await inquirerMenu();

        switch(opt){
            case 1:
                // mostrar mensaje
                const lugarBuscado = await leerInput('Ciudad: ');                

                // buscar los lugares
                const lugares = await busquedas.ciudad(lugarBuscado);                

                // seleccionar el lugar
                const idSeleccionado = await listarLugares(lugares);    
                
                if (idSeleccionado === '0') continue;
                
                const lugarSel = lugares.find(l=>l.id === idSeleccionado);

                // guardar búsqueda en historial
                busquedas.agregarHistorial(lugarSel.nombre);
                
                // datos de clima
                const clima = await busquedas.climaLugar(lugarSel.lat,lugarSel.lng)                

                //mostrar resultados
                console.clear();

                console.log('\nInformación de la ciudad\n'.green);
                console.log('Ciudad', lugarSel.nombre);
                console.log('Lat:', lugarSel.lat);
                console.log('Lng:', lugarSel.lng);
                console.log('Estado: ', clima.desc);
                console.log('Temperatura: ', clima.temperatura);
                console.log('Máxima: ',clima.max);
                console.log('Mínima: ',clima.min);

            break;

            case 2:
                // mostrar historial                                
                busquedas.historial.forEach((lugar, i) => {
                    const idx = `${i+1}`.green;
                    console.log(`${idx} ${lugar}`);
                })
            
            break;
        }
        // si la opción no es salir, esperamos
        if (opt !==0 )
            await pausa();
    }
    while (opt !== 0)
}
main();