export function debounce<A extends Array<unknown>>(task: Task<A>, delay: number) {
    interface State {
        args: null | A
        callTime: null | number
        timeoutId: null | number
    }
    const state: State = {
        args: null,
        callTime: null,
        timeoutId: null,
    }

    function call(...args: A) {
        state.args = args
        state.callTime = Date.now()

        if (state.timeoutId !== null) {
            return
        }

        state.timeoutId = setTimeout(run, delay)
    }

    function cancel() {
        if (state.timeoutId === null) {
            return
        }

        clearTimeout(state.timeoutId)
        state.timeoutId = null
    }

    function run() {
        const elapsedTime = Date.now() - state.callTime!
        const isTimeExpired = elapsedTime >= delay

        if (isTimeExpired) {
            state.timeoutId = null
            task(...state.args!)
        }
        else {
            const remainingDelay = delay - elapsedTime
            state.timeoutId = setTimeout(run, remainingDelay)
        }
    }

    call.cancel = cancel

    return call
}

export function throttle<A extends Array<unknown>>(task: Task<A>, delay: number) {
    interface State {
        args: null | A
        timeoutId: null | number
    }
    const state: State = {
        args: null,
        timeoutId: null,
    }

    function call(...args: A) {
        state.args = args

        if (state.timeoutId !== null) {
            return
        }

        state.timeoutId = setTimeout(run, delay)
    }

    function cancel() {
        if (state.timeoutId === null) {
            return
        }

        clearTimeout(state.timeoutId)
        state.timeoutId = null
    }

    function run() {
        state.timeoutId = null
        task(...state.args!)
    }

    call.cancel = cancel

    return call
}

// Types ///////////////////////////////////////////////////////////////////////

export interface Task<A extends Array<unknown>> {
    (...args: A): void
}
