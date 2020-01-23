///// Mapas base

var osm = L.tileLayer('https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
{attribution: 'Map Data &copy; OpenstreetMap contributors'}); 

var terrain = new L.StamenTileLayer("terrain");
var toner = new L.StamenTileLayer("toner");

var map = L.map('map',{
	center:[16.200, -100.000],
	timeDimensionControl: true,
	timeDimensionControlOptions: {
		position: 'bottomleft',
		autoPlay: false,
		timeSlider: true,
		loopButton: true,
		minSpeed: 0,
		speedStep: 10,
		maxSpeed: 100,
		timeSliderDragUpdate: true,
		playerOptions: {
			transitionTime: 100,
			loop: true,
		}
		
	},
	timeDimension: true,
	zoom:7,
    minZoom: 6.5,	
	layers:[terrain, toner]
});

var googleTerrain = L.tileLayer('https://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',{
    maxZoom: 20,
    subdomains:['mt0','mt1','mt2','mt3']
}).addTo (map);

var googleSat = L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
    maxZoom: 20,
    subdomains:['mt0','mt1','mt2','mt3']
}).addTo (map);

var googleStreets = L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',{
    maxZoom: 20,
    subdomains:['mt0','mt1','mt2','mt3']
}).addTo (map);

var googleHybrid = L.tileLayer('https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',{
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

L.control.layers(baseMaps).addTo(map);

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

function color_pct (ct) {
    return ct == "Muy alto"   ? '#08519c':
           ct == "Alto"  ? '#3182bd':
           ct == "Medio"   ? '#6baed6':
		   ct == "Bajo"  ? '#bdd7e7':
           ct == "Muy bajo"   ? '#eff3ff':
                            '#fdfcfd';
}

function style_pct (feature) {
    return {
        fillColor: color_pct(feature.properties.RCla_CicTr),
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
	style: style_pct,
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
		'<br><b>Grado de Vulnerabilidad:</b> ' + props.VUL_CC  
		: 'Pase el cursor sobre un municipio');
};

info.addTo(map);

/////Simbología de Mapa municipios

var troplegend = L.control({position: "topleft"});
	troplegend.onAdd = function (map) {
		var div = L.DomUtil.create('div', 'info legend');
		  div.innerHTML += "<b> Riesgo a ciclones tropicales </b></br>";
		  div.innerHTML += '<i style="background: #eff3ff"></i><span>Muy Bajo</span><br>';
		  div.innerHTML += '<i style="background: #bdd7e7"></i><span>Bajo</span><br>';
		  div.innerHTML += '<i style="background: #6baed6"></i><span>Medio</span><br>';
		  div.innerHTML += '<i style="background: #3182bd"></i><span>Alto</span><br>';
		  div.innerHTML += '<i style="background: #08519c"></i><span>Muy Alto</span><br>';
		return div;
};

troplegend.addTo(map);

/// Simbología CICLONES                                                
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

ciclonlegend.addTo(map);




///TimeDimension huracanes


L.TimeDimension.Layer.CDrift = L.TimeDimension.Layer.GeoJson.extend({

    // CDrift data has property time in seconds, not in millis.
    _getFeatureTimes: function(feature) {
        if (!feature.properties) {
            return [];
        }
        if (feature.properties.hasOwnProperty('coordTimes')) {
            return feature.properties.coordTimes;
        }
        if (feature.properties.hasOwnProperty('times')) {
            return feature.properties.times;
        }
        if (feature.properties.hasOwnProperty('linestringTimestamps')) {
            return feature.properties.linestringTimestamps;
        }
        if (feature.properties.hasOwnProperty('time')) {
            return [new Date(feature.properties.time).getTime()];
        }
		
        return [];
    },

    // Do not modify features. Just return the feature if it intersects
    // the time interval
    _getFeatureBetweenDates: function(feature, minTime, maxTime) {
        var featureStringTimes = this._getFeatureTimes(feature);
        if (featureStringTimes.length == 0) {
            return feature;
        }
        var featureTimes = [];
        for (var i = 0, l = featureStringTimes.length; i < l; i++) {
            var time = featureStringTimes[i]
            if (typeof time == 'string' || time instanceof String) {
                time = Date.parse(time.trim());
            }
            featureTimes.push(time);
        }

        if (featureTimes[0] > maxTime || featureTimes[l - 1] < minTime) {
            return null;
        }
        return feature;
    },

});

L.timeDimension.layer.cDrift = function(layer, options) {
    return new L.TimeDimension.Layer.CDrift(layer, options);
};

var startDate = new Date();
startDate.setUTCHours(0, 0, 0, 0);

var oReq = new XMLHttpRequest();
oReq.addEventListener("load", (function(xhr) {
    var response = xhr.currentTarget.response;
    var data = JSON.parse(response);
    var cdriftLayer = L.geoJson(data, {
        style: function(feature) {
            var color = "#FFF";
            if (feature.properties.tf == '0') {
                color = "#fa9dc2";
            } else if (feature.properties.tf == '1') {
                color = "#f768a1";
			} else if (feature.properties.tf == '2') {
                color = "#7a0177";
            } else if (feature.properties.tf == '3') {
                color = "#fcc5c0";
            } else if (feature.properties.tf == '4') {
                color = "#ae017e";
            } 
            return {
                "color": color,
                "weight": 2,
                "opacity": 0.9
            };
        }
    });

    var cdriftTimeLayer = L.timeDimension.layer.cDrift(cdriftLayer, {
        updateTimeDimension: true,
        updateTimeDimensionMode: 'replace',
        addlastPoint: false,
        duration: 'P7D',
    });
    cdriftTimeLayer.addTo(map);


    var cDriftLegend = L.control({
        position: 'bottomleft'
    });

    map.timeDimension.on('timeload', function(data) {
        var date = new Date(map.timeDimension.getCurrentTime());
        if (data.time == map.timeDimension.getCurrentTime()) {
            var totalTimes = map.timeDimension.getAvailableTimes().length;
            var position = map.timeDimension.getAvailableTimes().indexOf(data.time);
            }
    });
}));
oReq.open("GET", 'https://drive.google.com/file/d/1VEHygW5LHs-ijCVLIN0zK2Ol319yaUn2/view?usp=sharing'); //AQUÍ IRÍA LA URL DEL GEOJSON 
oReq.send();

/// respaldo ultimas dos lineas
/// oReq.open("GET", '/tomentas1.geojson');
///oReq.send();
