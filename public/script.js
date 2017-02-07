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
		console.log("clould list length is: " + cloudList.length);
		var cloudColNum = (12/cloudList.length);
		cloudList.forEach(function(cloudInfo) {



			//cloudInfo is an array with a key value pairs setup
			//i.e.: ["FEW", "100"]	
			//insert commas
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
			$(".cloud-list-row").append(`<div class = 'col-${cloudColNum} cloud-item'>`+ cloudInfo[0] + ": " + cloudInfo[1] + "00 ft" + "</div>");
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
			//changed bkn to broken, ovc to overcast because your changing it in other function
			if (cloudLayer == "Broken" || cloudLayer == "Overcast") {
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
		console.log("CIELINGGGGGGG: " + ceiling);
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

	function showWeatherType(data){
		var weatherType = data["weather"]["weather"];
		$(".weather-type-row").text("Weather Type: " + weatherType);
	}

	//get state from faa api and use it to alter img url from wxunderground
	function getRadarSource(data) {
		var state = data["state"];
		var radarURL;
		switch (state) {

				case "Alabama":
				radarURL = "https://icons.wxug.com/data/weather-maps/radar/united-states/columbus-georgia-region-current-radar-animation.gif";
				break;

				case "Alaska":
				radarURL = "https://icons.wxug.com/data/weather-maps/radar/united-states/anchorage-alaska-region-current-radar-animation.gif";
				break;

				case "Arizona":
				radarURL = "https://icons.wxug.com/data/weather-maps/radar/united-states/prescott-arizona-region-current-radar-animation.gif";
				break;

				case "Arkansas":
				radarURL = "https://icons.wxug.com/data/weather-maps/radar/united-states/little-rock-arkansas-region-current-radar-animation.gif";
				break;
				
				case "California":
				radarURL = "https://icons.wxug.com/data/weather-maps/radar/united-states/bakersfield-california-region-current-radar-animation.gif";
				break;
				

				case "Colorado":
				radarURL = "https://icons.wxug.com/data/weather-maps/radar/united-states/denver-colorado-region-current-radar-animation.gif";
				break;
				

				case "Connecticut":
				radarURL = "https://icons.wxug.com/data/weather-maps/radar/united-states/hartford-connecticut-region-current-radar-animation.gif";
				break;
				

				case "Delaware":
				radarURL = "https://icons.wxug.com/data/weather-maps/radar/united-states/binghamton-new-york-region-current-radar-animation.gif";
				break;
				

				case "Florida":
				radarURL = "https://icons.wxug.com/data/weather-maps/radar/united-states/saint-petersburg-florida-region-current-radar-animation.gif";
				break;
				

				case "Georgia":
				radarURL = "https://icons.wxug.com/data/weather-maps/radar/united-states/columbus-georgia-region-current-radar-animation.gif";
				break;
				

				case "Hawaii":
				radarURL = "https://icons.wxug.com/data/weather-maps/radar/united-states/molokai-hawaii-region-current-radar-animation.gif";
				break;
				

				case "Idaho":
				radarURL = "https://icons.wxug.com/data/weather-maps/radar/united-states/mccall-idaho-region-current-radar-animation.gif";
				break;
				

				case "Illinois":
				radarURL = "https://icons.wxug.com/data/weather-maps/radar/united-states/springfield-illinois-region-current-radar-animation.gif";
				break;
				

				case "Indiana":
				radarURL = "https://icons.wxug.com/data/weather-maps/radar/united-states/des-moines-iowa-region-current-radar.gif";
				break;

				case "Iowa":
				radarURL = "https://icons.wxug.com/data/weather-maps/radar/united-states/des-moines-iowa-region-current-radar.gif";
				break;
				

				case "Kansas":
				radarURL = "https://icons.wxug.com/data/weather-maps/radar/united-states/salina-kansas-region-current-radar-animation.gif";
				break;

				case "Kentucky":
				radarURL = "https://icons.wxug.com/data/weather-maps/radar/united-states/bowling-green-kentucky-region-current-radar-animation.gif";
				break;
				

				case "Louisiana":
				radarURL = "https://icons.wxug.com/data/weather-maps/radar/united-states/new-orleans-louisiana-region-current-radar-animation.gif";
				break;
				

				case "Maine":
				radarURL = "https://icons.wxug.com/data/weather-maps/radar/united-states/berlin-new-hampshire-region-current-radar-animation.gif";
				break;
				

				case "Maryland":
				radarURL = "https://icons.wxug.com/data/weather-maps/radar/united-states/staunton-virginia-region-current-radar-animation.gif";
				break;
				

				case "Massachusetts":
				radarURL = "https://icons.wxug.com/data/weather-maps/radar/united-states/berlin-new-hampshire-region-current-radar-animation.gif";
				break;
				

				case "Michigan":
				radarURL = "https://icons.wxug.com/data/weather-maps/radar/united-states/cadillac-michigan-region-current-radar-animation.gif";
				break;
				

				case "Minnesota":
				radarURL = "https://icons.wxug.com/data/weather-maps/radar/united-states/saint-cloud-minnesota-region-current-radar-animation.gif";
				break;
				

				case "Mississippi":
				radarURL = "https://icons.wxug.com/data/weather-maps/radar/united-states/vicksburg-mississippi-region-current-radar-animation.gif";
				break;
				

				case "Missouri":
				radarURL = "https://icons.wxug.com/data/weather-maps/radar/united-states/jefferson-city-missouri-region-current-radar-animation.gif";
				break;
				

				case "Montana":
				radarURL = "https://icons.wxug.com/data/weather-maps/radar/united-states/lewistown-montana-region-current-radar-animation.gif";
				break;

				case "Nebraska":
				radarURL = "https://icons.wxug.com/data/weather-maps/radar/united-states/north-platte-nebraska-region-current-radar-animation.gif";
				break;
				

				case "Nevada":
				radarURL = "https://icons.wxug.com/data/weather-maps/radar/united-states/reno-nevada-region-current-radar-animation.gif";
				break;
				

				case "New Hampshire":
				radarURL = "https://icons.wxug.com/data/weather-maps/radar/united-states/berlin-new-hampshire-region-current-radar-animation.gif";
				break;
				

				case "New Jersey":
				radarURL = "https://icons.wxug.com/data/weather-maps/radar/united-states/binghamton-new-york-region-current-radar-animation.gif";
				break;
				

				case "New Mexico":
				radarURL = "https://icons.wxug.com/data/weather-maps/radar/united-states/roswell-new-mexico-region-current-radar-animation.gif";
				break;
				

				case "New York":
				radarURL = "https://icons.wxug.com/data/weather-maps/radar/united-states/binghamton-new-york-region-current-radar-animation.gif";
				break;
				

				case "North Carolina":
				radarURL = "https://icons.wxug.com/data/weather-maps/radar/united-states/charlotte-north-carolina-region-current-radar-animation.gif";
				break;
				

				case "North Dakota":
				radarURL = "https://icons.wxug.com/data/weather-maps/radar/united-states/bismarck-north-dakota-region-current-radar-animation.gif";
				break;
				

				case "Ohio":
				radarURL = "https://icons.wxug.com/data/weather-maps/radar/united-states/dayton-ohio-region-current-radar-animation.gif";
				break;
				

				case "Oklahoma":
				radarURL = "https://icons.wxug.com/data/weather-maps/radar/united-states/lawton-oklahoma-region-current-radar-animation.gif";
				break;
				

				case "Oregon":
				radarURL = "https://icons.wxug.com/data/weather-maps/radar/united-states/redmond-oregon-region-current-radar-animation.gif";
				break;

				case "Pennsylvania":
				radarURL = "https://icons.wxug.com/data/weather-maps/radar/united-states/binghamton-new-york-region-current-radar-animation.gif";
				break;
				

				case "Rhode Island":
				radarURL = "https://icons.wxug.com/data/weather-maps/radar/united-states/binghamton-new-york-region-current-radar-animation.gif";
				break;
				

				case "South Carolina":
				radarURL = "https://icons.wxug.com/data/weather-maps/radar/united-states/charlotte-north-carolina-region-current-radar-animation.gif";
				break;
				

				case "South Dakota":
				radarURL = "https://icons.wxug.com/data/weather-maps/radar/united-states/bismarck-north-dakota-region-current-radar-animation.gif";
				break;
				

				case "Tennessee":
				radarURL = "https://icons.wxug.com/data/weather-maps/radar/united-states/bowling-green-kentucky-region-current-radar-animation.gif";
				break;
				

				case "Texas":
				radarURL = "https://icons.wxug.com/data/weather-maps/radar/united-states/san-antonio-texas-region-current-radar-animation.gif";
				break;
				

				case "Utah":
				radarURL = "https://icons.wxug.com/data/weather-maps/radar/united-states/provo-utah-region-current-radar-animation.gif";
				break;
				

				case "Vermont":
				radarURL = "https://icons.wxug.com/data/weather-maps/radar/united-states/berlin-new-hampshire-region-current-radar-animation.gif";
				break;
				

				case "Virginia":
				radarURL = "https://icons.wxug.com/data/weather-maps/radar/united-states/staunton-virginia-region-current-radar-animation.gif";
				break;
				

				case "Washington":
				radarURL = "https://icons.wxug.com/data/weather-maps/radar/united-states/tacoma-washington-region-current-radar-animation.gif";
				break;
				

				case "West Virginia":
				radarURL = "https://icons.wxug.com/data/weather-maps/radar/united-states/staunton-virginia-region-current-radar-animation.gif";
				break;

				case "Wisconsin":
				radarURL = "https://icons.wxug.com/data/weather-maps/radar/united-states/cadillac-michigan-region-current-radar-animation.gif";
				break;
				

				case "Wyoming":
				radarURL = "https://icons.wxug.com/data/weather-maps/radar/united-states/riverton-wyoming-region-current-radar-animation.gif";
				break;

		}
		document.getElementById("radar-image").src=radarURL;

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
		$(".airport-form-row").prependTo("body");
		console.log("staus data: ");
		console.log(data);
		showAirportName(data);
		showAirportLocation(data);
		showWeatherType(data)
		getRadarSource(data);
		$("figure").css("visibility", "visible");
	}

	function statusRejectFunction(){
		console.log("STATUS REJECTEDDDDDDDDDDDDDDDDDDDDDDDDD");
	}
	//do if ajax request fails
	function rejectFunction() {
		console.log("REJECTEDDDDDDDDDDDDDDDDDDDDDDDDD")
	}

	$submitButton.on("click", function() {
		$(".empty-state-overlay:not(.airport-form-row").fadeOut();
		$(".airport-name").empty();
		$(".city-and-state").empty();
		event.preventDefault()
		getAirportCode();
		getAirportIATA();
		displayAirportCode();
		$.get("https://avwx.rest/api/metar/" + airportCode)
			.then(successFunction)
		$.get("https://services.faa.gov/airport/status/" + airportIATA + "?format=application/JSON")
			.then(statusSuccessFunction)
			//TODO FIX THIS SHIT 
			.catch(statusRejectFunction)
	})


	$("#radar-image").on("click", function(){
		$(this).toggleClass("double-sized-radar");
	});

		$(".fa-expand").on("click", function(){
		$("#radar-image").toggleClass("double-sized-radar");
	});



});