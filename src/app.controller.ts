import { Controller, Get, Patch, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';

// @Controller('api')
// export class ConfigController {
//   constructor(private readonly configService: ConfigService) {}

//   @Patch()
//   updateConfig(@Body() updatedConfig: Record<string, any>) {
//     // Implement the logic to update your configuration here
//     this.configService.updateConfig(updatedConfig);
//   }
// }

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}


// @Controller('api')
// export class ApiController {
//   @Post('update-env-variable')
//   updateEnvVariable(@Body() data: { key: string, value: string }) {
//     console.log(data.key, data.value);
//     process.env.WEATHER_API = "nakxnoaid";
//     return { message: `Updated ${data.key} to ${data.value}` };
//   }
// }

@Controller('api')
export class ApiController {
  constructor(private configService: ConfigService) {}


  @Get('weather-key')
  getWeatherApiKey(): string {
    const apiKey = process.env.WEATHER_API || '';
    if (apiKey.length > 10) {
      const hiddenPart = '*'.repeat(apiKey.length - 10);
      return `${hiddenPart}${apiKey.slice(-10)}`;
    }
    return apiKey;
  }

  @Post('update-env-variable')
  updateApiUrl(@Body() data: { value: string }) {
    if (!data.value) {
      return { message: 'Value cannot be empty.' };
    }
    console.log("weatehr key - ",process.env.WEATHER_API);
    console.log("New Key - ", data.value);
    process.env.WEATHER_API = data.value;
    console.log("weatehr key - ",process.env.WEATHER_API);
    return { message: 'API Value updated successfully' };
  }
}