import Tail, { TailRank } from './index.js'

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
