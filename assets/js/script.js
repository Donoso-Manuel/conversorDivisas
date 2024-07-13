let tipoConexion = document.querySelector('.tipoConexion');
let graficoActual;

async function obtenerMoneda(){   
try{
    const monedas = await fetch("https://mindicador.cl/api");
    const monedaJson = await monedas.json();
    tipoConexion.innerHTML = 'Online'
    return monedaJson;
    
}catch{
    alert("Error de conexion, se encuentra en modo Offline")
    try{
        const monedas = await fetch("./assets/json/mindicador.json");
        const monedaJson =  await monedas.json()
        tipoConexion.innerHTML = 'Offline'
        return monedaJson;
    }catch{
        alert("Error critico en la conexion. Contactar al administrador")
    }
}
}

async function cargadosDatosGrafico(divisa){
    try{
    const ult30Dias = await fetch(`https://mindicador.cl/api/${divisa}`);
    const formatDivisas = await ult30Dias.json();

    const ultimos10Dias = formatDivisas.serie.slice(0, 10).reverse();

    const labels =  ultimos10Dias.map((dia)=> {
        return dia.fecha.split('T')[0];
    })
    const datos = ultimos10Dias.map((dia)=>{
        return dia.valor;
    })

    const cargaDatos = [
        {
        label: `Cambios del ${divisa} en los ultimos 10 días`,
        borderColor: "blue",
        data: datos
        }
    ];
    return {labels, datasets: cargaDatos};
}catch{
    alert('No se pudo obtener Historial de divisas')
}
}

async function convertirMoneda(){
    let monedaSeleccionada = document.querySelector('.divisaConversion').value;
    let montoCLP = Number(document.querySelector('.monto').value);
    let divisaConvertida = document.querySelector('.resultado');

    let monedas = await obtenerMoneda();
    let monedasArray = Object.values(monedas);
    let index = monedasArray.findIndex(moneda=> moneda['codigo']==monedaSeleccionada)

    let valorSeleccion = monedasArray[index].valor;
    
    let nuevoValor = montoCLP / valorSeleccion;

    divisaConvertida.innerHTML =`El Resultado es: ${nuevoValor}`;
    mostrarGrafico(monedaSeleccionada);
}

async function mostrarGrafico(divisa){
    const datos = await cargadosDatosGrafico(divisa);
    const configuracion =  { type: "line", data: datos };
    const grafico = document.querySelector('.graficoDivisa');
    grafico.style.backgroundColor = "white";

    if(graficoActual){
        graficoActual.destroy();
    }

    graficoActual = new Chart(grafico, configuracion);
}