import { forwardRef, Ref, ReactElement } from 'react'
import { Axes, Grid } from '@nivo/axes'
import {
    CartesianMarkers,
    Container,
    SvgWrapper,
    // @ts-expect-error no types
    bindDefs,
    useDimensions,
    useMotionConfig,
    WithChartRef,
} from '@nivo/core'
import { useTransition } from '@react-spring/web'
import { Fragment, ReactNode, createElement, useMemo } from 'react'
import { BarAnnotations } from './BarAnnotations'
import { BarLegends } from './BarLegends'
import { useBar } from './hooks'
import { svgDefaultProps } from './defaults'
import {
    BarComponent,
    BarCustomLayerProps,
    BarDatum,
    BarItemProps,
    BarLayerId,
    BarSvgProps,
    BarTooltipComponent,
    ComputedBarDatumWithValue,
} from './types'
import { BarTotals } from './BarTotals'
import { useComputeLabelLayout } from './compute/common'

type InnerBarProps<D extends BarDatum> = Omit<
    BarSvgProps<D>,
    'animate' | 'motionConfig' | 'renderWrapper' | 'theme'
>

const InnerBar = <D extends BarDatum>({
    data,
    indexBy,
    keys,
    margin: partialMargin,
    width,
    height,
    groupMode,
    layout,
    valueScale,
    indexScale,
    padding,
    innerPadding,
    axisTop,
    axisRight,
    axisBottom = svgDefaultProps.axisBottom,
    axisLeft = svgDefaultProps.axisLeft,
    enableGridX = svgDefaultProps.enableGridX,
    enableGridY = svgDefaultProps.enableGridY,
    gridXValues,
    gridYValues,
    layers = svgDefaultProps.layers as BarLayerId[],
    barComponent = svgDefaultProps.barComponent as unknown as BarComponent<D>,
    enableLabel = svgDefaultProps.enableLabel,
    label,
    labelSkipWidth = svgDefaultProps.labelSkipWidth,
    labelSkipHeight = svgDefaultProps.labelSkipHeight,
    labelTextColor,
    labelPosition = svgDefaultProps.labelPosition,
    labelOffset = svgDefaultProps.labelOffset,
    markers = svgDefaultProps.markers,
    colorBy,
    colors,
    defs = svgDefaultProps.defs,
    fill = svgDefaultProps.fill,
    borderRadius = svgDefaultProps.borderRadius,
    borderWidth = svgDefaultProps.borderWidth,
    borderColor,
    annotations = svgDefaultProps.annotations,
    legendLabel,
    tooltipLabel,
    valueFormat,
    isInteractive = svgDefaultProps.isInteractive,
    tooltip = svgDefaultProps.tooltip as BarTooltipComponent<D>,
    onClick,
    onMouseEnter,
    onMouseLeave,
    legends,
    role = svgDefaultProps.role,
    ariaLabel,
    ariaLabelledBy,
    ariaDescribedBy,
    isFocusable = svgDefaultProps.isFocusable,
    barAriaLabel,
    barAriaLabelledBy,
    barAriaDescribedBy,
    barAriaHidden,
    barAriaDisabled,
    initialHiddenIds,
    enableTotals = svgDefaultProps.enableTotals,
    totalsOffset = svgDefaultProps.totalsOffset,
    forwardedRef,
}: InnerBarProps<D> & {
    forwardedRef: Ref<SVGSVGElement>
}) => {
    const { animate, config: springConfig } = useMotionConfig()
    const { outerWidth, outerHeight, margin, innerWidth, innerHeight } = useDimensions(
        width,
        height,
        partialMargin
    )

    const {
        bars,
        barsWithValue,
        xScale,
        yScale,
        getLabel,
        getTooltipLabel,
        getBorderColor,
        getLabelColor,
        shouldRenderBarLabel,
        toggleSerie,
        legendsWithData,
        barTotals,
        getColor,
    } = useBar<D>({
        indexBy,
        label,
        tooltipLabel,
        valueFormat,
        colors,
        colorBy,
        borderColor,
        labelTextColor,
        groupMode,
        layout,
        data,
        keys,
        margin,
        width: innerWidth,
        height: innerHeight,
        padding,
        innerPadding,
        valueScale,
        indexScale,
        enableLabel,
        labelSkipWidth,
        labelSkipHeight,
        legends,
        legendLabel,
        initialHiddenIds,
        totalsOffset,
    })

    const computeLabelLayout = useComputeLabelLayout(
        layout,
        valueScale?.reverse ?? false,
        labelPosition,
        labelOffset
    )

    const transition = useTransition<
        ComputedBarDatumWithValue<D>,
        {
            borderColor: string
            color: string
            height: number
            labelColor: string
            labelOpacity: number
            labelX: number
            labelY: number
            opacity: number
            transform: string
            width: number
            textAnchor: BarItemProps<D>['style']['textAnchor']
        }
    >(barsWithValue, {
        keys: bar => bar.key,
        from: bar => ({
            borderColor: getBorderColor(bar) as string,
            color: bar.color,
            height: 0,
            labelColor: getLabelColor(bar) as string,
            labelOpacity: 0,
            ...computeLabelLayout(bar.width, bar.height),
            transform: `translate(${bar.x}, ${bar.y + bar.height})`,
            width: bar.width,
            ...(layout === 'vertical'
                ? {}
                : {
                      height: bar.height,
                      transform: `translate(${bar.x}, ${bar.y})`,
                      width: 0,
                  }),
        }),
        enter: bar => ({
            borderColor: getBorderColor(bar) as string,
            color: bar.color,
            height: bar.height,
            labelColor: getLabelColor(bar) as string,
            labelOpacity: 1,
            ...computeLabelLayout(bar.width, bar.height),
            transform: `translate(${bar.x}, ${bar.y})`,
            width: bar.width,
        }),
        update: bar => ({
            borderColor: getBorderColor(bar) as string,
            color: bar.color,
            height: bar.height,
            labelColor: getLabelColor(bar) as string,
            labelOpacity: 1,
            ...computeLabelLayout(bar.width, bar.height),
            transform: `translate(${bar.x}, ${bar.y})`,
            width: bar.width,
        }),
        leave: bar => ({
            borderColor: getBorderColor(bar) as string,
            color: bar.color,
            height: 0,
            labelColor: getLabelColor(bar) as string,
            labelOpacity: 0,
            ...computeLabelLayout(bar.width, bar.height),
            labelY: 0,
            transform: `translate(${bar.x}, ${bar.y + bar.height})`,
            width: bar.width,
            ...(layout === 'vertical'
                ? {}
                : {
                      ...computeLabelLayout(bar.width, bar.height),
                      labelX: 0,
                      height: bar.height,
                      transform: `translate(${bar.x}, ${bar.y})`,
                      width: 0,
                  }),
        }),
        config: springConfig,
        immediate: !animate,
        initial: animate ? undefined : null,
    })

    const commonProps = useMemo(
        () => ({
            borderRadius,
            borderWidth,
            enableLabel,
            isInteractive,
            labelSkipWidth,
            labelSkipHeight,
            onClick,
            onMouseEnter,
            onMouseLeave,
            getTooltipLabel,
            tooltip,
            isFocusable,
            ariaLabel: barAriaLabel,
            ariaLabelledBy: barAriaLabelledBy,
            ariaDescribedBy: barAriaDescribedBy,
            ariaHidden: barAriaHidden,
            ariaDisabled: barAriaDisabled,
        }),
        [
            borderRadius,
            borderWidth,
            enableLabel,
            getTooltipLabel,
            isInteractive,
            labelSkipHeight,
            labelSkipWidth,
            onClick,
            onMouseEnter,
            onMouseLeave,
            tooltip,
            isFocusable,
            barAriaLabel,
            barAriaLabelledBy,
            barAriaDescribedBy,
            barAriaHidden,
            barAriaDisabled,
        ]
    )

    const boundDefs = bindDefs(defs, bars, fill, {
        dataKey: 'data',
        targetKey: 'data.fill',
    })

    const layerById: Record<BarLayerId, ReactNode> = {
        annotations: null,
        axes: null,
        bars: null,
        grid: null,
        legends: null,
        markers: null,
        totals: null,
    }

    if (layers.includes('annotations')) {
        layerById.annotations = (
            <BarAnnotations key="annotations" bars={bars} annotations={annotations} />
        )
    }

    if (layers.includes('axes')) {
        layerById.axes = (
            <Axes
                key="axes"
                xScale={xScale}
                yScale={yScale}
                width={innerWidth}
                height={innerHeight}
                top={axisTop}
                right={axisRight}
                bottom={axisBottom}
                left={axisLeft}
            />
        )
    }

    if (layers.includes('bars')) {
        layerById.bars = (
            <Fragment key="bars">
                {transition((style, bar) =>
                    createElement(barComponent, {
                        ...commonProps,
                        bar,
                        style,
                        shouldRenderLabel: shouldRenderBarLabel(bar),
                        label: getLabel(bar.data),
                    })
                )}
            </Fragment>
        )
    }

    if (layers.includes('grid')) {
        layerById.grid = (
            <Grid
                key="grid"
                width={innerWidth}
                height={innerHeight}
                xScale={enableGridX ? xScale : null}
                yScale={enableGridY ? yScale : null}
                xValues={gridXValues}
                yValues={gridYValues}
            />
        )
    }

    if (layers.includes('legends')) {
        layerById.legends = (
            <BarLegends
                key="legends"
                width={innerWidth}
                height={innerHeight}
                legends={legendsWithData}
                toggleSerie={toggleSerie}
            />
        )
    }

    if (layers.includes('markers')) {
        layerById.markers = (
            <CartesianMarkers<number | string, number>
                key="markers"
                markers={markers as any[]}
                width={innerWidth}
                height={innerHeight}
                xScale={xScale as (v: number | string) => number}
                yScale={yScale as (v: number) => number}
            />
        )
    }

    if (layers.includes('totals') && enableTotals) {
        layerById.totals = (
            <BarTotals
                key="totals"
                data={barTotals}
                springConfig={springConfig}
                animate={animate}
                layout={layout}
            />
        )
    }

    const layerContext: BarCustomLayerProps<D> = {
        ...commonProps,
        margin,
        width,
        height,
        innerWidth,
        innerHeight,
        bars,
        legendData: legendsWithData,
        enableLabel,
        xScale,
        yScale,
        tooltip,
        getTooltipLabel,
        onClick,
        onMouseEnter,
        onMouseLeave,
        getColor,
    }

    return (
        <SvgWrapper
            width={outerWidth}
            height={outerHeight}
            margin={margin}
            defs={boundDefs}
            role={role}
            ariaLabel={ariaLabel}
            ariaLabelledBy={ariaLabelledBy}
            ariaDescribedBy={ariaDescribedBy}
            isFocusable={isFocusable}
            ref={forwardedRef}
        >
            {layers.map((layer, i) => {
                if (typeof layer === 'function') {
                    return <Fragment key={i}>{createElement(layer, layerContext)}</Fragment>
                }

                return layerById?.[layer] ?? null
            })}
        </SvgWrapper>
    )
}

export const Bar = forwardRef(
    <D extends BarDatum>(
        {
            isInteractive = svgDefaultProps.isInteractive,
            animate = svgDefaultProps.animate,
            motionConfig = svgDefaultProps.motionConfig,
            theme,
            renderWrapper,
            ...props
        }: BarSvgProps<D>,
        ref: Ref<SVGSVGElement>
    ) => (
        <Container
            animate={animate}
            isInteractive={isInteractive}
            motionConfig={motionConfig}
            renderWrapper={renderWrapper}
            theme={theme}
        >
            <InnerBar<D> {...props} isInteractive={isInteractive} forwardedRef={ref} />
        </Container>
    )
) as <D extends BarDatum>(props: WithChartRef<BarSvgProps<D>, SVGSVGElement>) => ReactElement
