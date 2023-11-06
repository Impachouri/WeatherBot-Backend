import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as dotenv from 'dotenv';
import { UserService } from 'src/admin/admin.service';
const TelegramBot = require('node-telegram-bot-api');
const cron = require('node-cron');

dotenv.config();

@Injectable()
export class TelegramService {
  private readonly bot: any;
  private logger = new Logger(TelegramService.name);
  private users = {};
  private subscriptions = {};

  constructor(private userService: UserService) {
    this.bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
    this.bot.on('message', this.onReceiveMessage);
    this.sendMessageToUser(process.env.TEST_USER_ID, `Server started at ${new Date()}`);

    cron.schedule("*/40 * * * * *", this.sendDailyWeatherUpdates);
  }

  onReceiveMessage = async (msg: any) => {
    const chatId = msg.chat.id;
    const messageText = msg.text;

    if (messageText === '/start') {
      this.users[chatId] = { state: 'awaitingCity' };
      this.sendMessageToUser(chatId, 'Please enter your city name:');
    } else if (messageText === '/subscribe') {
      if (this.users[chatId] && this.users[chatId].state === 'cityConfirmed') {
        try{
          this.users[chatId].isSubscribe = true;
          const subscribe = await this.userService.updateByChatId(chatId, this.users[chatId].city, this.users[chatId]);
          this.sendMessageToUser(chatId, 'You are now subscribed to daily weather updates.');
        }
        catch(error){
          this.logger.debug("Error to subscribe",error);
          this.sendMessageToUser(chatId,"Error in subscription, Please try again");
        }
      } else {
        this.users[chatId] = { state: 'awaitingCity' };
        this.sendMessageToUser(chatId, 'Please confirm your city first by sending the city name.');
      }
    } else if (messageText === '/unsubscribe') {
      try{
        this.users[chatId].isSubscribe = false;
        const subscribed = await this.userService.updateUserById(chatId, {"isSubscribe":false});
        if(subscribed){
          this.sendMessageToUser(chatId, 'You are unsubscribed from daily weather updates.');
          delete this.subscriptions[chatId];
        }
      }catch(error){
        this.logger.debug("Error - Unsubscribe", error);
        this.sendMessageToUser(chatId, "Unable to Unsubscribe");
      }
    } else {
      if (this.users[chatId] && this.users[chatId].state === 'awaitingCity') {
        this.users[chatId].city = messageText;
        this.users[chatId].state = 'cityConfirmed';
        this.users[chatId].chatId = chatId;

        const status = this.getWeatherAndSend(chatId, messageText);
        status.then(async (statusValue)=>{
          if(!statusValue) return;
          this.sendMessageToUser(chatId, `Your city is set to ${messageText}. You can now subscribe to daily weather updates using /subscribe.`);
          try{
            const savedUser = await this.userService.create(this.users[chatId]);
          }catch(error){
            this.logger.debug("Error in saving User - ",error);
          }
        })
    
      } else {
        this.sendMessageToUser(chatId, 'Sorry, I didn\'t understand your message.');
      }
    }

    // console.log("USers")
    // console.log(this.users);
  }

  async getWeatherAndSend(chatId: string, city: string) {
    const apiKey = process.env.WEATHER_API;
    const apiUrl = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`

    try {
      const response = await axios.get(apiUrl);
      // console.log(response.data);
      const weatherData = response.data;
      

      const temperatureEmoji = '🌡️';
      const descriptionEmoji = getWeatherEmoji(weatherData.weather[0].id);
      const pressureEmoji = '🌫️';
      const humidityEmoji = '💧';
      const visibilityEmoji = '🌁';
      const sunriseEmoji = '🌅';
      const sunsetEmoji = '🌇';

      const temperatureCelsius = (weatherData.main.temp - 273.15).toFixed(1);
      const pressurehPa = weatherData.main.pressure;
      const humidityPercentage = weatherData.main.humidity;
      const visibilityKm = (weatherData.visibility / 1000).toFixed(1);
      const sunriseTime = new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString();
      const sunsetTime = new Date(weatherData.sys.sunset * 1000).toLocaleTimeString();

      const message = `Weather in ${city}:\n`
        + `Temperature: ${temperatureCelsius}°C ${temperatureEmoji}\n`
        + `Description: ${weatherData.weather[0].description} ${descriptionEmoji}\n`
        + `Pressure: ${pressurehPa} hPa ${pressureEmoji}\n`
        + `Humidity: ${humidityPercentage}% ${humidityEmoji}\n`
        + `Visibility: ${visibilityKm} km ${visibilityEmoji}\n`
        + `Sunrise: ${sunriseTime} ${sunriseEmoji}\n`
        + `Sunset: ${sunsetTime} ${sunsetEmoji}`;

      this.sendMessageToUser(chatId, message);
      return true;
    } catch (error) {
      this.sendMessageToUser(chatId, 'Sorry, '+error.response.data.message);
      return false;
    }
  }

  sendDailyWeatherUpdates = async() => {

    try{
      const subscriptions = await this.userService.findAll();
      subscriptions.map((subscription) =>{
        if(subscription.isSubscribe && !subscription.isBlock)
          this.getWeatherAndSend(subscription["chatId"].toString(), subscription["city"]);
      })
    }catch(error){
      this.logger.debug("Error: sendDailyWeatherUpdates",error);
    }
  }

  sendMessageToUser = (userId: string, message: string) => {
    this.bot.sendMessage(userId, message);
  };
}

function getWeatherEmoji(weatherCode: number): string {
    switch (Math.floor(weatherCode / 100)) {
      case 2: return '⛈️'; // Thunderstorm
      case 3: return '🌧️'; // Drizzle
      case 5: return '🌧️'; // Rain
      case 6: return '❄️'; // Snow
      case 7: return '🌫️'; // Atmosphere
      case 8:
        switch (weatherCode) {
          case 800: return '☀️'; // Clear sky
          case 801: return '🌤️'; // Few clouds
          case 802: return '🌤️'; // Scattered clouds
          case 803: return '🌥️'; // Broken clouds
          case 804: return '☁️'; // Overcast clouds
        }
    }
  
    return '🌦️'; // Default to partly cloudy
  }
  