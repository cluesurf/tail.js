import tail from './example.js'
import Tail from './index.js'

tail({ form: 'execution_time' })

Tail.flow('default', '*', tail =>
  console.log(`${tail.time}: ${tail.form}`),
)

tail({ form: 'execution_time' })

console.log('done')
