import React from 'react'

import './sass/main.sass'

interface ComponentState
{
    
}

interface ComponentProps
{

}

export default class Component extends React.Component<ComponentProps, ComponentState>
{
    constructor(props: any)
    {
        super(props)
    }

    render()
    {
        return (
            <div className="component">
                <h1>Component</h1>
            </div>
        )
    }

}