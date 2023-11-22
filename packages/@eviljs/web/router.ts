import type {ReactiveRef} from '@eviljs/std/reactive.js'
import {isString} from '@eviljs/std/type.js'
import type {QueryParams, QueryParamsDict, QueryParamsList} from './query.js'
import {encodeQueryParamKey, encodeQueryParamValue, encodeQueryParams} from './query.js'
import {joinUrlPathAndParams} from './url.js'

export function areSameRoutes<S>(firstRoute: RouterRoute<S>, secondRoute: RouterRoute<S>): boolean {
    const samePath = firstRoute.path === secondRoute.path
    const sameParams = encodeQueryParams(firstRoute.params) === encodeQueryParams(secondRoute.params)
    const sameState = firstRoute.state === secondRoute.state
    return samePath && sameParams && sameState
}

export function mergeRouteChange<S>(route: RouterRoute<S>, routeChange: RouterRouteChange<S>): RouterRoute<S> {
    const [changePath, changePathParamsString] = routeChange.path?.split('?') ?? []
    const changePathParams = decodeRouteParams(changePathParamsString)
    const changeParams = flattenRouteParams(routeChange.params)

    return {
        path: changePath || route.path, // changePath can be an empty string.
        // Params and State, if not provided, must be initialized to undefined.
        params: changePathParams && changeParams
            // changeParams has precedence over (overwrites) changePathParams.
            ? {...changePathParams, ...changeParams} // Merge.
            : (changeParams ?? changePathParams) // First one defined "wins".
        ,
        state: routeChange.state,
    }
}

export function decodePathRoute<S>(basePath: string): RouterRoute<S> {
    const {pathname, search} = window.location
    const path = basePath
        ? pathname.slice(basePath.length) // pathname.replace(basePath, '')
        : pathname
    const params = decodeRouteParams(
        search.substring(1) // Without the initial '?'.
    )
    const {state} = history

    return {path, params, state}
}

export function decodeHashRoute<S>(): RouterRoute<S> {
    const {hash} = window.location
    const [pathOptional, paramsString] = hash
        .substring(1) // Without the initial '#'.
        .split('?')
    const path = pathOptional || '/' // The empty string is casted to the root path.
    const params = decodeRouteParams(paramsString)
    const {state} = history

    return {path, params, state}
}

export function decodeRouteParams(paramsString: undefined | string): undefined | RouterRouteParams {
    if (! paramsString) {
        // Undefined or empty string must return undefined.
        return
    }

    const params: RouterRouteParams = {}
    const parts = paramsString.split('&')

    for (const part of parts) {
        const [keyEncoded, valueEncoded] = part.split('=')
        // We need to decode because:
        // - the key can be ANY string
        // - the value can be ANY string (even an Array/Object serialized as string).
        const key = keyEncoded ? decodeURIComponent(keyEncoded) : keyEncoded
        const value = valueEncoded ? decodeURIComponent(valueEncoded) : valueEncoded

        if (! key) {
            continue
        }

        params[key] = value ?? ''
    }

    return params
}

/**
* @throws InvalidArgument
**/
export function encodeLink(url: string, params?: undefined | RouterRouteChangeParams): string {
    const [urlPath, urlParams] = url.split('?')
    const paramsString = encodeRouteParams(params)
    const allParams = [urlParams, paramsString].filter(Boolean).join('&')
    const linkEncoded = joinUrlPathAndParams(urlPath ?? '', allParams)
    return linkEncoded
}

/**
* @throws InvalidArgument
**/
export function encodeRoute(path: string, params?: undefined | RouterRouteChangeParams): string {
    const paramsString = encodeRouteParams(params)
    const routeEncoded = joinUrlPathAndParams(path, paramsString)
    return routeEncoded
}

export function encodeRouteParams(params: undefined | RouterRouteChangeParams): string {
    return encodeQueryParams(params, {
        encodeKey: encodeRouteParamKey,
        encodeValue: encodeRouteParamValue,
    })
}

/**
* @throws InvalidArgument
**/
export function encodeRouteParamKey(key: unknown): string {
    if (isString(key)) {
        // We don't encode route params keys of type string.
        // Encoding is an opt-in feature of the developer.
        // In this way the Browser url bar shows
        // `?book:id`
        // instead of
        // `?book%3Aid`.
        return key
    }
    return encodeQueryParamKey(key)
}

/**
* @throws InvalidArgument
**/
export function encodeRouteParamValue(value: unknown): string {
    if (isString(value)) {
        // We don't encode route params values of type string.
        // Encoding is an opt-in feature of the developer.
        // In this way the Browser url bar shows
        // `?redirect=/some/path`
        // instead of
        // `?redirect=%2Fsome%2Fpath`.
        return value
    }
    return encodeQueryParamValue(value)
}

/**
* @throws InvalidArgument
**/
export function flattenRouteParams(routeParams: RouterRouteChangeParams): RouterRouteParams
export function flattenRouteParams(routeParams: undefined | RouterRouteChangeParams): undefined | RouterRouteParams
export function flattenRouteParams(routeParams: undefined | RouterRouteChangeParams): undefined | RouterRouteParams {
    return routeParams
        ? decodeRouteParams(
            encodeQueryParams(routeParams) || undefined // Casts '' to undefined.
        )
        : undefined
}

// Types ///////////////////////////////////////////////////////////////////////

export interface Router<S = unknown> {
    readonly route: ReactiveRef<RouterRoute<S>>
    readonly started: boolean
    start(): void
    stop(): void
    /**
    * @throws InvalidArgument
    **/
    changeRoute(change: RouterRouteChange<S>): void
    /**
    * @throws InvalidArgument
    **/
    createLink(path: string, params?: undefined | RouterRouteChangeParams): string
}

export interface RouterRoute<S = unknown> {
    readonly path: string
    readonly params: undefined | RouterRouteParams
    readonly state: undefined | S
}

export type RouterObserver<S = unknown> = (route: RouterRoute<S>) => void

export interface RouterOptions {
    basePath?: undefined | string
}

export type RouterRouteParams = undefined | Record<string, string>

export interface RouterRouteChange<S = unknown> {
    path?: undefined | string
    params?: undefined | RouterRouteChangeParams
    state?: undefined | undefined | S
    replace?: undefined | boolean
}

export type RouterRouteChangeParams = RouterRouteParams | QueryParams
export type RouterRouteChangeParamsDict = QueryParamsDict
export type RouterRouteChangeParamsList = QueryParamsList
