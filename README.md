# Fetcher

Download website contents (just HTML) using a queue job with a provided REST API

> Note: This project was built for educational purposes only

## Installation

``` bash
npm install
```

## Run with Docker

First you'll need to build the image by running:

``` bash
npm run build:docker
```

Then you can run it by using `docker-compose`:

``` bash
docker-compose up
```

## Configuration

Environment variables can be used to configure the following:

* `PORT` - API port (Default: 3000)
* `REDIS_PORT` - Redis database port (Default: 6379)
* `REDIS_HOST` - Redis database host (Default: 127.0.0.1)
* `REDIS_PASSWORD` - Redis database password
* `REDIS_DATABASE` - Redis database instance (Default: 0)

## API

The following REST API is available to create Jobs:

* `POST /job` - Creates a Job
* `GET /job/:jobId` - Returns a pending or completed Job
* `GET /jobs` - Returns all pending Jobs

## Queue and Jobs

Core library to manage Queues and Jobs:

### Example Usage

``` js
const { Queue, Job } = require ('@fetcher/queue')

// Create a queue
const queue = new Queue()

async function main () {
  // Create a Task
  const task = new Promise((resolve, reject) => {
    setTimeout(() => resolve(42), 1000)
  })

  const job = new Job(task)
  queue.add(job)

  job.on('completed', job => {
    // Completed job
  })

  job.on('error', err => {
    // failed job
  })

  // List all peding Jobs
  queue.pending.forEach(job => {
    // job.id
    // job.status
    // job.results
  })

  // Get all processed jobs
  queue.on('processed', job => {
    // job.id
    // job.status
    // job.results
  })

  // Get all completed jobs
  queue.on('completed', job => {
    // job.id
    // job.status
    // job.results
  })

  // Get status of a Job
  const { status } = queue.get(jobId)
}

main()
```

## The MIT License

Copyright (c) 2019 - Julián Duque

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
