import React from "react";
import { TimeSeries } from "pondjs";
import axios from "axios";
import _ from "underscore";
import {
    Resizable,
    Charts,
    ChartContainer,
    ChartRow,
    YAxis,
    LineChart,
    Legend,
    styler
} from "react-timeseries-charts";

class CrossHairs extends React.Component {
    render() {
        const { x, y } = this.props;
        const style = { pointerEvents: "none", stroke: "#ccc" };
        if (!_.isNull(x) && !_.isNull(y)) {
            return (
                <g>
                    <line style={style} x1={0} y1={y} x2={this.props.width} y2={y} />
                    <line style={style} x1={x} y1={0} x2={x} y2={this.props.height} />
                </g>
            );
        } else {
            return <g />;
        }
    }
}

class RelayerCharts extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            tracker: null,
            x: null,
            y: null,
            loading: false
        }
    }

    componentWillMount = () => {
        this.setState({ loading: true })
        try {
            axios({
                method: 'GET',
                url: `http://143.198.99.191:5555/stats?path=${this.props.path}`
            }).then(
                (response) => {
                    let data = [];
                    response.data.data.forEach((item, index) => {
                        data.push(
                            [
                                new Date(item.time), item.srcPacketsCount, item.dstPacketsCount
                            ]
                        )
                    })
                    this.setState({ data: data, loading: false });
                },
                (error) => {
                    console.log(error);
                    this.setState({ data: [], loading: false });
                }
            );
        } catch (error) {
            console.log(error);
            this.setState({ loading: false });
        }
    }

    handleTrackerChanged = tracker => {
        if (!tracker) {
            this.setState({ tracker, x: null, y: null });
        } else {
            this.setState({ tracker });
        }
    };

    handleMouseMove = (x, y) => {
        this.setState({ x, y });
    };

    render() {
        if (!this.state.data.length) {
            return (
                <div className="container-fluid">
                    <div className="row">
                        <h5 style={{ textAlign: "center" }}>{this.state.loading ? "Loading..." : "No data found"}</h5>
                    </div>
                </div>
            )
        }
        const series = new TimeSeries({
            name: this.props.path,
            columns: ["time", "src", "dst"],
            points: this.state.data
        });

        const range = series.range();
        let seriesSrcMin = series.min("src")
        let seriesDstMin = series.min("dst")
        let seriesSrcMax = series.max("src")
        let seriesDstMax = series.max("dst")
        let min = seriesSrcMin < seriesDstMin ? seriesSrcMin : seriesDstMin
        let max = seriesSrcMax > seriesDstMax ? seriesSrcMax : seriesDstMax

        const style = styler([
            { key: "src", color: "steelblue", width: 2 },
            { key: "dst", color: "#F68B24", width: 2 }
        ]);

        let srcValue, dstValue;
        if (this.state.tracker) {
            const index = series.bisect(this.state.tracker);
            const trackerEvent = series.at(index);
            srcValue = `${trackerEvent.get("src")}`;
            dstValue = `${trackerEvent.get("dst")}`;
        }

        return (
            <div className="container-fluid">
                <div className="row">
                    <div className="col-md-12">
                        <Resizable>
                            <ChartContainer
                                timeRange={range}
                                timeAxisStyle={{
                                    ticks: {
                                        stroke: "#AAA",
                                        opacity: 0.25,
                                        "stroke-dasharray": "1,1"
                                        // Note: this isn't in camel case because this is
                                        // passed into d3's style
                                    },
                                    values: {
                                        fill: "#AAA",
                                        "font-size": 14
                                    }
                                }}
                                showGrid={true}
                                paddingRight={100}
                                maxTime={series.range().end()}
                                minTime={series.range().begin()}
                                timeAxisHeight={65}
                                onTrackerChanged={this.handleTrackerChanged}
                                onBackgroundClick={() => this.setState({ selection: null })}
                                enablePanZoom={true}
                                onMouseMove={(x, y) => this.handleMouseMove(x, y)}
                                minDuration={1000 * 60 * 60 * 24 * 30}
                            >
                                <ChartRow height="400">
                                    <YAxis
                                        id="y"
                                        label="Packets Count"
                                        min={min}
                                        max={max}
                                        style={{
                                            ticks: {
                                                stroke: "#AAA",
                                                opacity: 0.25,
                                                "stroke-dasharray": "1,1"
                                                // Note: this isn't in camel case because this is
                                                // passed into d3's style
                                            }
                                        }}
                                        showGrid
                                        hideAxisLine
                                        width="60"
                                        type="linear"
                                    />
                                    <Charts>
                                        <LineChart
                                            axis="y"
                                            breakLine={false}
                                            series={series}
                                            columns={["src", "dst"]}
                                            style={style}
                                            interpolation="curveBasis"
                                            highlight={this.state.highlight}
                                            onHighlightChange={highlight =>
                                                this.setState({ highlight })
                                            }
                                            selection={this.state.selection}
                                            onSelectionChange={selection =>
                                                this.setState({ selection })
                                            }
                                        />
                                        <CrossHairs x={this.state.x} y={this.state.y} />
                                    </Charts>
                                </ChartRow>
                            </ChartContainer>
                        </Resizable>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-12">
                        <span>
                            <Legend
                                type="line"
                                align="right"
                                style={style}
                                highlight={this.state.highlight}
                                onHighlightChange={highlight => this.setState({ highlight })}
                                selection={this.state.selection}
                                onSelectionChange={selection => this.setState({ selection })}
                                categories={[
                                    { key: "src", label: "SRC", value: srcValue },
                                    { key: "dst", label: "DST", value: dstValue }
                                ]}
                            />
                        </span>
                    </div>
                </div>
            </div>
        );
    }
}

export default RelayerCharts;
