import { Dispatch, SetStateAction, useEffect, useState } from 'react'

export function useDebounceState<S>(
    defaultValue: S | (() => S),
    delay = 300
): S {
    const [debouncedState, setDebouncedState] = useState<S>(defaultValue)

    useEffect(() => {
        const timeout = setTimeout(() => {
            setDebouncedState(
                typeof defaultValue === 'function'
                    ? (defaultValue as () => S)()
                    : defaultValue
            )
        }, delay)
        return () => clearTimeout(timeout)
    }, [defaultValue, delay])

    return debouncedState
}
