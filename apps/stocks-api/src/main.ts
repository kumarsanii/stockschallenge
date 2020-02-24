/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 **/
const _ = require('lodash');
import { Server } from 'hapi';
const config = require('./config.json');
const defaultConfig = config.development;
const environment = process.env.NODE_ENV || 'development';
const environmentConfig = config[environment];
const finalConfig = _.merge(defaultConfig, environmentConfig);

console.log(finalConfig);
const init = async () => {
  // const server = new Server({
  //   port: finalConfig.port,
  //   host: finalConfig.host
  // });

  var server = new Server();
  server.connection({ port: 80 });
  var remotes = {
    url: finalConfig.host + ':' + finalConfig.port,
    path: '/'
  };

  server.route({
    method: '*',
    path: remotes.path,
    handler: {
      proxy: {
        mapUri: function(request, callback) {
          var url =
            remotes.url +
            '/' +
            request.url.href.replace('/' + remotes.path + '/', '');
          callback(null, url);
        },
        passThrough: true,
        xforward: true
      }
    },
    options: {
      cache: {
        expiresIn: 30 * 1000, //expiresIn to 30 seconds
        privacy: 'private'
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/',
    handler: (request, h) => {
      return {
        hello: 'world'
      };
    }
  });

  await server.start();
  console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', err => {
  console.log(err);
  process.exit(1);
});

init();
