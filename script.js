$(document).ready(function() {


	//html element variables
	var submitButton = $("#airport-form-submit");
	var airportInput = $("#airport-form-input");
	var airportCodeSpace = $("#airport-code-space");
	var airportCode;

	//focus on input initially


	//get airport code function

	function getAirportCode() {
		airportCode = document.getElementById("airport-form-input").value.toUpperCase();
		console.log(airportCode);
	}

	function displayAirportCode() {
		airportCodeSpace.text(airportCode);
	}



	function showTime(data) {
		var time = data["Time"];
		$(".time-row").text("Zulu Time: " + time);

	}

	function showAltimeter(data) {
		var altimeter = data["Altimeter"];
		var altimeterUnits = data["Units"]["Altimeter"];
		$(".altimeter-row").text("Altimeter: " + altimeter + " " +altimeterUnits);

	}

	function showCloudList(data) {
		var cloudList = data["Cloud-List"];
		cloudList.forEach(function(cloudInfo){
			console.log(cloudInfo);
			cloudInfo.forEach(function(cloudInfoNested){
				console.log(cloudInfoNested)
			})
			$(".cloud").append("<div class = 'row'>" + cloudInfo[0] + ": " + cloudInfo[1] + "</div>");


		})		
	}

	function showTemperature(data) {
		var temperature = data["Temperature"];
		var temperatureUnit = data["Units"]["Temperature"]
		$(".temperature-row").text("Temperature: " + temperature+ " " + temperatureUnit);

	}

	function showDewpoint(data) {
		var dewpoint = data["Dewpoint"];
		$(".dewpoint-row").text("Dewpoint: " + dewpoint);

	}

	function showVisibility(data) {
		var visibility = data["Visibility"];
		var visibilityUnit = data["Units"]["Visibility"]
		$(".temperature-row").text("Visibility: " + visibility+ " " + visibilityUnit);

	}
function showWindDirection(data) {
		var windDirection = data["Wind-Direction"];
		$(".wind-direction-row").text("Wind Direction: " + windDirection);
	}
	function showWindSpeed(data) {
		var windSpeed = data["Wind-Speed"];
		var windSpeedUnit = data["Units"]["Wind-Speed"];
		$(".wind-speed-row").text("Wind Speed: " + windSpeed +" " + windSpeedUnit);

	}
	function showWindGust(data) {
		var windGust = data["Wind-Gust"];
				var windSpeedUnit = data["Units"]["Wind-Speed"];

		$(".wind-gust-row").text("Wind Gust: " + windGust +" " + windSpeedUnit);

	}
	function showWindVariableDirection(data) {
		var windVariableDirection = data["Wind-Variable-Dir"];
		$(".wind-variable-direction-row").text("Wind Variable Direction: " + windVariableDirection);

	}
	//hitting enter on input field triggers submit button click
	document.getElementById('airport-form-input').onkeydown = function(e) {
		if (e.keyCode == 13) {
			submitButton.trigger("click");
		}
	};

	function successFunction(data) {
		console.log(data);
		showTime(data);
		showTemperature(data);
		showAltimeter(data);
		showCloudList(data);
		showDewpoint(data);
		showVisibility(data);
		showWindDirection(data);
		showWindSpeed(data);
		showWindGust(data);
		showWindVariableDirection(data);
	}

	function rejectFunction() {
		airportCodeSpace.text("Airport Code Not Recognized");
	}

	submitButton.on("click", function() {
		event.preventDefault()
		console.log("click!");
		getAirportCode();
		displayAirportCode();



		$.get("http://avwx.rest/api/metar/" + airportCode)
			.then(successFunction)


	})



});