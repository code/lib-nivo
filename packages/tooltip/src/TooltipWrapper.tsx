import { memo, useRef, PropsWithChildren, CSSProperties } from 'react'
import { useSpring, animated } from '@react-spring/web'
import { useMotionConfig, useMeasure } from '@nivo/core'
import { useTheme } from '@nivo/theming'
import { TooltipStateContextDataVisible } from './context'

const TOOLTIP_OFFSET = 14

const tooltipStyle: Partial<CSSProperties> = {
    pointerEvents: 'none',
    position: 'absolute',
    zIndex: 10,
    top: 0,
    left: 0,
}

const translate = (x: number, y: number) => `translate(${x}px, ${y}px)`

interface TooltipWrapperProps {
    position: TooltipStateContextDataVisible['position']
    anchor: TooltipStateContextDataVisible['anchor']
}

export const TooltipWrapper = memo<PropsWithChildren<TooltipWrapperProps>>(
    ({ position, anchor, children }) => {
        const theme = useTheme()
        const { animate, config: springConfig } = useMotionConfig()
        const [measureRef, bounds] = useMeasure()
        const previousPosition = useRef<[number, number] | false>(false)

        let to = undefined
        let immediate = false
        const hasDimension = bounds.width > 0 && bounds.height > 0

        let x = Math.round(position[0])
        let y = Math.round(position[1])

        if (hasDimension) {
            if (anchor === 'top') {
                x -= bounds.width / 2
                y -= bounds.height + TOOLTIP_OFFSET
            } else if (anchor === 'right') {
                x += TOOLTIP_OFFSET
                y -= bounds.height / 2
            } else if (anchor === 'bottom') {
                x -= bounds.width / 2
                y += TOOLTIP_OFFSET
            } else if (anchor === 'left') {
                x -= bounds.width + TOOLTIP_OFFSET
                y -= bounds.height / 2
            } else if (anchor === 'center') {
                x -= bounds.width / 2
                y -= bounds.height / 2
            }

            to = {
                transform: translate(x, y),
            }

            if (!previousPosition.current) {
                immediate = true
            }

            previousPosition.current = [x, y]
        }

        const animatedProps = useSpring<{
            transform: string
        }>({
            to,
            config: springConfig,
            immediate: !animate || immediate,
        })

        const { basic, chip, container, table, tableCell, tableCellValue, ...defaultStyle } =
            theme.tooltip

        const style = {
            ...tooltipStyle,
            ...defaultStyle,
            transform: animatedProps.transform ?? translate(x, y),
            opacity: animatedProps.transform ? 1 : 0,
        }

        return (
            <animated.div ref={measureRef} style={style}>
                {children}
            </animated.div>
        )
    }
)

TooltipWrapper.displayName = 'TooltipWrapper'
