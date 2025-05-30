import { create } from 'react-test-renderer'
import { GridFillDirection } from '@nivo/grid'
import { WaffleHtml } from '../src'

describe('<WaffleHtml />', () => {
    it('should render a basic waffle chart in HTML', () => {
        const component = create(
            <WaffleHtml
                width={400}
                height={400}
                rows={10}
                columns={10}
                total={100}
                padding={0}
                data={[{ id: 'one', label: 'one', value: 10 }]}
            />
        )

        const tree = component.toJSON()
        expect(tree).toMatchSnapshot()
    })

    const fillModes: GridFillDirection[] = ['top', 'right', 'bottom', 'left']
    for (const fillMode of fillModes) {
        it(`should support ${fillMode} fill mode`, () => {
            const component = create(
                <WaffleHtml
                    width={400}
                    height={400}
                    rows={10}
                    columns={10}
                    total={100}
                    padding={0}
                    data={[{ id: 'one', label: 'one', value: 10 }]}
                    fillDirection={fillMode}
                />
            )

            const tree = component.toJSON()
            expect(tree).toMatchSnapshot()
        })
    }
})
