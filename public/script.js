$(document).ready(function() {



	//global variables
	var $submitButton = $("#airport-form-submit");
	var $airportCodeSpace = $("#airport-code-space");
	var $airportFormInput = $("#airport-form-input");
	var $errorHeading = $("#error-heading");
	var $weatherInfo = $(".weather-info")
	var $rawMetarContainer = $(".raw-metar-container");
	var $rawMetar = $(".raw-metar");
	var $rawTafContainer = $(".raw-taf-container");
	var $rawTaf = $(".raw-taf");
	var $location = $(".city-and-state");
	var $timeRow = $(".time-row");
	var $stationRow = $(".station-row");
	var $flightRulesRow = $(".flight-rules-row");
	var $altimeterRow = $(".altimeter-row");
	var $cloudListRow = $(".cloud-list-row");
	var $cloudSection = $(".cloud-section");
	var $ceilingRow = $(".ceiling-row");
	var $temperatureRow = $(".temperature-row");
	var $dewpointRow = $(".dewpoint-row");
	var $visibilityRow = $(".visibility-row");
	var $windRow = $(".wind-row");
	var $weatherTypeRow = $(".weather-type-row");
	var $airportHeadingRow = $(".airport-heading-row");
	var $airportName = $(".airport-name");
	var $emptyStateOverlay = $(".empty-state-overlay");
	var $airportFormRow = $(".airport-form-row");

	var airportFormInput = document.getElementById("airport-form-input");

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
			if (airportCode.charAt(0) != "K") {
				alert("Did you forget the 'K' dummy?");
			}
			console.log("NOT AN AIRPORT");
			$errorHeading.text("Airport Not Found");
			//won't show previous airport search info  if there is an error on the current search
			$weatherInfo.addClass("display-none");
		} else {
			//if there isnt an error get rid of the display none class if it was previously added
			$weatherInfo.removeClass("display-none");
		}
	}

	function displayAirportCode() {
		$airportCodeSpace.text(airportCode);
	}

	function showRawMetar(data) {
		console.log("DATA: ");
		console.log(data);

		var metars = data.getElementsByTagName("METAR");
		var firstMetar = metars[0];
		console.log("FIRST METAR: ");
		console.log(metars[0]);


		var rawElement = firstMetar.getElementsByTagName("raw_text");
		console.log("Raw Text Element: ")
		console.log(firstMetar.getElementsByTagName("raw_text"));


		var rawObject = rawElement[0];
		console.log("Raw Text Object: ");
		console.log(rawElement[0]);


		var rawHTML = rawObject["innerHTML"];
		console.log("Raw Text HTML: ");
		console.log(rawObject["innerHTML"]);

		$rawMetar.text(rawHTML);

	}


	function showRawTaf(data) {
		console.log("DATA: ");
		console.log(data);

		var tafs = data.getElementsByTagName("TAF");
		var firstTAF = tafs[0];
		console.log("FIRST TAF: ");
		console.log(tafs[0]);


		var rawElement = firstTAF.getElementsByTagName("raw_text");
		console.log("Raw Text Element: ")
		console.log(firstTAF.getElementsByTagName("raw_text"));


		var rawObject = rawElement[0];
		console.log("Raw Text Object: ");
		console.log(rawElement[0]);


		var rawHTML = rawObject["innerHTML"];
		console.log("Raw Text HTML: ");
		console.log(rawObject["innerHTML"]);

		$rawTaf.text(rawHTML);



	}

	function showAirportLocation(data) {
		var city = data["city"];
		var state = data["state"];
		$location.text(city + ", " + state);
	}
	//TODO Add local time
	function showTime(data) {
		var time = data["Time"];
		$timeRow.text("Zulu Date and Time: " + time);
	}

	function showStation(data) {
		var station = data["Station"];
		$stationRow.text("Station: " + station);
	}

	//show vfr / ifr etc
	function showFlightRules(data) {
		var flightRules = data["Flight-Rules"];
		$flightRulesRow.text("Flight Rules: " + flightRules);
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
		$altimeterRow.text("Altimeter: " + altimeter + " " + altimeterUnits);
	}

	function showCloudList(data) {
		//clear cloud list from last entry
		$cloudListRow.empty();
		//cloudList is an array of cloud arrays
		var cloudList = data["Cloud-List"];
		console.log("clould list length is: " + cloudList.length);
		var cloudColNum = (12 / cloudList.length);

		if (cloudList.length < 1) {
			$cloudSection.addClass("display-none");
		} else {
			$cloudSection.removeClass("display-none");
		}
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
			$cloudListRow.append(`<div class = 'col-${cloudColNum} cloud-item'>` + cloudInfo[0] + ": " + cloudInfo[1] + "00 ft" + "</div>");
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
			$ceilingRow.text("Ceiling: " + ceiling + "00" + " ft");
		} else {
			$ceilingRow.text("No Reported Ceiling");
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
		$temperatureRow.text("Temperature: " + temperature + " " + temperatureUnit);
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
		$dewpointRow.text("Dewpoint: " + dewpoint + " " + temperatureUnit);
	}

	function showVisibility(data) {
		var visibility = data["Visibility"];
		var visibilityUnit = data["Units"]["Visibility"];
		$visibilityRow.text("Visibility: " + visibility + " " + visibilityUnit);
	}

	function showWindDirection(data) {
		var windDirection = data["Wind-Direction"];
		windDirection = windDirection.toString().split("");
		if (windDirection[0] == "0") {
			windDirection[0] = [""];
		}
		windDirection = windDirection.join("");
		$windRow.append("<div class = 'col-2 wind-item'>" + "Direction: " + windDirection + "&deg" + "</div>");
	}

	function showWindSpeed(data) {
		var windSpeed = data["Wind-Speed"];
		windSpeed = windSpeed.toString().split("");
		if (windSpeed[0] == "0") {
			windSpeed[0] = [""];
		}
		windSpeed = windSpeed.join("");
		var windSpeedUnit = data["Units"]["Wind-Speed"];
		$windRow.append("<div class = 'col-2 wind-item'>" + "Speed: " + windSpeed + "" + windSpeedUnit + "</div>");
	}

	function showWindGust(data) {
		var windGust = data["Wind-Gust"];
		var windSpeedUnit = data["Units"]["Wind-Speed"];
		if (windGust) {
			$windRow.append("<div class = 'col-2 wind-item'>" + "Gust: " + windGust + " " + windSpeedUnit + "</div>");
		}
	}

	function showWindVariableDirection(data) {
		var windVariableDirection = data["Wind-Variable-Dir"];
		//TODO check if this works
		// windVariableDirection[0] = windVariableDirection[0].toString().split("");
		// if (windVariableDirection[0][0] == "0") {
		// 	windVariableDirection[0][0] = [""];
		// }

		// windVariableDirection[1] = windVariableDirection[1].toString().split("");
		// if (windVariableDirection[1][0] == "0") {
		// 	windVariableDirection[1][0] = [""];
		// }
		if (windVariableDirection.length > 0) {
			$windRow.append("<div class = 'col-2 wind-item'>" + "Variable: " + windVariableDirection[0] + "&deg" + " to " + windVariableDirection[1] + "&deg" + "</div>");
		}
	}

	function showAirportName(data) {
		var airportName = data["name"];
		$airportName.text(airportName);
	}

	function showWeatherType(data) {
		var weatherType = data["weather"]["weather"];
		$weatherTypeRow.text("Weather Type: " + weatherType);
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
		document.getElementById("radar-image").src = radarURL;

	}

	//do if ajax request is successful
	function avwxSuccessFunction(data) {
		console.log(data);
		$(".avwx-loading").css("display", "none");
		checkError(data);
		$windRow.empty();
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
		$airportHeadingRow.css("visibility", "visible");
	}

	function statusSuccessFunction(data) {
		console.log("staus data: ");
		console.log(data);
		$(".status-loading").css("display", "none");
		showAirportName(data);
		showAirportLocation(data);
		showWeatherType(data)
		getRadarSource(data);
		$("figure").css("visibility", "visible");
	}

	//do if ajax fails
	function statusRejectFunction() {
		console.log("STATUS REJECTEDDDDDDDDDDDDDDDDDDDDDDDDD");
	}

	function avwxRejectFunction() {
		console.log("REJECTEDDDDDDDDDDDDDDDDDDDDDDDDD")
	}

	function awsTafSuccess(data) {
		$(".raw-taf-loading").css("display", "none");
		showRawTaf(data);
	}

	function awsTafFail() {
		$rawTafContainer.css("visibility", "hidden");
	}

	function awsMetarSuccess(data) {
		showRawMetar(data);
		$(".raw-metar-loading").css("display", "none");
	}

	function awsMetarFail() {
		$rawMetarContainer.css("visibility", "hidden");
	}

	//hitting enter on input field triggers submit button click
	airportFormInput.onkeydown = function(e) {
		if (e.keyCode == 13) {
			$submitButton.trigger("click");
		}
	};

	$submitButton.on("click", function(event) {
		$(".loading").css("display", "block");
		$emptyStateOverlay.fadeOut();
		$airportName.empty();
		$location.empty();
		$airportFormRow.prependTo("body");
		event.preventDefault(event);
		getAirportCode();
		getAirportIATA();
		displayAirportCode();
		$.get("https://avwx.rest/api/metar/" + airportCode)
			.done(avwxSuccessFunction)
			.fail(avwxRejectFunction)
		$.get("https://services.faa.gov/airport/status/" + airportIATA + "?format=application/JSON")
			.done(statusSuccessFunction)
			.fail(statusRejectFunction)
		$.get("http://galvanize-cors-proxy.herokuapp.com/http://aviationweather.gov/adds/dataserver_current/httpparam?dataSource=tafs&requestType=retrieve&format=xml&stationString=" + airportCode + "&hoursBeforeNow=4")
			.done(awsTafSuccess)
			.fail(awsTafFail)
		$.get("http://galvanize-cors-proxy.herokuapp.com/https://aviationweather.gov/adds/dataserver_current/httpparam?dataSource=metars&requestType=retrieve&format=xml&stationString=" + airportCode + "&hoursBeforeNow=2")
			.done(awsMetarSuccess)
			.fail(awsMetarFail)
	})


	$("#radar-image, .fa-expand").on("click", function() {
		$("#radar-image").toggleClass("double-sized-radar");
	});



});