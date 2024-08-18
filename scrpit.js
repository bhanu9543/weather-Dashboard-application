document.getElementById('city').addEventListener('input', function () {
    const city = this.value.trim();
    if (city) {
        fetchWeather(city);
    }
});

async function fetchWeather(city = 'London') {
    try {
        console.log(`Fetching weather for city: ${city}`);

        const response = await axios.get('https://api.openweathermap.org/data/2.5/forecast', {
            params: {
                q: city,
                appid: '54a57bc234ad752a4f59e59cd372201d',
                units: 'metric'
            }
        });

        if (!response.data.list.length) {
            throw new Error('No weather data available for the specified city.');
        }

        const currentTemp = response.data.list[0].main.temp;
        document.querySelector('.weather-temp').textContent = `${Math.round(currentTemp)}ºC`;

        const forecastData = response.data.list;
        const dailyForecast = {};

        forecastData.forEach(data => {
            const day = new Date(data.dt * 1000).toLocaleDateString('en-US', { weekday: 'long' });
            if (!dailyForecast[day]) {
                dailyForecast[day] = {
                    minTemp: data.main.temp_min,
                    maxTemp: data.main.temp_max,
                    description: data.weather[0].description,
                    humidity: data.main.humidity,
                    windSpeed: data.wind.speed,
                    icon: data.weather[0].icon
                };
            } else {
                dailyForecast[day].minTemp = Math.min(dailyForecast[day].minTemp, data.main.temp_min);
                dailyForecast[day].maxTemp = Math.max(dailyForecast[day].maxTemp, data.main.temp_max);
            }
        });

        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        document.querySelector('.date-dayname').textContent = today;

        const todayDate = new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
        document.querySelector('.date-day').textContent = todayDate;

        const currentWeatherIcon = dailyForecast[today]?.icon || '01d';
        document.querySelector('.weather-icon').innerHTML = getWeatherIcon(currentWeatherIcon);

        document.querySelector('.location').textContent = response.data.city.name;
        document.querySelector('.weather-desc').textContent = capitalizeWords(dailyForecast[today]?.description || '');

        document.querySelector('.humidity .value').textContent = `${dailyForecast[today]?.humidity || 'N/A'} %`;
        document.querySelector('.wind .value').textContent = `${dailyForecast[today]?.windSpeed || 'N/A'} m/s`;

        updateWeeklyForecast(dailyForecast);

    } catch (error) {
        console.error('Error fetching weather data:', error.message);
    }
}

function getWeatherIcon(iconCode) {
    const iconBaseUrl = 'https://openweathermap.org/img/wn/';
    const iconSize = '@2x.png';
    return `<img src="${iconBaseUrl}${iconCode}${iconSize}" alt="Weather Icon">`;
}

function capitalizeWords(text) {
    return text.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function updateWeeklyForecast(dailyForecast) {
    const days = document.querySelectorAll('.day-name');
    const temps = document.querySelectorAll('.day-temp');
    const icons = document.querySelectorAll('.day-icon');

    days.forEach((dayElement, index) => {
        const day = Object.keys(dailyForecast)[index];
        const data = dailyForecast[day];
        if (data) {
            dayElement.textContent = day;
            temps[index].textContent = `${Math.round(data.minTemp)}º / ${Math.round(data.maxTemp)}º`;
            icons[index].innerHTML = getWeatherIcon(data.icon);
        } else {
            dayElement.textContent = '';
            temps[index].textContent = 'N/A';
            icons[index].innerHTML = '';
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    fetchWeather(); // Default city weather on page load
    setInterval(() => fetchWeather(document.getElementById('city').value.trim() || 'hyderabad'), 900000); // Refresh every 15 minutes
});
