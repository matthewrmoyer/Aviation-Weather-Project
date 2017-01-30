$(document).ready(function() {


	//html element variables
	var submitButton = $("#airport-form-submit");
	var airportInput = $("#airport-form-input");
	var airportCodeSpace = $("#airport-code-space");
	var airportCode;



	//get airport code from user input function
	function getAirportCode() {
		airportCode = document.getElementById("airport-form-input").value.toUpperCase();
		console.log(airportCode);
	}


//if ajax request comes with a station lookup error
		function checkError(data){
		var errorHeading = document.getElementById("error-heading");
		$("#error-heading").empty();
			if(data["Error"]){
				console.log("NOT AN AIRPORT");
				errorHeading.innerHTML = "Airport Not Found";
				//hide of the stuff in weather info article
				//won't show previous airport search info  if there is an error on the current search
				$(".weather-info").addClass("display-none");
			}

			else{
				//if there isnt an error get rid of the display none class if it was previously added
				$(".weather-info").removeClass("display-none");
			}

		}

	function displayAirportCode() {
		airportCodeSpace.text(airportCode);
	}



	function showTime(data) {
		//set time = data's time's value 
		var time = data["Time"];
		//write the time to the page
		$(".time-row").text("Zulu Time: " + time);

	}


	function showStation(data) {
		var station = data["Station"];
		$(".station-row").text("Station: " + station);

	}

	//show vfr / ifr etc
	function showFlightRules(data) {
		var flightRules = data["Flight-Rules"];
		$(".flight-rules-row").text("Flight Rules: " + flightRules);

	}


	function showAltimeter(data) {
		var altimeter = data["Altimeter"];
		var altimeterUnits = data["Units"]["Altimeter"];
		$(".altimeter-row").text("Altimeter: " + altimeter + " " + altimeterUnits);

	}


	function showCloudList(data) {
		//clear cloud list from last entry
		$(".cloud-list-row").empty();
		//cloudList is an array of cloud arrays
		var cloudList = data["Cloud-List"];
		cloudList.forEach(function(cloudInfo) {
			//log each array separately 
			//cloudInfo is an array with a key value pairs setup
			//i.e.: ["FEW", "100"]
			console.log(cloudInfo);
			//log each nested array's elements
			cloudInfo.forEach(function(cloudInfoNested) {
				console.log(cloudInfoNested)
			})
			$(".cloud-list-row").append("<div class = 'col-3 cloud-item'>" + cloudInfo[0] + ": " + cloudInfo[1] + "</div>");


		})
	}

	function showTemperature(data) {
		var temperature = data["Temperature"];
		var temperatureUnit = data["Units"]["Temperature"];
		$(".temperature-row").text("Temperature: " + temperature + " " + temperatureUnit);

	}

	function showDewpoint(data) {
		var dewpoint = data["Dewpoint"];
		var temperatureUnit = data["Units"]["Temperature"];

		var dewpoint = dewpoint.toString().split("");
		//minus 10 degrees comes back as M10
		//this is changing M10 to -10
		if(dewpoint[0]=="M"){
			dewpoint[0]="-"
		}
		dewpoint = dewpoint.join("");
		$(".dewpoint-row").text("Dewpoint: " + dewpoint + " " + temperatureUnit);

	}

	function showVisibility(data) {
		var visibility = data["Visibility"];
		var visibilityUnit = data["Units"]["Visibility"];
		$(".visibility-row").text("Visibility: " + visibility + " " + visibilityUnit);

	}

	function showWindDirection(data) {
		var windDirection = data["Wind-Direction"];
		$(".wind-row").append("<div class = 'col-2 wind-item'>" + "Direction: " + windDirection + "</div>");
	}

	function showWindSpeed(data) {
		var windSpeed = data["Wind-Speed"];
		var windSpeedUnit = data["Units"]["Wind-Speed"];
		$(".wind-row").append("<div class = 'col-2 wind-item'>" + "Speed: " + windSpeed + "" + windSpeedUnit + "</div>");

	}

	function showWindGust(data) {
		var windGust = data["Wind-Gust"];
		var windSpeedUnit = data["Units"]["Wind-Speed"];

		if (windGust) {
			$(".wind-row").append("<div class = 'col-2 wind-item'>" + "Gust: " + windGust + " " + windSpeedUnit + "</div>");
		}
	}

	function showWindVariableDirection(data) {
		var windVariableDirection = data["Wind-Variable-Dir"];


		if (windVariableDirection.length > 0) {
			$(".wind-row").append("<div class = 'col-2 wind-item'>" + "Variable: " + windVariableDirection + "</div>");
		}

	}
	//hitting enter on input field triggers submit button click
	document.getElementById('airport-form-input').onkeydown = function(e) {
		if (e.keyCode == 13) {
			submitButton.trigger("click");
		}
	};

	//do if ajax request is successful
	function successFunction(data) {
		console.log(data);
		checkError(data);
		$(".wind-row").empty();
		showTime(data);
		showStation(data);
		showFlightRules(data);
		showTemperature(data);
		showAltimeter(data);
		showCloudList(data);
		showDewpoint(data);
		showVisibility(data);
		showWindDirection(data);
		showWindSpeed(data);
		showWindGust(data);
		showWindVariableDirection(data);
		$("section").css("visibility", "visible");
		$(".airport-heading-row").css("visibility", "visible");

	}

	//do if ajax request fails
	function rejectFunction() {
		
	}

	submitButton.on("click", function() {
		event.preventDefault()
		getAirportCode();
		displayAirportCode();



		$.get("https://avwx.rest/api/metar/" + airportCode)
			.then(successFunction)

	})



});