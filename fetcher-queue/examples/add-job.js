const { Job, Queue } = require('../')

const task = Promise.resolve(42)
const queue = new Queue(2)

queue.on('completed', job => {
  console.log(job)
})

async function main () {
  const jobs = [
    new Job(task),
    new Job(task),
    new Job(task),
    new Job(task),
    new Job(task)
  ]

  jobs.forEach(job => {
    queue.add(job)
  })
}
main()
