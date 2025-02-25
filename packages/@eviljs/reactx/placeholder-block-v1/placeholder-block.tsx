import {Box, type BoxProps} from '@eviljs/react/box'
import type {VoidProps} from '@eviljs/react/props'
import {classes} from '@eviljs/web/classes'

export function PlaceholderBlock(props: PlaceholderBlockProps): React.JSX.Element {
    const {className, height, style, width, ...otherProps} = props

    return (
        <Box
            {...otherProps}
            className={classes('PlaceholderBlock-e79a', className)}
            style={{
                ...style,
                width,
                ...{'--PlaceholderBlock-height': height} as React.CSSProperties,
            }}
        />
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface PlaceholderBlockProps extends VoidProps<BoxProps> {
    height?: undefined | string
    width?: undefined | string
}
