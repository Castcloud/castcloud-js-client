# Castcloud JavaScript Web Client
## Requirements

 * Castcloud server e.g. [php-server](https://github.com/Castcloud/php-server), [node-castcloud](https://github.com/Castcloud/node-castcloud)
 * Modern web browser e.g. recent verion of Chrome, Safari, Firefox, IE11 and maybe Opera

## Build Instructions

```sh
npm install
gulp
```

## Webservers
.htaccess provided for apache

nginx should use "try_files $uri /index.html;"

## Limitations

 * Offline storage of media files is currently not possible as per browser limitations
