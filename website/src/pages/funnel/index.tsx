import React, { Ref } from 'react'
import { graphql, useStaticQuery, PageProps } from 'gatsby'
import omit from 'lodash/omit.js'
import merge from 'lodash/merge.js'
import { ResponsiveFunnel, svgDefaultProps, FunnelDatum, FunnelSvgProps } from '@nivo/funnel'
import { ComponentTemplate } from '../../components/components/ComponentTemplate'
import meta from '../../data/components/funnel/meta.yml'
import mapper from '../../data/components/funnel/mapper'
import { groups } from '../../data/components/funnel/props'
import { generateLightDataSet } from '../../data/components/funnel/generator'

type MappedFunnelProps = Omit<FunnelSvgProps<FunnelDatum>, 'data' | 'width' | 'height'>
type UnmappedFunnelProps = Omit<MappedFunnelProps, 'valueFormat'> & {
    valueFormat: {
        format: string
        enabled: boolean
    }
}

const initialProperties: UnmappedFunnelProps = {
    margin: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20,
    },
    direction: svgDefaultProps.direction,
    interpolation: svgDefaultProps.interpolation,
    shapeBlending: svgDefaultProps.shapeBlending,
    spacing: svgDefaultProps.spacing,
    valueFormat: { format: '>-.4s', enabled: true },
    colors: { scheme: 'spectral' as const },
    fillOpacity: svgDefaultProps.fillOpacity,
    borderWidth: 20,
    borderColor: svgDefaultProps.borderColor,
    borderOpacity: svgDefaultProps.borderOpacity,
    enableLabel: svgDefaultProps.enableLabel,
    labelColor: { from: 'color', modifiers: [['darker', 3]] },
    enableBeforeSeparators: svgDefaultProps.enableBeforeSeparators,
    beforeSeparatorLength: 100,
    beforeSeparatorOffset: 20,
    enableAfterSeparators: svgDefaultProps.enableAfterSeparators,
    afterSeparatorLength: 100,
    afterSeparatorOffset: 20,
    isInteractive: svgDefaultProps.isInteractive,
    currentPartSizeExtension: 10,
    currentBorderWidth: 40,
    animate: svgDefaultProps.animate,
    motionConfig: svgDefaultProps.motionConfig,
}

const Funnel = ({ location }: PageProps) => {
    const {
        image: {
            childImageSharp: { gatsbyImageData: image },
        },
    } = useStaticQuery(graphql`
        query {
            image: file(absolutePath: { glob: "**/src/assets/captures/funnel.png" }) {
                childImageSharp {
                    gatsbyImageData(layout: FIXED, width: 700, quality: 100)
                }
            }
        }
    `)

    return (
        <ComponentTemplate<UnmappedFunnelProps, MappedFunnelProps, FunnelDatum[]>
            name="Funnel"
            meta={meta.Funnel}
            icon="funnel"
            flavors={meta.flavors}
            currentFlavor="svg"
            properties={groups}
            initialProperties={initialProperties}
            defaultProperties={svgDefaultProps}
            propertiesMapper={mapper}
            generateData={generateLightDataSet}
            image={image}
            location={location}
            enableChartDownload
        >
            {(properties, data, theme, logAction, chartRef) => (
                <ResponsiveFunnel
                    {...properties}
                    data={data}
                    ref={chartRef as Ref<SVGSVGElement>}
                    debounceResize={200}
                    theme={merge({}, theme, {
                        labels: {
                            text: {
                                // fontSize: 14,
                            },
                        },
                    })}
                    onClick={part => {
                        logAction({
                            type: 'click',
                            label: `[part] id: ${part.data.id}, value: ${part.formattedValue}`,
                            color: part.color,
                            data: omit(part, ['points', 'areaPoints', 'borderPoints']),
                        })
                    }}
                />
            )}
        </ComponentTemplate>
    )
}

export default Funnel
