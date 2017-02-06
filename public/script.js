$(document).ready(function() {



	//global variables
	var $submitButton = $("#airport-form-submit");
	var $airportInput = $("#airport-form-input");
	var $airportCodeSpace = $("#airport-code-space");
	var $airportFormInput = $("#airport-form-input");
	var $errorHeading = $("#error-heading");
	var airportCode;
	var airportIATA;


	//set airport code variable to user input 
	function getAirportCode() {
		airportCode = $airportFormInput.val().toUpperCase();
	}

	function getAirportIATA() {
		airportIATA = $airportFormInput.val().toUpperCase()
		airportIATA = airportIATA.slice(1, airportIATA.length);
	}



	//if ajax request comes with a station lookup error, this function will run
	function checkError(data) {
		//empty the error heading so that it doesnt stack text if user enters mulitple incorrect airport codes
		$errorHeading.empty();
		if (data["Error"]) {
			console.log("NOT AN AIRPORT");
			$errorHeading.text("Airport Not Found");
			//won't show previous airport search info  if there is an error on the current search
			$(".weather-info").addClass("display-none");
		} else {
			//if there isnt an error get rid of the display none class if it was previously added
			$(".weather-info").removeClass("display-none");
		}
	}

	function displayAirportCode() {
		$airportCodeSpace.text(airportCode);
	}

	function showAirportLocation(data) {
		var city = data["city"];
		var state = data["state"];
		$(".city-and-state").text(city + ", " + state);
	}

	function showTime(data) {
		var time = data["Time"];
		$(".time-row").text("Zulu Date and Time: " + time);
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
		//if the altimeter unit is "inHg", then there needs to be a decimal place after 2 digits
		//if the alitmeter unit is not "inHg", it does not need a decimal 
		if (altimeterUnits == "inHg") {
			//change to string and split it into an array with nothing in between each element
			altimeter = altimeter.toString().split("");
			//inject a "." at index 2 and delete 0 elements
			altimeter.splice(2, 0, ".");
			//join the array back together
			altimeter = altimeter.join("");
		}
		//get altimeter units from the units object inside of data
		$(".altimeter-row").text("Altimeter: " + altimeter + " " + altimeterUnits);
	}

	function showCloudList(data) {
		//clear cloud list from last entry
		$(".cloud-list-row").empty();
		//cloudList is an array of cloud arrays
		var cloudList = data["Cloud-List"];
		cloudList.forEach(function(cloudInfo) {
			//cloudInfo is an array with a key value pairs setup
			//i.e.: ["FEW", "100"]	

			switch (cloudInfo[0]) {
				case "FEW":
					cloudInfo[0] = "Few";
					break;

				case "SCT":
					cloudInfo[0] = "Scattered";
					break;

				case "BKN":
					cloudInfo[0] = "Broken";
					break;

				case "CB":
					cloudInfo[0] = "Cumulonimbus";
					break;

				case "CLR":
					cloudInfo[0] = "Clear below 12,000 AGL";
					break;

				case "OVC":
					cloudInfo[0] = "Overcast";
					break;

				case "SKC":
					cloudInfo[0] = "Sky Clear";
					break;

				case "TCU":
					cloudInfo[0] = "Towering Cumulus";
					break;

				default:
					cloudInfo[0] = cloudInfo[0];
			}
			var firstCloudAltitudeCharacter = cloudInfo[1].charAt(0);
			var secondCloudAltitudeCharacter = cloudInfo[1].charAt(1);
			if (firstCloudAltitudeCharacter == "0") {
				cloudInfo[1] = cloudInfo[1].substring(1, cloudInfo[1].length)
					//if first character is 0, check if second character is 0
					//if yes, then get rid of it using substring
					//stays at posiition 1 because got rid of og position one in above if statement?
				if (secondCloudAltitudeCharacter == "0") {
					cloudInfo[1] = cloudInfo[1].substring(1, cloudInfo[1].length)
				}
			}


			$(".cloud-list-row").append("<div class = 'col-3 cloud-item'>" + cloudInfo[0] + ": " + cloudInfo[1] + "00 ft" + "</div>");
		})
	}


	//ceiling is the first layer of clouds that are broken or overcast
	//the codes for these are BKN and OVC respectively 
	//Step 1: Get cloud list from data
	//Step 2: Iterate over cloudlist to find first "BKN" or "OVC"
	//Step 3: Get rid of first character in the ceiling alititude if it is a 0 (then do the same for second character)
	//Step 3: Set cloudLayer to the BKN/OVC and the ceilingAltitude to the next element
	//Step 4: Write the variables to the ceiling-row

	//return the ceiling
	function createCeiling(data) {
		var cloudList = data["Cloud-List"];
		for (i = 0; i < cloudList.length; i++) {
			var cloudLayer = cloudList[i][0];
			var ceilingAltitude = cloudList[i][1];
			console.log(cloudList[i]);
			if (cloudLayer == "BKN" || cloudLayer == "OVC") {
				//set variable to first character of ceiling alititude
				var firstCeilingAltitudeCharacter = ceilingAltitude.charAt(0);
				var secondCeilingAltitudeCharacter = ceilingAltitude.charAt(1);
				//check if the first character is equal to 0
				//if yes, then get rid of it using substring 
				if (firstCeilingAltitudeCharacter == "0") {
					ceilingAltitude = ceilingAltitude.substring(1, ceilingAltitude.length)
						//if first character is 0, check if second character is 0
						//if yes, then get rid of it using substring
						//stays at posiition 1 because got rid of og position one in above if statement?
					if (secondCeilingAltitudeCharacter == "0") {
						ceilingAltitude = ceilingAltitude.substring(1, ceilingAltitude.length)
					}
				}
				//set ceiling
				var ceiling = cloudLayer + " " + ceilingAltitude;
				return ceiling;
			}
		}
	}

	//add ceiling to page
	function showCeiling(data) {
		var ceiling = createCeiling(data);
		if (ceiling) {
			$(".ceiling-row").text("Ceiling: " + ceiling + "00" + " ft");
		} else {
			$(".ceiling-row").text("No Reported Ceiling");
		}
	}

	function showTemperature(data) {
		var temperature = data["Temperature"];
		temperature = temperature.toString().split("");
		//handle negative temperatures
		//minus 10 degrees comes back as M10
		//this is changing M10 to -10
		if (temperature[0] == "M") {
			temperature[0] = "-"
			if (temperature[1] == "0") {
				temperature[1] = [""];
			}
		}
		if (temperature[0] == "0") {
			temperature[0] = [""];
		}
		temperature = temperature.join("");
		var temperatureUnit = data["Units"]["Temperature"];
		$(".temperature-row").text("Temperature: " + temperature + " " + temperatureUnit);
	}

	function showDewpoint(data) {
		var dewpoint = data["Dewpoint"];
		var temperatureUnit = data["Units"]["Temperature"];
		var dewpoint = dewpoint.toString().split("");
		//handle negative dewpoints
		//minus 10 degrees comes back as M10
		//this is changing M10 to -10
		if (dewpoint[0] == "M") {
			dewpoint[0] = "-"
			console.log("dew[1]: " + dewpoint[1]);
			if (dewpoint[1] == "0") {
				dewpoint[1] = [""];
			}
		}
		if (dewpoint[0] == "0") {
			dewpoint[0] = [""];
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
		$(".wind-row").append("<div class = 'col-2 wind-item'>" + "Direction: " + windDirection + "&deg" + "</div>");
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

	function showAirportName(data) {
		var airportName = data["name"];
		$(".airport-name").text(airportName);
	}


	//hitting enter on input field triggers submit button click
	document.getElementById('airport-form-input').onkeydown = function(e) {
		if (e.keyCode == 13) {
			$submitButton.trigger("click");
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
		showCeiling(data);
		//in the css file, these elements' visibility's are set to hidden, so that the headings arent listed on the page before user provides an aiport
		$("section").css("visibility", "visible");
		$(".airport-heading-row").css("visibility", "visible");

	}

	function statusSuccessFunction(data) {
		console.log("staus data: ");
		console.log(data);
		showAirportName(data);
		showAirportLocation(data);
	}
	//do if ajax request fails
	function rejectFunction() {
		console.log("REJECTEDDDDDDDDDDDDDDDDDDDDDDDDD")
	}

	$submitButton.on("click", function() {
		event.preventDefault()
		getAirportCode();
		getAirportIATA();
		displayAirportCode();
		$.get("https://avwx.rest/api/metar/" + airportCode)
			.then(successFunction)
		$.get("https://services.faa.gov/airport/status/" + airportIATA + "?format=application/JSON")
			.then(statusSuccessFunction)
			//TODO FIX THIS SHIT 
			//.catch(rejectFunction)
	})



});