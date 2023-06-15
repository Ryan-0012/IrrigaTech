import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-weather-widget-main',
  templateUrl: './weather-widget-main.component.html',
  styleUrls: ['./weather-widget-main.component.css']
})
export class WeatherWidgetMainComponent implements OnInit {
  
  weatherData: any;

  ngOnInit(): void {
    this.weatherData = {
      main : {},
      isDay: true
    };
    this.getWeatherData();
    console.log(this.weatherData);
  }

  getWeatherData() {
    fetch('http://api.openweathermap.org/data/2.5/weather?q=atibaia,br&appid=7f7a188492b0103b05ce517e4cd59fac')
    .then(response=>response.json())
    .then(data=>{this.setWeatherData(data);}) 
  }

  setWeatherData(data: any) {
    this.weatherData = data;
    let sunsetTime = new Date(this.weatherData.sys.sunset * 1000);
    this.weatherData.sunset_time = sunsetTime.toLocaleTimeString();
    let currentDate = new Date();
    this.weatherData.isDay = (currentDate.getTime() < sunsetTime.getTime());
    this.weatherData.temp_celcius = (this.weatherData.main.temp - 273.15).toFixed(0);
    this.weatherData.temp_min = (this.weatherData.main.temp_min - 273.15).toFixed(0);
    this.weatherData.temp_max = (this.weatherData.main.temp_max - 273.15).toFixed(0);
    this.weatherData.temp_feels_like = (this.weatherData.main.feels_like - 273.15).toFixed(0);
  }
}
