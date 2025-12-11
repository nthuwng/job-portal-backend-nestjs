import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  await app.listen(configService.get<string>('PORT') || 3000);

  console.log(
    `Application is running on: ${configService.get<string>('PORT')}`,
  );
}
bootstrap();
