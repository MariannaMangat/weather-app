$(document).ready(function () {
  var $status = $('#status p');
  var $location = $('#location');
  var $currentTemp = $('#currentTemp');
  var $currentConditions = $('#currentConditions');
  var $day1 = $('#day1');
  var $day2 = $('#day2');
  var $day3 = $('#day3');

  // Get current location coordinates
  function getCurrentLocation() {
    // If geolocation is not supported, output msg and exit out of function
    if (!navigator.geolocation){
      $status.show('slow').html('Geolocation is not supported by your browser');
      return;
    }
    function success(position) {
      var location  = position.coords.latitude + ',' + position.coords.longitude;
      getWeather(location); // Get weather after getting position
    }
    function error(error) {
      $status.show('slow').html('Unable to retrieve your location. Error(' + error.code + '): ' + error.message);
    }
    $status.show('slow').html('Locating…'); // In progress text
    navigator.geolocation.getCurrentPosition(success, error);
  }

  // Grab only the needed info from weather request and return
  function simplifyData(arr) {
    var newArr = [];
    arr.forEach(function(day) {
      var temp = {}; // Temporary object
      temp.currentTime = day.date.pretty;
      temp.conditions = day.conditions;
      temp.high = day.high;
      temp.low = day.low;
      newArr.push(temp);
    });
    return newArr;
  }

  // Send request to API to get weather data
  function getWeather(location) {
    var weatherRequest = $.ajax({
      method: 'GET',
      url: 'https://api.wunderground.com/api/d6fadca18738e4ec/geolookup/forecast/q/' + location + '.json'
    });
    weatherRequest.done(function(data) {
      var currentLocation = data.location.city + ', ' + data.location.state;
      var forecastArray = data.forecast.simpleforecast.forecastday;
      forecastArray = simplifyData(forecastArray);
      displayWeather(currentLocation, forecastArray);
      //console.log(forecastArray);
    });
    weatherRequest.fail(function(xhr, status, error) {
      console.warn(error.message);
    });
  }

  // Print data to page
  function displayWeather(location, forecast) {
    $status.hide('slow'); // Hide status bar
    $location.html(location);
    console.log(forecast);
  }
  // Toggle temperature units

  // Get current location on load
  getCurrentLocation();

});