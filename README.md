# SaluteJazz SDK Demo App

## Описание

**SaluteJazz** — это сервис для проведения видеоконференций. Он предоставляет
возможность организовывать встречи и общаться онлайн с использованием различных
инструментов для совместной работы и обмена информацией.

[Подробнее о сервисе](https://clck.ru/3BEbrk)

**SaluteJazz SDK Web** - это набор модулей для интеграции с сервисом
видеоконференций SaluteJazz, который позволяет:

- создавать комнаты для онлайн-конференций;
- настраивать название комнаты и доступы участников;
- управлять аудио- и видеопотоками всех участников конференции.

[Подробнее о возможностях](https://clck.ru/3BEbxW)

**SaluteJazz SDK Demo App** - это веб-приложение, основная задача которого
познакомить разработчика с набором инструментов для работы с сервисом
SaluteJazz.

## Запуск веб-приложения

Запускаем проект в режиме разработки

```
npm -w jazz-sdk-testapp-web run start
```

Автоматически откроется `http://localhost:8080`

## Запуск веб-приложения на electron

Запускаем проект в режиме разработки

```
npm -w jazz-sdk-testapp-desktop run start
```

Автоматически запустится приложение

## Авторизация

Для работы SaluteJazz SDK требуется ключ (SDK Key), который нужен для любых
интеграций c платформой видеоконференций.

[Выпустить ключ](https://clck.ru/3BEbjq)

### Получаем транспортный токен

Транспортный токен - содержит в себе зашифрованную информацию о пользователе и
позволяет запросить Jazz токен.

Jazz токен - предоставляет доступ к SaluteJazz API.

> Рекомендуется формировать транспортный токен на стороне сервера - это позволит
> скрыть SDK Key от публичного доступа.

##### Исходник

`src/shared/utils/sdkToken.ts`

##### Пример использования

```ts
createSdkToken(SDK_KEY, {
  iss: 'JazzTestApp',
  userName: 'USER_NAME',
  sub: 'USER_ID',
})
  .then(async ({ sdkToken }) => {
    // sdkToken - транспортный токен
  })
  .catch((error) => {});
```
