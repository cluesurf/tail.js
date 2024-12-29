import Tail, { TailRank } from './index.js'
import { format } from 'date-fns'

const host = '@termsurf/tail'

type Base = {
  execution_time: {
    take: {
      time: number
    }
  }
}

type Name = keyof Base

Tail.base(
  host,
  'execution_time',
  (take: Base['execution_time']['take']) => ({
    note: 'Execution time logged.',
    link: take,
  }),
)

Tail.time(time => format(time, 'yyyy/MM/dd @ hh:mm:ssaaa'))

export default function tail<N extends Name>({
  rank = 'log',
  form,
  take,
}: {
  rank?: TailRank
  form: N
  take?: Base[N]
}) {
  Tail.mark(Tail.make({ host, form, rank, take }))
}
