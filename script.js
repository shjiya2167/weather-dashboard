
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const message = document.getElementById("message");

const weatherSection = document.getElementById("weatherSection");
const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const condition = document.getElementById("condition");
const wind = document.getElementById("wind");
const forecast = document.getElementById("forecast");

const themeBtn = document.getElementById("themeBtn");
const unitBtn = document.getElementById("unitBtn");
const recentSearches = document.getElementById("recentSearches");

let currentTemp = 0;
let isCelsius = true;

// Weather code description
function getWeather(code) {
    if (code === 0) return "☀ Clear Sky";
    if (code <= 3) return "⛅ Partly Cloudy";
    if (code <= 48) return "🌫 Foggy";
    if (code <= 67) return "🌧 Rainy";
    if (code <= 77) return "❄ Snowy";
    if (code <= 82) return "🌦 Rain Showers";
    if (code <= 86) return "❄ Snow Showers";
    return "⛈ Thunderstorm";
}

// Search city
async function searchWeather(city) {

    if (!city.trim()) {
        message.innerText = "Please enter a city name!";
        weatherSection.classList.add("hidden");
        return;
    }

    message.innerText = "Loading weather data...";
    weatherSection.classList.add("hidden");

    try {

        // Get city coordinates
        const geoURL =
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

        const geoResponse = await fetch(geoURL);

        if (!geoResponse.ok) {
            throw new Error("Unable to fetch city data.");
        }

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error("City not found. Try another city.");
        }

        const place = geoData.results[0];

        const latitude = place.latitude;
        const longitude = place.longitude;

        // Fetch weather data
        const weatherURL =
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=5&timezone=auto`;

        const weatherResponse = await fetch(weatherURL);

        if (!weatherResponse.ok) {
            throw new Error("Unable to fetch weather data.");
        }

        const data = await weatherResponse.json();

        currentTemp = data.current.temperature_2m;
        isCelsius = true;

        // Display current weather
        cityName.innerText =
            `${place.name}, ${place.country}`;

        temperature.innerText =
            `${currentTemp} °C`;

        condition.innerText =
            getWeather(data.current.weather_code);

        wind.innerText =
            `💨 Wind Speed: ${data.current.wind_speed_10m} km/h`;

        unitBtn.innerText = "Switch to °F";

        // Display forecast
        displayForecast(data.daily);

        weatherSection.classList.remove("hidden");
        message.innerText = "";

        saveRecent(place.name);

    } catch (error) {
        message.innerText = error.message ||
            "Something went wrong. Please try again.";
    }
}

// Display 5-day forecast
function displayForecast(daily) {

    forecast.innerHTML = "";

    for (let i = 0; i < daily.time.length; i++) {

        const date = new Date(daily.time[i] + "T00:00:00");

        const day = date.toLocaleDateString("en-US", {
            weekday: "short"
        });

        const card = document.createElement("div");
        card.className = "forecast-card";

        card.innerHTML = `
            <h3>${day}</h3>
            <p>${getWeather(daily.weather_code[i])}</p>
            <p>Max: ${daily.temperature_2m_max[i]}°C</p>
            <p>Min: ${daily.temperature_2m_min[i]}°C</p>
        `;

        forecast.appendChild(card);
    }
}

// Celsius / Fahrenheit
unitBtn.addEventListener("click", function() {

    if (isCelsius) {
        temperature.innerText =
            `${(currentTemp * 9/5 + 32).toFixed(1)} °F`;

        unitBtn.innerText = "Switch to °C";
        isCelsius = false;

    } else {
        temperature.innerText =
            `${currentTemp} °C`;

        unitBtn.innerText = "Switch to °F";
        isCelsius = true;
    }
});

// Search button
searchBtn.addEventListener("click", function() {
    searchWeather(cityInput.value);
});

// Search using Enter key
cityInput.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        searchWeather(cityInput.value);
    }
});

// Dark / Light mode
themeBtn.addEventListener("click", function() {

    document.body.classList.toggle("dark");

    const darkMode =
        document.body.classList.contains("dark");

    localStorage.setItem("theme", darkMode ? "dark" : "light");

    themeBtn.innerText =
        darkMode ? "☀ Light Mode" : "🌙 Dark Mode";
});

// Remember theme after refresh
if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
    themeBtn.innerText = "☀ Light Mode";
}

// Recent searches
function saveRecent(city) {

    let cities = JSON.parse(
        localStorage.getItem("recentCities") || "[]"
    );

    cities = cities.filter(c => c.toLowerCase() !== city.toLowerCase());

    cities.unshift(city);
    cities = cities.slice(0, 5);

    localStorage.setItem("recentCities", JSON.stringify(cities));

    displayRecent();
}

function displayRecent() {

    let cities = JSON.parse(
        localStorage.getItem("recentCities") || "[]"
    );

    recentSearches.innerHTML = "<b>Recent Searches:</b>";

    cities.forEach(city => {

        const btn = document.createElement("button");

        btn.innerText = city;

        btn.addEventListener("click", function() {
            searchWeather(city);
        });

        recentSearches.appendChild(btn);
    });
}

displayRecent();
