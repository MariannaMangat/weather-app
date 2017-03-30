$(document).ready(function () {
  var $statusBar = $('#status');
  var $statusText = $statusBar.children('p');
  var $unitSpan = $('.unit');
  var $locateBtn = $('#locateBtn');
  var $currentLocation = $('#current .location');
  var $currentDay = $('#current .day');
  var $currentTemp = $('#current .temp');
  var $currentConditions = $('#current .conditions');
  var $futureDiv = $('#future');
  var $observationTime = $('#observationTime');

  // -----------------
  // Geolocation API
  // -----------------
  function getCurrentLocation() {
    // If geolocation is not supported, output msg and exit out of function
    if (!navigator.geolocation){
      showStatus('error', 'Geolocation is not supported by this browser');
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
          showStatus('error', 'Geolocation request denied. Try visiting the HTTPS site: <a href="https://codepen.io/tiffanyadu/pen/qryXBo" target="_blank">https://codepen.io/tiffanyadu/pen/qryXBo</a>');
          break;
        case error.POSITION_UNAVAILABLE:
          showStatus('error', 'Location information is unavailable.');
          break;
        case error.TIMEOUT:
          showStatus('error', 'The request to get user location timed out.');
          break;
        case error.UNKNOWN_ERROR:
          showStatus('error', 'An unknown error occurred.');
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
        },
        weather: data.current_observation.weather
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
    var time = getCurrentTime();
    // Print data to page
    $currentLocation.html(location);
    $currentDay.html(today.weekday + ' ' + time);
    $currentTemp.html(Math.round(conditions.temp.f));
    $currentConditions.html(conditions.weather);
    $observationTime.html(conditions.observationTime);
    // Empty Future div to prevent duplicates
    $futureDiv.empty();
    // Loop through forecast array & print data
    forecast.forEach(function(day) {
      $futureDiv.append(
        '<div class="container">' +
        '<h3 class="day">' + day.weekdayShort + '</h3>' +
        '<p class="conditions">' + day.conditions + '</p>' +
        '<p class="tempRange"><span class="hi">' + day.high.f +
        '</span> / <span class="lo">' + day.low.f + '</span></p>' +
        '</div>'
      );
    });
  }

  // Toggle temperature units

  // Animate locateBtn on load

  // Click locateBtn to get current location
  $locateBtn.on('click', function() {
    getCurrentLocation();
  });

  // getCurrentLocation();

  // ------------
  // Status Bar
  // ------------
  function showStatus(type, message) {
    var errorIcon = '<i class="fa fa-exclamation-triangle" aria-hidden="true"></i>';
    var successIcon = '<i class="fa fa-check-circle" aria-hidden="true"></i>';
    // Remove all classes from status bar
    $statusBar.removeClass();
    // Check the type of message, add appropriate classes, and insert info
    if (type === 'error') {
      $statusText.html(errorIcon + '<strong>Error:</strong> ' + message);
      $statusBar.addClass('error');
    } else if (type === 'success') {
      $statusText.html(successIcon + message);
      $statusBar.addClass('success');
    } else {
      $statusText.html(message);
    }
    // Animate open
    $statusBar.slideDown('fast');
  }
  // Status bar animate close
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
      var temp = {}; // Temporary object
      temp.weekday = day.date.weekday;
      temp.weekdayShort = day.date.weekday_short;
      temp.conditions = day.conditions;
      temp.high = {
        c: day.high.celsius,
        f: day.high.fahrenheit
      };
      temp.low = {
        c: day.low.celsius,
        f: day.low.fahrenheit
      };
      newArr.push(temp);
    });
    return newArr;
  }

  // Get and format current time
  function getCurrentTime() {
    var now = new Date();
    var hours = now.getHours();
    var mins = now.getMinutes();
    var period = 'am';
    if (hours > 12) {
      hours -= 12;
      period = 'pm';
    }
    if (mins < 10) {
      mins = '0' + mins;
    }
    return hours + ':' + mins + ' ' + period;
  }


});