$(document).ready(function () {

  // -----------------
  // Geolocation API
  // -----------------
  function getCurrentLocation() {
    // If geolocation is not supported, output msg and exit out of function
    if (!navigator.geolocation){
      showStatus('error', 'ERROR: Geolocation is not supported by this browser');
      return;
    }
    function showPosition(position) {
      var location  = position.coords.latitude + ',' + position.coords.longitude;
      getWeather(location); // Get weather after getting position
      showStatus('success', 'Success! Location found.');
    }
    function showError(error) {
      switch(error.code) {
        case error.PERMISSION_DENIED:
          showStatus('error', 'ERROR: Geolocation request denied. Try visiting the HTTPS site: <a href="https://codepen.io/tiffanyadu/pen/qryXBo" target="_blank">https://codepen.io/tiffanyadu/pen/qryXBo</a>');
          break;
        case error.POSITION_UNAVAILABLE:
          showStatus('error', 'ERROR: Location information is unavailable.');
          break;
        case error.TIMEOUT:
          showStatus('error', 'ERROR: The request to get user location timed out.');
          break;
        case error.UNKNOWN_ERROR:
          showStatus('error', 'ERROR: An unknown error occurred.');
          break;
      }
    }
    showStatus('', 'Locating…'); // In progress text
    navigator.geolocation.getCurrentPosition(showPosition, showError, {enableHighAccuracy: true});
  }

  // ---------------
  // Weather API
  // ---------------

  // Send request to API to get weather data
  function getWeather(location) {
    var weatherRequest = $.ajax({
      method: 'GET',
      url: 'https://api.wunderground.com/api/d6fadca18738e4ec/geolookup/conditions/forecast/q/' + location + '.json'
    });
    // If successful, store the data I need
    weatherRequest.done(function(data) {
      var currentLocation = data.current_observation.display_location.city + ', ' + data.current_observation.display_location.state;
      var currentConditions = {
        observationTime: data.current_observation.observation_time,
        temp: {
          c: data.current_observation.temp_c,
          f: data.current_observation.temp_f
        }
        // weather: data.current_observation.weather
      };
      var forecastArray = simplifyData(data.forecast.simpleforecast.forecastday);
      displayWeather(currentLocation, currentConditions, forecastArray);
    });
    // If request fails, show error
    weatherRequest.fail(function(xhr, status, error) {
      console.warn(error.message);
    });
  }

  // Display data on page
  function displayWeather(location, conditions, forecast) {
    // Separate today's forecast from the rest
    var today = forecast.shift();
    var $futureDiv = $('#future');
    // Today - Print weather data
    $('#current .location').html(location);
    $('#current .date').html(today.date);
    $('#current .time').html(getCurrentTime());
    $('#current .weatherIcon > div').attr('class', today.icon);
    $('#current .conditions').html(today.conditions);
    $('#current .temp').html(Math.round(conditions.temp.f));
    $('#current .tempRange .high').html(today.high.f);
    $('#current .tempRange .low').html(today.low.f);
    $('#observationTime').html(conditions.observationTime);
    // Future - Empty div to prevent duplicates
    $futureDiv.empty();
    // Loop through forecast array & print data for future forecasts
    forecast.forEach(function(day) {
      $futureDiv.append(
        '<div class="container">' +
        '<h3 class="day">' + day.weekdayShort + '</h3>' +
        '<div class="weatherIcon"><div class="' + day.icon + '"><div class="inner"></div></div></div>' +
        '<p class="conditions">' + day.conditions + '</p>' +
        '<p class="tempRange"><span class="high">' + day.high.f + '</span> | <span class="low">' + day.low.f + '</span></p>' +
        '</div>'
      );
    });
  }

  // ------------------------
  // Locate and Unit Buttons
  // ------------------------
  var $locateBtn = $('#locateBtn');
  var $unitBtn = $('.unitBtn');

  // Animate locateBtn on load

  // Click locateBtn to get current location
  $locateBtn.on('click', function() {
    getCurrentLocation();
  });

  // Toggle temperature units
  // Default to Fahrenheits


  // ------------
  // Status Bar
  // ------------
  var $statusBar = $('#status');

  function showStatus(statusType, message) {
    var $statusText = $statusBar.children('p');
    var icon = '';
    // Set icon based on statusType
    if (statusType === 'error') {
      icon = '<i class="fa fa-exclamation-triangle" aria-hidden="true"></i>';
    } else if (statusType === 'success') {
      icon = '<i class="fa fa-check-circle" aria-hidden="true"></i>';
    }
    // Set status class, icon, text, and open animation
    $statusText.html(icon + message);
    $statusBar.attr('class', statusType).slideDown('fast');
  }
  // Status bar close animation
  $statusBar.children('.close').on('click', function() {
    $statusBar.slideUp('fast'); // Slide up animation
  });

  // ---------------
  // Misc Functions
  // ---------------

  // Grab only the needed info from weather request and return
  function simplifyData(arr) {
    var newArr = [];
    arr.forEach(function(day) {
      var forecast = {}; // Temporary object
      forecast.date = day.date.weekday + ', ' + day.date.monthname + ' ' + day.date.day;
      forecast.weekdayShort = day.date.weekday_short;
      forecast.conditions = day.conditions;
      forecast.icon = day.icon;
      forecast.high = {
        c: day.high.celsius,
        f: day.high.fahrenheit
      };
      forecast.low = {
        c: day.low.celsius,
        f: day.low.fahrenheit
      };
      newArr.push(forecast);
    });
    return newArr;
  }

  // Get and format current time
  function getCurrentTime() {
    var now = new Date();
    var hours = now.getHours();
    var mins = now.getMinutes();
    var period = 'am';
    if (hours > 11) {
      period = 'pm';
      if (hours > 12) hours -= 12; // Format for 12-hr clock
    }
    if (mins < 10) {
      mins = '0' + mins; // Format minutes
    }
    return hours + ':' + mins + ' ' + period;
  }

  // -----------------------------------
  // Default to Chicago weather on load
  // -----------------------------------
  // getCurrentLocation();

});