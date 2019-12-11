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
		titleFontColor: "#C0504E",
		lineColor: "#C0504E",
		labelFontColor: "#C0504E",
		tickColor: "#C0504E"
	},
	axisY2: {
		title: "Número de Ciclones",
		titleFontColor: "#4F81BC",
		lineColor: "#4F81BC",
		labelFontColor: "#4F81BC",
		tickColor: "#4F81BC"
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
