# autocannon

[![Join the chat at https://gitter.im/mcollina/autocannon](https://badges.gitter.im/mcollina/autocannon.svg)](https://gitter.im/mcollina/autocannon?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

![demo](https://raw.githubusercontent.com/mcollina/autocannon/master/demo.gif)

An HTTP benchmarking tool written in node, greatly inspired by
[wrk][wrk] and [wrk2][wrk2], with support to HTTP pipelining.
On _my_ box, *autocannon* can produce more load than `wrk` and `wrk2`.

* [Installation](#install)
* [Usage](#usage)
* [Benchmarks](#benchmarks)
* [API](#api)
* [Acknowledgements](#acknowledgements)
* [License](#license)

## Install

```
npm i autocannon -g
```

or if you want to use the [API](#api) or as a dependency:

```
npm i autocannon --save
```

### Supported systems

**autocannon** is supported on Linux, Mac OS X and Windows.
If you see any errors during installation, you might need to configure
your system to compile native addons:
follow the instructions at [node-gyp][node-gyp].

## Usage

### Command Line

```
Usage: autocannon [opts] URL

Available options:

  -c/--connections NUM  The number of concurrent connections to use
  -p/--pipelining NUM   The number of pipelined requests to use
  -d/--duration SEC     The number of seconds to run the autocannnon
  -m/--method METHOD    The http method to use
  -b/--body FILE        The body of the request
  -h/--headers K=V      The request headers
  -j/--json             Print the output as json
  -l/--latency          Print all the latency data
  -h/--help             Print this menu
```

### Programmatically

```js
'use strict'

const autocannon = require('autocannon')

autocannon({
  url: 'http://localhost:3000',
  connections: 10, //default
  pipelining: 1, // default
  duration: 10 // default
}, console.log)
```

## API

### autocannon(opts[, cb])

Start autocannon against the given target.

* `opts`: Configuration options for the autocannon instance. This can have the following attributes. _REQUIRED_.
    * `url`: The given target. _REQUIRED_.
    * `connections`: The number of concurrent connections. _OPTIONAL_ default: `10`.
    * `duration`: The number of seconds to run the autocannon. _OPTIONAL_ default: `10`.
    * `pipelining`: The number of [pipelined requests](https://en.wikipedia.org/wiki/HTTP_pipelining) for each connection. _OPTIONAL_ default: `1`.
    * `method`: The http method to use. _OPTIONAL_ `default: 'GET'`.
    * `body`: A `String` or a `Buffer` containing the body of the request. Leave undefined for an empty body. _OPTIONAL_ default: `undefined`.
    * `headers`: An `Object` containing the headers of the request. _OPTIONAL_ default: `{}`.
* `cb`: The callback which is called on completion of the benchmark. Takes the following params. _OPTIONAL_.
    * `err`: If there was an error encountered with the run.
    * `results`: The results of the run.

**Returns** an instance/event emitter for tracking progress, etc.

### autocannon.track(instance[, opts])

Track the progress of your autocannon, programmatically.

* `instance`: The instance of autocannon. _REQUIRED_.
* `opts`: Configuration options for tracking. This can have the following attibutes. _OPTIONAL_.
    * `outputStream`: The stream to output to. `default: process.stderr`.
    * `renderProgressBar`: A truthy value to enable the rendering of the progress bar. `default: true`.
    * `renderResultTable`: A truthy value to enable the rendering of the results table. `default: true`.
    * `progressBarString`: A `string` defining the format of the progress display output. Must be valid input for the [progress bar module](http://npm.im/progress). `default: 'running [:bar] :percent'`.

Example that just prints on completion:

```js
'use strict'

const autocannon = require('autocannon')

const instance = autocannon({
  url: 'http://localhost:3000'
}, console.log)

// just render results
autocannon.track(instance, {renderProgressBar: false})
```

### autocannon events

Because an autocannon instance is an `EventEmitter`, it emits several events. these are below:

* `tick`: Emitted every second this autocannon is running a benchmark. Useful for displaying stats, etc. Used by the `track` function.
* `done`: Emitted when the autocannon finishes a benchmark. passes the `results` as an argument to the callback.
* `response`: Emitted when the autocannons http-client gets a http response from the server. This passes the following arguments to the callback:
    * `client`: The `http-client` itself. Can be used to modify the headers and body the client will send to the server. API below.
    * `statusCode`: The http status code of the response.
    * `resBytes`: The response bytes in `Buffer` format.
    * `responseTime`: The time taken to get a response for the initiating the request.

### `Client` API

This object is passed as the first parameter of the `response` event from an autocannon instance. You can use this to modify the body and headers of the requests you are sending while benchmarking.

* `client.setHeaders(headers)`: Used to modify the headers of future requests this client makes. `headers` should be an `Object`, or `undefined` if you want to remove your headers.
* `client.setBody(body)`: Used to modify the body of futures requests this client makes. `body` should be a `String` or `Buffer`, or `undefined` if you want to remove the body.
* `client.setHeadersAndBody(headers, body)`: Used to modify the both the header and body of future requests this client makes.`headers` and `body` should take the same form as above. `Note: call this when modifying both headers and body for faster response encoding`

Example using the autocannon events and the client API:

```js
'use strict'

const autocannon = require('autocannon')

const instance = autocannon({
  url: 'http://localhost:3000'
}, (err, result) => handleResults(result))
// results passed to the callback are the same as those emitted from the done events
instance.on('done', handleResults)

instance.on('tick', () => console.log('ticking'))

instance.on('response', handleResonse)

function handleResponse (client, statusCode, resBytes, responseTime) {
  console.log(`Got response with code ${statusCode} in ${responseTime} milliseconds`)
  console.log(`response: ${resBytes.toString()}`)

  //update the body or headers
  client.setHeaders({new: 'header'})
  client.setBody('new body')
  client.setHeadersAndBody({new: 'header'}, 'new body')
}

function handleResults(result) {
  // ...
}
```

<a name="acknowledgements"></a>
## Acknowledgements

This project was kindly sponsored by [nearForm](http://nearform.com).

[wrk][wrk] and [wrk2][wrk2] provided great inspiration.

### Chat on Gitter

If you are using autocannon or you have any questions, let us know: [Gitter](https://gitter.im/mcollina/autocannon)

## License

Copyright [Matteo Collina](https://github.com/mcollina) and other contributors, Licensed under [MIT](./LICENSE).

[node-gyp]: https://github.com/nodejs/node-gyp#installation
[wrk]: https://github.com/wg/wrk
[wrk2]: https://github.com/giltene/wrk2
