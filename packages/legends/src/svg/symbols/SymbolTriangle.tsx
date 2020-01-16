/*
 * This file is part of the nivo project.
 *
 * Copyright 2016-present, Raphaël Benitte.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import React from 'react'
import { LegendSymbolProps } from './index'

export const SymbolTriangle = ({
    x,
    y,
    size,
    fill,
    borderWidth,
    borderColor,
}: LegendSymbolProps) => (
    <g transform={`translate(${x},${y})`}>
        <path
            d={`
                M${size / 2} 0
                L${size} ${size}
                L0 ${size}
                L${size / 2} 0
            `}
            fill={fill}
            strokeWidth={borderWidth}
            stroke={borderColor}
            style={{
                pointerEvents: 'none',
            }}
        />
    </g>
)
