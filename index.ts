import omit from 'lodash.omit'

export type BaseHook<T extends any = any> = (
  take?: T,
) => TailMeshBase & Link

export type FillHook<T extends any = any, U extends any = any> = (
  take?: T,
  load?: U,
) => Link

export type FlowHook = (tail: TailMesh) => void

export type TimeHook = (time: number) => string

export type Link = Record<string, unknown>

export type LoadHook<T extends any = any> = (take?: T) => Link

const base: Record<string, BaseHook> = {}
const load: Record<string, LoadHook> = {}
const fill: Record<string, FillHook> = {}

let timeHook: TimeHook = (time: number) => String(time)

const flow: Record<string, FlowHook> = {
  'default:*': (tail: TailMesh) =>
    console.log(
      JSON.stringify({
        time: tail.time,
        rank: tail.rank,
        host: tail.host,
        note: tail.note,
        ...omit(tail, ['rank', 'time', 'host', 'form', 'note']),
      }),
    ),
}

export type TailMesh = {
  form: string
  host: string
  link?: Link
  note: string
  take?: Link
  time: string
  rank: TailRank
}

export type TailRank = 'log' | 'debug' | 'warn' | 'error'

export default class Tail {
  form: string

  host: string

  note: string

  link: Link

  time: string

  rank: TailRank

  take?: Link

  static base = (host: string, form: string, hook: BaseHook) => {
    base[`${host}:${form}`] = hook
    return Tail
  }

  static load = (host: string, form: string, hook: LoadHook) => {
    load[`${host}:${form}`] = hook
    return Tail
  }

  static fill = (host: string, form: string, hook: FillHook) => {
    fill[`${host}:${form}`] = hook
    return Tail
  }

  static flow = (host: string, form: string, hook: FlowHook) => {
    flow[`${host}:${form}`] = hook
    return Tail
  }

  static time = (hook: TimeHook) => {
    timeHook = hook
    return Tail
  }

  static make = ({
    host,
    form,
    rank,
    take,
  }: {
    host: string
    form: string
    rank: TailRank
    take?: any
  }) => {
    const time = timeHook(Date.now())
    const hook = base[`${host}:${form}`]
    if (!hook) {
      throw new Error(`Missing ${host}:${form} in Tail.base`)
    }
    const hookLink = hook(take) as TailMeshBase & Link
    const tail = new Tail({
      ...hookLink,
      form,
      rank,
      host,
      take: take as Link,
      time,
    })

    Tail.saveLoad(tail, take)

    return tail
  }

  static mark = (tail: TailMesh) => {
    const hook = flow[`${tail.host}:${tail.form}`] ?? flow['default:*']!

    // log it.
    hook(tail)
  }

  static saveLoad = (tail: Tail, take?: any) => {
    const hook = load[`${tail.host}:${tail.form}`]
    if (!hook) {
      // throw new Error(`Missing ${tail.host}:${tail.form} in Tail.load`)
      return
    }
    tail.link = hook(take)
  }

  static saveFill = (tail: Tail) => {
    const hook = fill[`${tail.host}:${tail.form}`]
    if (!hook) {
      // throw new Error(`Missing ${tail.host}:${tail.form} in Tail.fill`)
      return
    }
    tail.link = hook(tail.take, tail.link)
  }

  constructor({
    host,
    note,
    form,
    take,
    time,
    rank,
    link = {},
  }: TailMesh) {
    Object.defineProperty(this, 'name', {
      enumerable: false,
      value: '',
      writable: true,
    })

    Object.defineProperty(this, 'take', {
      enumerable: false,
      value: take,
      writable: true,
    })

    this.host = host
    this.form = form
    this.note = note
    this.link = link
    this.take = take
    this.time = time
    this.rank = rank
  }

  toJSON(): TailMesh {
    return {
      rank: this.rank,
      host: this.host,
      form: this.form,
      time: this.time,
      note: this.note,
      link: this.link,
    }
  }
}

export type TailMeshBase = {
  note: string
}
