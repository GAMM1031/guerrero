///// Mapas base

var osm = L.tileLayer('http://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
{attribution: 'Map Data &copy; OpenstreetMap contributors'}); 

var terrain = new L.StamenTileLayer("terrain");
var toner = new L.StamenTileLayer("toner");

var map = L.map('map',{
	center:[16.200, -100.000],
	zoom:7,
    minZoom: 6.5,	
	layers:[terrain, toner]
});

var googleTerrain = L.tileLayer('http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',{
    maxZoom: 20,
    subdomains:['mt0','mt1','mt2','mt3']
}).addTo (map);

var googleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
    maxZoom: 20,
    subdomains:['mt0','mt1','mt2','mt3']
}).addTo (map);

var googleStreets = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',{
    maxZoom: 20,
    subdomains:['mt0','mt1','mt2','mt3']
}).addTo (map);

var googleHybrid = L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',{
    maxZoom: 20,
    subdomains:['mt0','mt1','mt2','mt3']
}).addTo (map);

var carto = L.tileLayer("https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png",{
		"attribution": "\u0026copy; \u003ca href=\"http://www.openstreetmap.org/copyright\"\u003eOpenStreetMap\u003c/a\u003e contributors \u0026copy; \u003ca href=\"http://cartodb.com/attributions\"\u003eCartoDB\u003c/a\u003e, CartoDB \u003ca href =\"http://cartodb.com/attributions\"\u003eattributions\u003c/a\u003e", "detectRetina": false, "maxNativeZoom": 18, "maxZoom": 18, "minZoom": 0, "noWrap": false, "opacity": 1, "subdomains": "abc", "tms": false}
).addTo (map);

var baseMaps = {
	"<b>Mapa en blanco y negro</b>": toner,
	"<b>Mapa en tonos claros</b>": carto,
	"<b>Mapa de calles</b>": googleStreets,
	"<b>Imagen de satélite</b>": googleSat,
	"<b>Mapa Híbrido</b>": googleHybrid,
	"<b>Mapa de relieve</b>": googleTerrain,
	"<b>Mapa de terreno</b>": terrain
};

///// Capas de fenómenos geológicos e hidrometeorológicos

var sismos = L.layerGroup([]);

var huracanes = L.layerGroup([]);

var overlayMaps = {
    "<b>Fenómenos Geológicos</b>": sismos,
	"<b>Fenómenos Hidrometeorológicos</b>": huracanes
};

L.control.layers(baseMaps, overlayMaps).addTo (map);

//// Mapa de placas tectónicas

function placas_style(feature) {
    return {
        fillColor: 'white',
        weight: 2,
        opacity: 1,
        color: '#d95a0b',
        dashArray: '5',
        fillOpacity: 0
    };
}

L.geoJson(placas, {
	style: placas_style
}).addTo(sismos);

//// Mapa de estados

function edo_style(feature) {
    return {
        fillColor: 'white',
        weight: 1.5,
        opacity: 1,
        color: 'black',
        dashArray: '1',
        fillOpacity: 0.35
    };
}

L.geoJson(estados, {
	style: edo_style
}).addTo(map);

//// Mapa del estado de Guerrero

function gro_style(feature) {
    return {
        fillColor: 'white',
        weight: 5,
        opacity: 1,
        color: '#ad0707',
        dashArray: '1',
        fillOpacity: 0.1
    };
}

L.geoJson(guerrero, {
	style: gro_style
}).addTo(map);

//// Mapa de municipios de Guerrero

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}

function mun_style(feature) {
    return {
        fillColor: 'white',
        weight: 0.3,
        opacity: 1,
        color: 'black',
        dashArray: '0',
        fillOpacity: 0
    };
}

geojson = L.geoJson(municipios_gro, {
	onEachFeature: onEachFeature,
	style: mun_style
}).addTo(map);

//// Funciones de información por municipio

function highlightFeature(e) {
    var layer = e.target;
    layer.setStyle({
        weight: 3,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.5
    });
	info.update(layer.feature.properties);
}

function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

function resetHighlight(e) {
    geojson.resetStyle(e.target);
	info.update();
}

////// Control de información de municipios

var info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
};

info.update = function (props) {
    this._div.innerHTML = '<h4>Información por municipio</h4>' +  (props ?
        '<b>' + props.NOMGEO + '</b><br />' + 
		'<br><b>Riesgo a Ciclones Tropicales:</b> ' + props.RCla_CicTr + 
		'<br><b>Grado de Vulnerabilidad:</b> ' + props.VUL_CC +
		'<br><b>Capacidad de Adaptación:</b> ' + props.CAP_ADAP
        : 'Pase el cursor sobre un municipio');
};

info.addTo(map);

///// Información popUp de Sismos

function popUpInfo (feature, layer) {
	if (feature.properties && feature.properties.mag){
		layer.bindPopup("<b>Magnitud (Richter):</b>  "+ 
		feature.properties.mag+"<br><b>Fecha:</b> "+
		feature.properties.time+"<br><b>Profundidad (Km):</b>  "+
		feature.properties.depth+"<br><b>Lugar:</b> "+
		feature.properties.place);
	}
}

///// Información popUp de Huracanes

function popUpHur (feature, layer) {
	if (feature.properties){
		layer.bindPopup("<b>Año:</b> "+
		feature.properties.SEASON +"<br><b> Velocidad del viento (Km/h):</b> "+
		feature.properties.USA_WIND +"<br><b> Presión atmosférica (mbar):</b> "+
		feature.properties.USA_PRES +"<br><b> Tipo de evento:</b> "+
		feature.properties.estado+"<br><b> Nombre del evento:</b> "+
		feature.properties.NAME);
	}
}

///// Funciones para definir leyenda de los sismos

function Colorsismos(d) {
	return  d > 6.8  ? '#5c021d' :
		d > 6.2  ? '#b00909' :
		d > 5.6   ? '#c76708' :
		d > 5.0   ? '#e3c502' :
		d > 4.4   ? '#f5f578':
					'#f5f5c4';
}

function style(feature) {
	return {
		weight: 1,
		opacity: 0.2,
		color: 'black',
		dashArray: '2.5',
		fillOpacity: 0.45,
		fillColor: Colorsismos(feature.properties.mag)
	};
}

var minValue = 4.5;
var minRadius = 3;

function calcRadius(val) {
    return 1.25 * Math.pow(val/minValue, 6.5) * minRadius;  
}

///// Funciones para definir leyenda de huracanes

function Colorhuracan(h) {
		return  h == "DB"  ? '#1e9ce6':
				h == "TD"  ? '#1239c7':
				h == "TS"  ? '#6729b3':
				h == "HU"  ? '#260775': 
				h == "Low" ? '#000000 ':
				'#000000 ';
}

function Anchohuracan(h) {
		return  h == "Low" ? 2:
				h == "DB"  ? 2.5:
				h == "TD"  ? 3:
				h == "TS"  ? 3.5:
				h == "HU"  ? 4: 
				1.5;
}

function styleh(feature) {
		return {
			color: Colorhuracan(feature.properties.USA_STATUS),
			weight: Anchohuracan(feature.properties.USA_STATUS),
			opacity: 0.7,		
			};
}

///// Capa de sismos

L.geoJson(sismos_usgs2, {
	onEachFeature: popUpInfo,
	style: style,
	pointToLayer: function (feature, latlng) {
	return L.circleMarker(latlng, {
		radius: calcRadius(feature.properties.mag)
    });
	}
}).addTo(sismos);

///// Capa de Huracanes

L.geoJson(tormentas1, {
	onEachFeature: popUpHur,
	style: styleh,
	pointToLayer: function (feature, latlng) {
	return L.river(latlng, {
		minWidth: 1,
		maxWidth: 10
    });
	}
}).addTo(huracanes);

/*L.geoJson(ciclones_point, {
	onEachFeature: popUpHur,
	style: styleh,
	pointToLayer: function (feature, latlng) {
	}
}).addTo(huracanes);*/

///// Simbologías
///SISMOS
var sismolegend = L.control({position: "bottomleft"});
	sismolegend.onAdd = function (map) {
		var div = L.DomUtil.create('div', 'info legend'),
			grades = [4.4, 5.0, 5.6, 6.2, 6.8],
			labels = ["<b> Magnitud de los sismos en escala de Richter</b>"],
			from, to;
		for (var i = 0; i < grades.length; i++) {
			from = grades[i];
			to = grades[i + 0.6];
			labels.push(
				'<i style="background:' + Colorsismos(from + 0.6) + ' "></i> ' + 
				from + (to ? +  to: ' - ') + (to ? +  to: from + 0.5));
		}
		div.innerHTML = labels.join('<br>');
		return div;
}; 

///CICLONES                                                
var ciclonlegend = L.control({position: "bottomright"});
	ciclonlegend.onAdd = function (map) {
		var div = L.DomUtil.create('div', 'info legend');
		  div.innerHTML += "<b> Clasificacion de ciclones tropicales</b></br>";
		  div.innerHTML += '<di style="background: #1e9ce6"></di><span>Disturbio tropical</span><br>';
		  div.innerHTML += '<de style="background: #1239c7"></de><span>Depresión tropical</span><br>';
		  div.innerHTML += '<to style="background: #6729b3"></to><span>Tormenta tropical</span><br>';
		  div.innerHTML += '<hu style="background: #260775"></hu><span>Huracán</span><br>';
		  div.innerHTML += '<dis style="background: #000000"></dis><span>Evento disipado</span><br>';
		return div;
};

///TimeDimension sismos

/*var timesismos = L.timeDimension(sismos_usgs2,
	duration= null,
	addlastPoint= false,
	waitForReady= false,
	updateTimeDimension= false,
	updateTimeDimensionMode= '2000-01-01/2019-10-31');
	
var timecontrolsismos = L.control.timeDimension(
	timeDimension = timesismos,
	styleNS = "leaflet-control-timecontrol",
	position = 'bottomleft',
	tittle = "Time Control",
	backwardButton = true,
	forwardButton = true,
	playButton = true,
	playReverseButton = false,
	loopButton = false,
	displayDate = true,
	timeSlider = true,
	timeSliderDragUpdate = false,
	limitSliders = false,
	limitMinimumRange = 10,
	speedSliders = true,
	minSpeed = 0.1,
	maxSpeed = 10,
	speedStep = 0.1,
	timeStep = 1,
	autoPlay = false,
	player = playersismos);

var playersismos = L.TimeDimension.Player(
	transitionTime = 1000,
	loop = true,
	startOver = false,
timesismos);*/

var timesismos = new L.TimeDimension({
	timeInterval: "2000-01-01/2018-12-31",
    period: "P7D",
    });
map.timesismos = timesismos; 

var player = new L.TimeDimension.Player({
    transitionTime: 100, 
    loop: false,
    startOver:true
}, timesismos);

var timesismosControlOptions = {
    player:        player,
    timeDimension: timesismos,
    position:      'bottomleft',
    autoPlay:      true,
    minSpeed:      0,
    speedStep:     10,
    maxSpeed:      100,
    timeSliderDragUpdate: true
};

var timesismosControl = new L.Control.TimeDimension(timesismosControlOptions);
	
	
var timeSeriesLayer = L.geoJSON(sismos_usgs2);

///TimeDimension huracanes

var timeciclon = new L.TimeDimension({
		timeInterval: "2000-01-01/2018-12-31",
        period: "P30D",
    });
map.timeciclon = timeciclon; 

var player = new L.TimeDimension.Player({
    transitionTime: 100, 
    loop: false,
    startOver:true
}, timeciclon);

var timeciclonControlOptions = {
    player:        player,
    timeDimension: timeciclon,
    position:      'bottomright',
    autoPlay:      true,
    minSpeed:      0,
    speedStep:     10,
    maxSpeed:      100,
    timeSliderDragUpdate: true
};

var timeciclonControl = new L.Control.TimeDimension(timeciclonControlOptions);
	
	
var timeSeriesLayer = L.geoJSON(tormentas1);

///// Aparecer y desaparecer simbologías y barras de tiempo

map.on('overlayadd', function (eventLayer) {
	if (eventLayer.name == '<b>Fenómenos Geológicos</b>') {
		timesismosControl.addTo(map);
    } else if (eventLayer.name == '<b>Fenómenos Hidrometeorológicos</b>') { 
		timeciclonControl.addTo(map);
	}
});

map.on('overlayremove', function (eventLayer) {
	if (eventLayer.name =='<b>Fenómenos Geológicos</b>') {
        timesismosControl.remove(map);
    } else if (eventLayer.name == '<b>Fenómenos Hidrometeorológicos</b>') { 
        timeciclonControl.remove(map);
	}	
});

map.on('overlayadd', function (eventLayer) {
	if (eventLayer.name == '<b>Fenómenos Geológicos</b>') {
		sismolegend.addTo(map);
    } else if (eventLayer.name == '<b>Fenómenos Hidrometeorológicos</b>') { 
		ciclonlegend.addTo(map);
	}
});

map.on('overlayremove', function (eventLayer) {
	if (eventLayer.name =='<b>Fenómenos Geológicos</b>') {
        sismolegend.remove(map);
    } else if (eventLayer.name == '<b>Fenómenos Hidrometeorológicos</b>') { 
        ciclonlegend.remove(map);
	}	
});

/// Track huracanes

/*var icon = L.icon({
    iconUrl: 'img/ciclon.svg',
    iconSize: [20, 20],
    iconAnchor: [10, 20]
});

var customLayer = L.geoJson(null, {
    pointToLayer: function (feature, latLng) {
        if (feature.properties.hasOwnProperty('last')) {
            return new L.Marker(latLng, {
                icon: icon
            });
        }
        return L.circleMarker(latLng);
    }
});

var gpxLayer = omnivore.gpx('data/running_mallorca.gpx', null, customLayer).on('ready', function() {
    map.fitBounds(gpxLayer.getBounds(), {
        paddingBottomRight: [40, 40]
    });
});

var gpxTimeLayer = L.timeDimension.layer.geoJson(gpxLayer, {
    updateTimeDimension: true,
    addlastPoint: true,
    waitForReady: true
});

var kmlLayer = omnivore.kml('data/easy_currents_track.kml');
var kmlTimeLayer = L.timeDimension.layer.geoJson(kmlLayer, {
    updateTimeDimension: true,
    addlastPoint: true,
    waitForReady: true
});


var overlayMaps = {
    "GPX Layer": gpxTimeLayer,
    "KML Layer": kmlTimeLayer
};
var baseLayers = getCommonBaseLayers(map); // see baselayers.js
L.control.layers(baseLayers, overlayMaps).addTo(map);
gpxTimeLayer.addTo(map);*/


/// GRAFICA

window.onload = function () {

var chart = new CanvasJS.Chart("chartContainer", {
	exportEnabled: true,
	animationEnabled: true,
	title:{
		text: "Sismos y Ciclones por año"
	},
	subtitles: [{
		text: " "
	}], 
	axisX: {
		title: "Años"
	},
	axisY: {
		title: "Número de Sismos",
		titleFontColor: "#4F81BC",
		lineColor: "#4F81BC",
		labelFontColor: "#4F81BC",
		tickColor: "#4F81BC"
	},
	axisY2: {
		title: "Número de Ciclones",
		titleFontColor: "#C0504E",
		lineColor: "#C0504E",
		labelFontColor: "#C0504E",
		tickColor: "#C0504E"
	},
	toolTip: {
		shared: true
	},
	legend: {
		cursor: "pointer",
		itemclick: toggleDataSeries
	},
	data: [{
		type: "column",
		name: "Sismos",
		showInLegend: true,      
		yValueFormatString: "#,##0.# eventos",
		dataPoints: [
			{ y: 6, label: "2000" },
			{ y: 9, label: "2001" },
			{ y: 29, label: "2002" },
			{ y: 5, label: "2003" },
			{ y: 8, label: "2004" },
			{ y: 9, label: "2005" },
			{ y: 8, label: "2006" },
			{ y: 24, label: "2007" },
			{ y: 11, label: "2008" },
			{ y: 10, label: "2009" },
			{ y: 6, label: "2010" },
			{ y: 8, label: "2011" },
			{ y: 18, label: "2012" },
			{ y: 20, label: "2013" },
			{ y: 24, label: "2014" },
			{ y:10, label: "2015" },
			{ y: 13, label: "2016" },
			{ y:17, label: "2017" },
			{ y: 11, label: "2018" }
		]
	},
	{
		type: "column",
		name: "Ciclones",
		axisYType: "secondary",
		showInLegend: true,
		yValueFormatString: "#,##0.# eventos",
		dataPoints: [
		{ y: 91, label: "2000" },
		{ y: 100, label: "2001" },
		{ y: 44, label: "2002" },
		{ y: 94, label: "2003" },
		{ y: 14, label: "2004" },
		{ y: 56, label: "2005" },
		{ y: 114, label: "2006" },
		{ y: 65, label: "2007" },
		{ y: 63, label: "2008" },
		{ y: 68, label: "2009" },
		{ y: 106, label: "2010" },
		{ y: 103, label: "2011" },
		{ y: 26, label: "2012" },
		{ y: 94, label: "2013" },
		{ y: 143, label: "2014" },
		{ y:111, label: "2015" },
		{ y: 31, label: "2016" },
		{ y:84, label: "2017" },
		{ y: 110, label: "2018" }
		]
	}]
});
chart.render();

function toggleDataSeries(e) {
	if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
		e.dataSeries.visible = false;
	} else {
		e.dataSeries.visible = true;
	}
	e.chart.render();
}

}