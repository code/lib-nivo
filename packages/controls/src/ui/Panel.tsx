import styled from 'styled-components'

export const Panel = styled.div`
    display: flex;
    flex-direction: column;
    border-radius: 2px;
    background-color: ${({ theme }) => theme.colors.panelBackground};
    color: ${({ theme }) => theme.colors.text};
    box-shadow: ${({ theme }) => theme.shadows.panel};
`
