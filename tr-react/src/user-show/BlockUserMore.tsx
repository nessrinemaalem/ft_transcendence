import React from 'react'
import * as echarts from 'echarts'

import './sass/main.sass'

interface BlockUserMoreState
{
    loadDataOnce: boolean
}

interface BlockUserMoreProps
{
    user: any
    userInfo: any
}

export default class BlockUserMore extends React.Component<BlockUserMoreProps, BlockUserMoreState>
{

    refMetric: any
    myChart: any

    constructor(props: any)
    {
        super(props)
        this.state = {
            loadDataOnce: false
        }

        this.refMetric = React.createRef()
    }

    componentDidMount(): void 
    {
        this.updateMetric()
        window.addEventListener('resize', () => this.handleWindowResize());
    }

    componentWillUnmount() {
        window.removeEventListener('resize', () => this.handleWindowResize());
    }

    handleWindowResize() 
    {
        // if (window.innerWidth <= 600) {
            
        // }

        this.destroyMetric();
        this.updateMetric();
    }

    destroyMetric() 
    {
        if (this.myChart) {
          this.myChart.dispose();
          this.myChart = null;
        }
    }
    
    updateMetric() 
    {
        if (this.refMetric.current
            && this.props.userInfo
            && !this.state.loadDataOnce) 
        {
            this.setState({
                ...this.state,
            }, () => {

                let dataTotal: any = [];
                let dataTotalWin: any = [];

                this.props.userInfo.week.forEach((item: any) => {
                    dataTotal.push(item.total);
                    dataTotalWin.push(item.total_win);
                });

                this.myChart = echarts.init(this.refMetric.current);
                this.myChart.setOption({
                    title: {
                        text: ''
                    },
                    tooltip: {},
                    xAxis: {
                        data: ['S', 'M', 'T', 'W', 'T', 'F', 'S']
                    },
                    yAxis: {},
                    series: [
                        {
                            name: 'games',
                            type: 'bar',
                            data: dataTotal,
                        },
                        {
                            data: dataTotalWin,
                            type: 'line',
                            smooth: true,
                            name: 'Win',
                        }
                    ]
                });
            })
        }
    }

    // -- RENDER

    render()
    {
        let avatar = 'https://pics.craiyon.com/2023-07-03/adca0f9f6d714bc29f9955629162bc0e.webp'
        if (this.props.user && this.props.user.avatar)
        {
            if (this.props.user.avatar.startsWith('https://'))
                avatar = this.props.user.avatar
            else
                avatar = '/' + this.props.user.avatar
        }
        
        return (
            <div className="block-user-more">
                <div className="block-info">
                    <div className="avatar">
                        <img src={avatar} />
                    </div>
                    <div className="info">
                        <div className="name">{ this.props.user ? this.props.user.username : 'Jane'  }</div>
                        <div className="email">{ this.props.user ? this.props.user.email : 'jane@game.com' }</div>
                    </div>
                </div>
                {/* <div className="block-tools">
                    <button>Delete</button>
                    <button>Edit</button>
                </div> */}
                <div className="block-stats">
                    <div className="indicators">
                        <div className="indicator indictor-win">
                            <div className="label">Total Win</div>
                            <div className="value">{ this.props.userInfo ?  this.props.userInfo.total.totalWin : 0 }</div>
                        </div>
                        <div className="indicator indictor-lost">
                            <div className="label">Total Lost</div>
                            <div className="value">{ this.props.userInfo ?  this.props.userInfo.total.totalLose : 0 }</div>
                        </div>
                    </div>
                    <div className="daily-play">
                        <div className="metric" ref={ this.refMetric }></div>
                    </div>
                </div>
            </div>
        )
    }

}