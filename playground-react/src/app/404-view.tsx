import {classes} from '@eviljs/react/react'

export function NotFoundView(props: NotFoundViewProps) {
    const {className} = props

    return (
        <h1 className={classes('NotFoundView-ab42 std theme-light', className)}>
            404
        </h1>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface NotFoundViewProps extends React.HTMLAttributes<HTMLDivElement> {
}
