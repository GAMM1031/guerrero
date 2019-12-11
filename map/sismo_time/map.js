///// Mapas base

var osm = L.tileLayer('http://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
{attribution: 'Map Data &copy; OpenstreetMap contributors'}); 

var terrain = new L.StamenTileLayer("terrain");
var toner = new L.StamenTileLayer("toner");

var map = L.map('map',{
	center:[16.200, -100.000],
	timeDimensionControl: true,
	timeDimensionControlOptions: {
		position: 'bottomright',
		autoPlay: false,
		timeSlider: true,
		loopButton: true,
		timeSliderDragUpdate: true,
		playerOptions: {
			transitionTime: 125,
			loop: true,
		}
		
	},
	timeDimension: true,
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

L.control.layers(baseMaps).addTo (map);

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
}).addTo(map);

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

///// Funciones para definir leyenda de los sismos

function Colorsismos(d) {
	return  d > 6.8  ? '#5c021d' :
		d > 6.2  ? '#b00909' :
		d > 5.6   ? '#c76708' :
		d > 5.0   ? '#e3c502' :
		d > 4.4   ? '#f5f578':
					'#f5f5c4';
}

function stylesismo(feature) {
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

///// Capa de sismos

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

sismolegend.addTo(map);



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
        style: stylesismo,
		pointToLayer: function (feature, latlng) {
		return L.circleMarker(latlng, {
			radius: calcRadius(feature.properties.mag)
			});
		}

    });

    var cdriftTimeLayer = L.timeDimension.layer.cDrift(cdriftLayer, {
        updateTimeDimension: true,
        updateTimeDimensionMode: 'replace',
        addlastPoint: false,
        duration: 'P10D'
		//period: "P5D"
    });
    cdriftTimeLayer.addTo(map);


    var cDriftLegend = L.control({
        position: 'bottomright'
    });

    map.timeDimension.on('timeload', function(data) {
        var date = new Date(map.timeDimension.getCurrentTime());
        if (data.time == map.timeDimension.getCurrentTime()) {
            var totalTimes = map.timeDimension.getAvailableTimes().length;
            var position = map.timeDimension.getAvailableTimes().indexOf(data.time);
            }
    });
}));
oReq.open("GET", '/sismos_usgs2.geojson');
oReq.send();