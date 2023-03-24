import { Response, Request } from 'express'

export type RequestWithQuery<T> = Request<{}, {}, {}, T>
export type ResponseWithBody<T> = Response<T | { message: string }>
