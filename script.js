$(document).ready(function () {
  var $statusText = $('#status p');
  var $unitSpan = $('.unit');
  var $currentLocation = $('#current .location');
  var $currentDay = $('#current .day');
  var $currentTemp = $('#current .temp');
  var $currentConditions = $('#current .conditions');
  var $futureDiv = $('#future');
  var $observationTime = $('#observationTime');

  // Get current location coordinates
  function getCurrentLocation() {
    // If geolocation is not supported, output msg and exit out of function
    if (!navigator.geolocation){
      $statusText.html('Geolocation is not supported by your browser').parent().slideDown('fast');
      return;
    }
    function success(position) {
      var location  = position.coords.latitude + ',' + position.coords.longitude;
      getWeather(location); // Get weather after getting position
      $statusText.html('Success! Location found.').parent().slideDown('fast');
    }
    function error(error) {
      $statusText.html('Unable to retrieve your location. Error(' + error.code + '): ' + error.message).parent().slideDown('fast');
    }
    $statusText.html('Locating…').parent().slideDown('fast'); // In progress text
    navigator.geolocation.getCurrentPosition(success, error, {enableHighAccuracy: true});
  }

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
    // Print data to page
    $currentLocation.html(location);
    $currentDay.html(today.weekday);
    $currentTemp.html(Math.round(conditions.temp.f));
    $currentConditions.html(conditions.weather);
    $observationTime.html(conditions.observationTime);
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

  // Status bar close button
  $('.close').on('click', function() {
    $(this).parent().slideUp('fast'); // Slide up animation
  });

  // Toggle temperature units

  // Get current location on load
  getCurrentLocation();

});