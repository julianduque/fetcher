const { Job, Queue } = require('../')

const task = Promise.resolve(42)
const queue = new Queue()

queue.on('processed', job => {
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
  await queue.addAll(jobs)
}
main()
