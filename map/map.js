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
	"<b>Mapa de calles</b>": googleStreets,
	"<b>Imagen de satélite</b>": googleSat,
	"<b>Mapa Híbrido</b>": googleHybrid,
	"<b>Mapa de relieve</b>": googleTerrain,
	"<b>Mapa de terreno</b>": terrain, 
	"<b>Mapa en tonos claros</b>": carto,
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

function color_adap (ca) {
    return ca == "Alta"   ? '#4a1486':
           ca == "Media"  ? '#6a51a3':
           ca == "Baja"   ? '#9e9ac8':
                            '#f5f5f5';
}

function style_adap (feature) {
    return {
        fillColor: color_adap(feature.properties.VUL_CC),
        weight: 0.3,
        opacity: 1,
        color: 'black',
        dashArray: '0',
        fillOpacity: 0.7
    };
}

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

function resetHighlight(e) {
    municipios.resetStyle(e.target);
	info.update();
}

function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}

municipios = L.geoJson(municipios_gro, {
	style: style_adap,
	onEachFeature: onEachFeature
}).addTo(map);

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
		'<br><b>Capacidad de Adaptación:</b> ' + props.CAP_ADAP  +
		'<br><b>Riesgo a Ciclones Tropicales:</b> ' + props.RCla_CicTr  
		: 'Pase el cursor sobre un municipio');
};

info.addTo(map);

/////Simbología de Mapa municipios

var munlegend = L.control({position: "topleft"});
	munlegend.onAdd = function (map) {
		var div = L.DomUtil.create('div', 'info legend');
		  div.innerHTML += "<b> Grado de vulnerabilidad </b></br>";
		  div.innerHTML += '<i style="background: #9e9ac8"></i><span>Baja</span><br>';
		  div.innerHTML += '<i style="background: #6a51a3"></i><span>Media</span><br>';
		  div.innerHTML += '<i style="background: #4a1486"></i><span>Alta</span><br>';
		return div;
};

munlegend.addTo(map);

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
		return  h == "DB"  ? '#fa9dc2':
				h == "TD"  ? '#f768a1':
				h == "TS"  ? '#ae017e':
				h == "HU"  ? '#7a0177': 
				h == "Low" ? '#fcc5c0':
				'#fcc5c0';
}

function Anchohuracan(h) {
		return  h == "Low" ? 2.5:
				h == "DB"  ? 2.5:
				h == "TD"  ? 2.5:
				h == "TS"  ? 2.5:
				h == "HU"  ? 2.5: 
				2.5;
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
	}
}).addTo(huracanes);

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
		  div.innerHTML += '<di style="background: #fa9dc2"></di><span>Perturbación tropical</span><br>';
		  div.innerHTML += '<de style="background: #f768a1"></de><span>Depresión tropical</span><br>';
		  div.innerHTML += '<to style="background: #ae017e"></to><span>Tormenta tropical</span><br>';
		  div.innerHTML += '<hu style="background: #7a0177"></hu><span>Huracán</span><br>';
		  div.innerHTML += '<dis style="background: #fcc5c0"></dis><span>Evento disipado</span><br>';
		return div;
};

///TimeDimension sismos

/*var timesismos = new L.TimeDimension({
	timeInterval: "2000-01-01/2018-12-31",
    period: "PT24H",
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
	
///var timeSeriesLayer = L.geoJSON(sismos_usgs2);

///TimeDimension huracanes

var timeciclon = new L.TimeDimension({
		timeInterval: "2000-01-01/2018-12-31",
        period: "PT24H",
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
	
//var timeSeriesLayer = L.geoJSON(tormentas1);*/

///// Aparecer y desaparecer simbologías y barras de tiempo

/*map.on('overlayadd', function (eventLayer) {
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
});*/

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
