/*************************************************************
 * COPYRIGHT University of Hawaii - COMA Project / Lava Lab  *
 * Author: Mai Abe                                           *
 * Date: 11/30/2023                                          *
 *************************************************************/

import { HTMLFactory } from '../../htmlGeneration/htmlFactory.js';
export class ChartGenerator {

    #dataTable;
    #HF;

    constructor() {

        this.#HF = new HTMLFactory();
    };

    /** --- PUBLIC ---
     * There are a lot of options passed to the function from the HUB.
     * @param {{e: any[], x: any[]}, y: any[]} chartData Arrays of the data for the x axis, y axis, and error trace
     * @param {string} type chart type, ie 'bar'
     * @param {HTML div} pdiv the plot div is the location to inject the chart in the dom 
     * @param {Number} width width of the chart
     * @param {Number} height height of the chart
     * @param {string} framework echart makes all charts except table. plotly makes the table 
     * @param {string} theme echart color theme 
     * @param {string} xAxisLabel user defined label for the x axis 
     * @param {string} yAxisLabel user defined label for the y axis 
     * @param {boolean} xAxisGrid true if include grid
     * @param {boolean} yAxisGrid true if include grid
     * @param {boolean} xAxisTick true if include tick marks
     * @param {boolean} yAxisTick true if include tick marks
     * @param {string} coordinateSystem polar or cartesian2d
     * @returns chart object  */
    plotData = (chartData, type, pdiv, theme, coordinateSystem) => {
        return this.#drawChart(chartData, type, pdiv);
    }

    /** --- PRIVATE ---
     * Plots data in D3 with options
     * @param {{e: any[], x: any[]}, y: any[][]} chartData Arrays of the data for the x axis, y axis, and error trace
     * @param {string} type chart type, ie 'bar'
     * @param {HTML div} pdiv the plot div is the location to inject the chart in the dom 
     * @param {Number} width width of the chart
     * @param {Number} height height of the chart
     * @param {string} framework echart makes all charts
     * @param {string} theme echart color theme 
     * @param {string} xAxisLabel user defined label for the x axis 
     * @param {string} yAxisLabel user defined label for the y axis 
     * @param {boolean} xAxisGrid true if include grid
     * @param {boolean} yAxisGrid true if include grid
     * @param {boolean} xAxisTick true if include tick marks
     * @param {boolean} yAxisTick true if include tick marks
     * @param {string} coordinateSystem polar or cartesian2d
     * @returns echart object
     */
    #drawChart = (chartData, type, pdiv) => {

        const width = pdiv.clientWidth;
        const height = pdiv.clientHeight;

        // top margin space should depend on the length of x-axis label and chart title
        const margins = chartData.margins;
        console.log(margins);
        /*const margin = {
            top: Number(chartData.marginTop), left: Number(chartData.marginLeft),
            bottom: Number(chartData.marginBottom), right: Number(chartData.marginRight),
        };*/

        
        const svg = d3.select(pdiv)
            .append("svg")
            .attr("width", '100%')
            .attr("height", '100%')
            .attr("viewBox", `0 0 ${width} ${height}`)
            /*.attr("preserveAspectRatio", 'none')*/
            .style('background-color', 'white')
            .style('font-family', 'Sora, sans-serif');

        // Add Chart Title
        const titleWrapper = svg.append('g')
            .attr('class', 'title-group');

        titleWrapper.append('text')
            .attr('class', 'chart-title')
            .attr('text-anchor', 'middle')
            .attr('x', width / 2)
            .attr('y', 30)
            .text(chartData.chartTitle);

        // Add Chart Legend
        const legendWrapper = svg.append('g')
            .attr('class', 'legend-group');
        const seriesChartData = chartData['series'];
        this.#drawLegend(legendWrapper, seriesChartData, width, height, margins);

        /**************** x-axis ****************/
        const xChartData = chartData['xAxis'].filter(xa => xa.primary)[0];

        //-- Draw x-axis

        //-- Create x-axis scale
        const leftPos = xChartData.inverse ? (width - margins.right) : (margins.left);
        const rightPos = xChartData.inverse ? (margins.left) : (width - margins.right);

        const xScale = this.#getXScale(xChartData.dataType, xChartData.data, leftPos, rightPos);
        this.#drawXAxis(svg, xChartData, xScale, height, width, margins);


        /************* custom label (as additional x-axis) *************/
        const customChartData = chartData['xAxis'].filter(xa => !xa.primary);
        if ((customChartData.length > 0) && (chartData['series'].length > 0)) {
            customChartData.forEach((chartData, i) => {
                this.#drawCustomLabel(xScale, svg, chartData, height, width, margins);
            });
        }

        /**************** y-axis ****************/
        chartData['yAxis'].forEach((yChartData, yAxisIndex) => {
            const yScale = this.#drawYAxis(svg, yChartData, yAxisIndex, height, width, margins);
            yChartData['yScale'] = yScale;

            // draw yaxis major gridline
            const ymajor = yChartData.majorGridLines;
            const yminor = yChartData.minorGridLines;
            if (ymajor || yminor) {
                const axisName = yChartData.axisName;
                const axisPos = yChartData.axisPosition;
                this.#drawGridlines('yaxis', ymajor, yminor, axisName, axisPos, yScale, svg);
            }

            this.#drawYDataZoom(pdiv, svg, chartData, yAxisIndex, yScale, xScale);
        });

        //-- draw xaxis major gridlines (draw here since it needs to be drawn after the y axis is rendered)
        const xmajor = xChartData.majorGridLines;
        const xminor = xChartData.minorGridLines;
        if (xmajor || xminor) {
            const axisName = xChartData.axisName;
            const axisPos = xChartData.axisPosition;
            this.#drawGridlines('xaxis', xmajor, xminor, axisName, axisPos, xScale, svg);
        }

        /**************** series ****************/
        chartData['series'].forEach(series => {
            /*console.log(series);*/

            // Get corresponding yAxis data for this series
            const yAxis = chartData['yAxis'][series.yAxisIndex];
            const yScale = yAxis.yScale;

            const seriesGroupWrapper = svg.append("g")
                                          .attr("class", "series-group-" + series.seriesName);

            // Draw scatter plot points
            /*seriesGroupWrapper.selectAll(".scatter-" + series.seriesName)
                .data(series.data)
                .join("circle")
                .attr("class", "scatter-series scatter-" + series.seriesName)
                .attr("cx", d => xScale(d.x))
                .attr("cy", d => yScale(d.y))
                .attr("r", series.symbolSize) // Adjust the radius as needed
                .attr("fill", series.symbolColor)
                .attr('opacity', 0.5);*/
            this.#drawSeries(seriesGroupWrapper, series, 'scatter', xScale, yScale);

            // Draw error bars
            if (series.errorName !== 'none') {
                this.#drawErrorBars(xScale, yScale, seriesGroupWrapper, series);
            }
        });


        /**************** Data zoom ****************/
        const xAxisSlider = this.#drawXDataZoom(pdiv, svg, chartData, xScale);

    };


    #getXScale(dataType, xAxisData, leftPos, rightPos) {
        switch (dataType) {
            case 'category':
                return d3.scaleBand()
                         .domain(xAxisData)
                         .range([leftPos, rightPos]);
                break;
            case 'time':
                return d3.scaleTime()
                         .domain([d3.min(xAxisData, d => new Date(d)), d3.max(xAxisData, d => new Date(d))])
                         .range([leftPos, rightPos]);
                break;
            default:
                return d3.scaleLinear()
                         .domain([d3.min(xAxisData), d3.max(xAxisData)])
                         .range([leftPos, rightPos]);
        }
    }

    //-- draw primary x axis and returns xScale
    #drawXAxis(svg, xChartData, xScale, height, width, margins) {

        //-- Create x-axis wrapper group
        const wrapper = svg.append("g")
                            .attr('id', 'xaxis-' + xChartData.axisName)
                            .attr("class", "xaxis-group");

        //-- Axis & Tick Positions
        const offset = Number(xChartData.offset);
        const yPos = (xChartData.axisPosition == 'bottom') ? height - margins.bottom + offset : margins.top + offset;
        const tickPos = xChartData.tickPosition;
        let tickSize = (tickPos == 'inside') ? -6 : 6;
        if (!xChartData.ticks) {
            tickSize = 0;
        }

        //-- Create x-axis
        const xAxis = (xChartData.axisPosition == 'bottom') ? d3.axisBottom(xScale) : d3.axisTop(xScale);
        xAxis.tickSize(tickSize);

        const xAxisElement = wrapper.append("g")
            .attr('class', 'xaxis')
            .attr("transform", `translate(0, ${yPos})`)
            .call(xAxis)
            .selectAll('.tick text')
            .attr('dy', function () {
                if (xChartData.axisPosition == 'bottom') {
                    return (tickPos == 'inside') ? '-1.25em' : '1em';
                }
                return (tickPos == 'inside') ? '2em' : '0';
            });

        //-- Create x-axis label
        const axisBBox = xAxisElement.node().getBBox();
        const axisHeight = axisBBox.height;

        const label = wrapper.append('text')
                             .attr('class', 'x-axis-label')
                             .attr('text-anchor', 'middle')
                             .style('font-size', '12px')
                             .attr('x', (width / 2))
                             .text(xChartData.labelName);

        // Adjust label y position
        const labelHeight = label.node().getBBox().height;

        if (xChartData.axisPosition == 'bottom') {
            if (tickPos == 'outside') {
                label.attr('y', yPos + axisHeight + labelHeight + 6); // 6 for some spacing 
            }
            else {
                label.attr('y', yPos - axisHeight - labelHeight);
            }
        } else {
            if (tickPos == 'outside') {
                label.attr('y', yPos - axisHeight - labelHeight);
            }
            else {
                label.attr('y', yPos + axisHeight + labelHeight + 6);
            }
        }

        return wrapper;
    }

    //-- draw custom label as additional x-axis
    #drawCustomLabel(xScale, svg, customChartData, height, width, margins) {
        console.log(customChartData);

        const data = customChartData.data;
        const axisPos = customChartData.axisPosition;
        const offset = customChartData.offset;
        const yPos = (axisPos == 'top') ? margins.top + offset : height - margins.bottom + offset;

        const tickPos = customChartData.tickPosition; // inside or outside
        const tickInterval = Math.ceil(data.length / (width / 200)); // every 200 pixels

        //-- Custom group wrapper
        const wrapper = svg.append('g')
                           .attr('class', 'custom-label-group');

        // Add custom x-axis labels
        const customLabels = wrapper.selectAll(".custom-label")
            .data(data.filter((d, i) => i % tickInterval === 0))
            .enter().append("text")
            .attr("class", "custom-label")
            .attr("text-anchor", "middle")
            .style("font-size", "11px")
            .text(function (d, i) {
                return data[Math.floor(i * tickInterval)].label;
            });

        //-- Adjust position & rotation and create tick marks
        customLabels.each(function (customLabel) {

            // Adjust label positions
            const textElement = d3.select(this);
            const xPos = xScale(customLabel.x);
            const textWidth = this.getBBox().width;
            const textHeight = this.getBBox().height;

            // Define spacing between label and tick
            let labelSpacing = 9;
            /*if (axisPos == 'bottom') {
                labelSpacing = (tickPos == 'inside') ? 9 : 3;
            }*/
            const adjustedXPos = xPos + (textHeight / 3);
            const adjustedYPos = (axisPos == 'top') ? ((tickPos == 'outside') ? (yPos - (textWidth / 2) - labelSpacing) : (yPos + (textWidth / 2) + labelSpacing))
                                                    : ((tickPos == 'outside') ? (yPos + (textWidth / 2) + labelSpacing) : (yPos - (textWidth / 2) - labelSpacing));
            textElement.attr('transform', `translate(${adjustedXPos}, ${adjustedYPos}) rotate(-90)`);

            // Add custom ticks
            if (customChartData.ticks) {
                const tickSize = 6;
                const tickY1 = yPos;
                let tickY2 = (tickPos == 'inside') ? yPos + tickSize : yPos - tickSize;
                if (axisPos == 'bottom') {
                    tickY2 = (tickPos == 'inside') ? yPos - tickSize : yPos + tickSize;
                }

                // Append tick line
                wrapper.append("line")
                    .attr("class", "custom-tick-line")
                    .attr("x1", xPos)
                    .attr("y1", tickY1)
                    .attr("x2", xPos)
                    .attr("y2", tickY2)
                    .style("stroke", "black")
                    .style("stroke-width", "0.5px"); //-- TODO: rotate custom labels opposite way
            }

        });

        //-- Add a line to represent the x-axis
        const axisLine = wrapper.append("line")
            .attr("class", "custom-axis-line")
            .style("stroke", "black")
            .style("stroke-width", "0.5px");

        // Position the axis line based on the axis position
        axisLine.attr('x1', margins.left)
            .attr('y1', yPos)
            .attr('x2', width - margins.right)
            .attr('y2', yPos);
    }

    //-- draw each y axis
    #drawYAxis(svg, yChartData, yAxisIndex, height, width, margins) {

        console.log(yChartData);

        //-- Create y-axis scale
        const yScale = d3.scaleLinear()
            .domain([d3.min(yChartData.data), d3.max(yChartData.data)])
            .range(yChartData.inverse ? [margins.top, height - margins.bottom] : [height - margins.bottom, margins.top]);

        const wrapper = svg.append("g")
            .attr("id", "yaxis-group-" + yAxisIndex)
            .attr("class", "yaxis-group");

        const axisPos = yChartData.axisPosition;
        const offset = yChartData.offset;
        const xPos = (axisPos == 'left') ? margins.left + offset : width - margins.right + offset;
        const tickPos = yChartData.tickPosition;
        let tickSize = (tickPos == 'inside') ? -6 : 6;
        // tick option
        if (!yChartData.ticks) {
            tickSize = 0;
        }

        //-- Create y-axis element
        const yAxis = (axisPos == 'left') ? d3.axisLeft(yScale) : d3.axisRight(yScale);
        yAxis.tickSize(tickSize);

        const axisElement = wrapper.append("g")
            .attr('class', 'yaxis')
            .attr("transform", `translate(${xPos}, 0)`)
            .call(yAxis);

        //-- Position tick labels inside or outside
        axisElement.selectAll('.tick text')
            .attr('dx', function () {
                if (axisPos == 'left') {
                    return (tickPos == 'inside') ? '2em' : '0'; 
                }
                return (tickPos == 'inside') ? '-2.25em' : '0';
            });

        //-- Create y-axis label
        const labelElement = wrapper.append("text")
            .attr("class", "y-axis-label")
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            /*.attr("transform", labelTransform)*/
            .text(yChartData.labelName);

        // Transform label position
        const axisHeight = axisElement.node().getBBox().height;
        const axisWidth = axisElement.node().getBBox().width;
        const labelHeight = labelElement.node().getBBox().height;

        // This finds the x position of the label depending on axisPosition and tickPosition
        const labelX = (axisPos == 'left') ? ((tickPos == 'outside') ? ((margins.left / 2) + offset) : (margins.left + axisWidth + offset + labelHeight))
                                           : ((tickPos == 'outside') ? (width - (margins.right / 2) - offset) : (width - margins.right - axisWidth - offset - labelHeight));
        const labelY = (axisHeight / 2) + margins.top; // This centers the label across the length of the axis

        const rotateAngle = (axisPos == 'left') ?  ((tickPos == 'outside') ? -90 : 90) : ((tickPos == 'outside') ? 90 : -90);
        const labelTransform = `translate(${labelX}, ${labelY}) rotate(${rotateAngle})`;

        labelElement.attr("transform", labelTransform);

        return yScale;
    }

    /** Draws major gridlines
     *  @param {string} axisType of an axistype (xaxis, yaxis, or custom label axis)
     *  @param {boolean} major gridline option to draw
     *  @param {boolean} minor gridline option to draw
     *  @param {string} axisName name of the axis (mag, mjd, etc)
     *  @param {string} axisPos position of the axis (top, bottom, left, right)
     *  @param {object} scale of the axis (xScale, yScale)
     *  @param {object} svg element of the chart
     * */
    #drawGridlines(axisType, major, minor, axisName, axisPos, scale, svg) {
        if (axisType == 'xaxis') {
            const wrapper = svg.select('#xaxis-' + axisName);

            // get x-axis y1 position
            const xAxisElement = svg.select('.xaxis-group .xaxis');
            let yPos;
            const transformVal = xAxisElement.attr('transform');
            const translateRegex = /translate\(([^)]+)\)/;
            let translate = translateRegex.exec(transformVal);
            if (translate) {
                const [x, y] = translate[1].split(',').map(Number);
                yPos = y;
            }

            // get y-axis length
            const yAxisElement = svg.select('.yaxis-group .yaxis');
            const yAxisHeight = yAxisElement.node().getBBox().height;

            // find all tick's x positions
            let tickVals = scale.ticks();

            // add grid lines
            if (major) {
                let tickPositions = tickVals.map(val => scale(val));
                tickPositions.forEach(xPos => {
                    wrapper.append('line')
                        .attr('class', 'major-gridline')
                        .attr('x1', xPos)
                        .attr('y1', yPos)
                        .attr('x2', xPos)
                        .attr('y2', (axisPos == 'bottom') ? yPos - yAxisHeight : yPos + yAxisHeight)
                        .attr('stroke', 'lightgray')
                        .attr('stroke-width', 1);
                });
            }
            if (minor) {
                let xAxisBBox = xAxisElement.node().getBBox();
                let xAxisXPos = xAxisBBox.x;
                let xAxisWidth = xAxisBBox.width;
                let tickPositions = tickVals.map(val => scale(val));
                let intervalSpacing = scale(tickVals[1]) - scale(tickVals[0]);
                let numLines = 5; // Number of lines in between major gridlines
                let minorSpace = intervalSpacing / numLines;

                tickPositions.forEach((xPos, xPosIndex)=> {
                    let currentXPos = xPos;
                    for (let i = 0; i < numLines; i++) {
                        currentXPos = currentXPos - minorSpace;
                        if (currentXPos > xAxisXPos) { // only draw within the width of the axis
                            wrapper.append('line')
                                .attr('class', 'minor-gridline')
                                .attr('x1', currentXPos)
                                .attr('y1', yPos)
                                .attr('x2', currentXPos)
                                .attr('y2', (axisPos == 'bottom') ? yPos - yAxisHeight : yPos + yAxisHeight)
                                .attr('stroke', 'lightgray')
                                .attr('stroke-width', 0.5);
                        }
                    }

                    // for the last major tick position, add minor lines on te right side in adition to the left side
                    if (xPosIndex == tickPositions.length - 1) {
                        currentXPos = xPos;
                        for (let i = 0; i < numLines; i++) {
                            // exit the loop once the currentXPos is outside of the xAxis width
                            if (currentXPos > (xAxisXPos + xAxisWidth)) {
                                break;
                            }
                            wrapper.append('line')
                                .attr('class', 'minor-gridline')
                                .attr('x1', currentXPos)
                                .attr('y1', yPos)
                                .attr('x2', currentXPos)
                                .attr('y2', (axisPos == 'bottom') ? yPos - yAxisHeight : yPos + yAxisHeight)
                                .attr('stroke', 'lightgray')
                                .attr('stroke-width', 0.5);
                            currentXPos = currentXPos + minorSpace;
                        }
                    }

                });
            }
        }
        else if (axisType == 'yaxis') {
            const wrapper = svg.select('#yaxis-' + axisName);

            // get yaxis x1 position
            const yAxisElement = svg.select('.yaxis-group .yaxis');
            let xPos;
            const transformVal = yAxisElement.attr('transform');
            const translateRegex = /translate\(([^)]+)\)/;
            let translate = translateRegex.exec(transformVal);
            if (translate) {
                const [x, y] = translate[1].split(',').map(Number);
                xPos = x;
            }

            // get xaxis length
            const xAxisElement = svg.select('.xaxis-group .xaxis');
            const xAxisWidth = xAxisElement.node().getBBox().width;

            // find all tick's y positions
            let tickVals = scale.ticks();

            // add grid lines
            if (major) {
                let tickPositions = tickVals.map(val => scale(val));
                tickPositions.forEach(yPos => {
                    wrapper.append('line')
                        .attr('class', 'major-gridline')
                        .attr('x1', xPos)
                        .attr('y1', yPos)
                        .attr('x2', (axisPos == 'left') ? xPos + xAxisWidth : xPos - xAxisWidth)
                        .attr('y2', yPos)
                        .attr('stroke', 'lightgray')
                        .attr('stroke-width', 1);
                });
            }
            if (minor) {
                let yAxisYPos = yAxisElement.node().getBBox().y;
                let tickPositions = tickVals.map(val => scale(val));
                let intervalSpacing = scale(tickVals[1]) - scale(tickVals[0]);
                let numLines = 6; // including major gridline
                let minorSpace = intervalSpacing / numLines;

                tickPositions.forEach(yPos => {
                    let currentYPos = yPos;
                    for (let i = 0; i < numLines; i++) {
                        currentYPos = currentYPos - minorSpace;
                        if (currentYPos > yAxisYPos) { // only draw within the height of the axis
                            wrapper.append('line')
                                .attr('class', 'minor-gridline')
                                .attr('x1', xPos)
                                .attr('y1', currentYPos)
                                .attr('x2', (axisPos == 'left' ? xPos + xAxisWidth : xPos - xAxisWidth))
                                .attr('y2', currentYPos)
                                .attr('stroke', 'lightgray')
                                .attr('stroke-width', 0.5);
                        }

                    }
                });
            }
        }
        else { // custom label axis?
            
        }
    }

    #drawSeries(wrapper, series, type, xScale, yScale) {
        const symbolSize = Number(series.symbolSize) * 10;
        switch (type) {
            case 'scatter':
                const seriesElements = wrapper.selectAll(".scatter-" + series.seriesName)
                    .data(series.data)
                    .join("path")
                    .attr("class", "scatter-series scatter-" + series.seriesName)
                    .attr("d", d => this.#symbolPath(series.symbolShape, symbolSize))
                    .attr("transform", d => `translate(${xScale(d.x)}, ${yScale(d.y)})`)
                    .attr("fill", series.symbolColor)
                    .attr('opacity', 1)
                    .attr('stroke', 'white')
                    .attr('stroke-width', 0.5);

                if (series.symbolShape == 'hollow') {
                    seriesElements.attr('fill', 'none')
                        .attr('stroke', series.symbolColor)
                        .attr('stroke-width', 1);
                }
        }
    }

    #symbolPath(symbolShape, size) {
        const symbols = {
            circle: d3.symbol().type(d3.symbolCircle).size(size),
            hollow: d3.symbol().type(d3.symbolCircle).size(size),
            square: d3.symbol().type(d3.symbolSquare).size(size),
            triangle: d3.symbol().type(d3.symbolTriangle).size(size),
            diamond: d3.symbol().type(d3.symbolDiamond).size(size),
            cross: d3.symbol().type(d3.symbolCross).size(size),
            star: d3.symbol().type(d3.symbolStar).size(size),
            wye: d3.symbol().type(d3.symbolWye).size(size),
        };
        return d3.create("svg").append("path").attr("d", symbols[symbolShape]()).node().getAttribute("d");
    }

    //-- draw error bars for a series
    #drawErrorBars(xScale, yScale, wrapper, series) {

        // Draw vertical lines from top to bottom
        wrapper.selectAll(".error-bar-" + series.seriesName)
            .data(series.data)
            .join("line")
            .attr("class", "error-bar error-bar-" + series.seriesName)
            .attr("x1", d => xScale(d.x))
            .attr("y1", d => yScale(d.y - d.error))
            .attr("x2", d => xScale(d.x))
            .attr("y2", d => yScale(d.y + d.error))
            .attr("stroke", "rgba(5, 117, 255, 1)") // Set the color of the error bars
            .attr("stroke-width", 0.8); // Set the width of the error bars

        const tickLength = 5;

        // Append horizontal lines at the top of the error bars
        wrapper.selectAll(".error-bar-top-tick-" + series.seriesName)
            .data(series.data)
            .join("line")
            .attr("class", "error-bar-tick error-bar-top-tick-" + series.seriesName)
            .attr("x1", d => xScale(d.x) - tickLength / 2)
            .attr("y1", d => yScale(d.y + d.error))
            .attr("x2", d => xScale(d.x) + tickLength / 2)
            .attr("y2", d => yScale(d.y + d.error))
            .attr("stroke", "rgba(5, 117, 255, 1)")
            .attr("stroke-width", 0.8);

        // Append horizontal lines at the bottom of the error bars
        wrapper.selectAll(".error-bar-bottom-tick-" + series.seriesName)
            .data(series.data)
            .join("line")
            .attr("class", "error-bar-tick error-bar-bottom-tick-" + series.seriesName)
            .attr("x1", d => xScale(d.x) - tickLength / 2)
            .attr("y1", d => yScale(d.y - d.error))
            .attr("x2", d => xScale(d.x) + tickLength / 2)
            .attr("y2", d => yScale(d.y - d.error))
            .attr("stroke", "rgba(5, 117, 255, 1)")
            .attr("stroke-width",0.8);
    }

    #drawLegend(wrapper, seriesChartData, width, height, margins) {

        const radius = 5; // Radius of the circle
        const gap = 5; // Gap between the symbol and the label
        const spacing = 10; // Spacing between other series legends
        let legendWidths = [];
        
        //-- Calculate total legend width
        seriesChartData.forEach((series, index) => {
            let textElement = wrapper.append('text')
                .attr('class', 'legend-label' + series.seriesName)
                .attr("text-anchor", "start")
                .style("font-size", "12px")
                .text(series.seriesName)
                .attr("opacity", 0);  // temporarily hidwe the text

            let bbox = textElement.node().getBBox();
            let textWidth = bbox.width;

            legendWidths[index] = radius * 2 + gap + textWidth + spacing;

            textElement.remove(); // Remove the temporary text element
        });

        const totalLegendWidth = legendWidths.reduce((a, b) => a + b, 0);
        let currentX = (width / 2) - (totalLegendWidth / 2); // Starting X position


        seriesChartData.forEach((series, index) => {

            //-- Add series symbol
            wrapper.append('path')
                .attr('class', 'legend-' + series.seriesName)
                .attr('d', d => this.#symbolPath(series.symbolShape, 50)) // Generates the path data for the shape
                .attr('transform', `translate(${currentX}, ${50 + radius})`) // Positions the shape
                .attr('fill', series.symbolColor)
                .attr('opacity', 1);

            //-- Add series label
            wrapper.append("text")
                .attr("class", "legend-label-" + series.seriesName)
                .attr("text-anchor", "start")
                .style("font-size", "12px")
                .attr('x', currentX + radius + gap)
                .attr('y', (50) + radius + 4)
                .text(series.seriesName);

            currentX += legendWidths[index];
        });
    }


    #drawXDataZoom(plotdiv, svg, chartData, xScale) {
        const xChartData = chartData['xAxis'].filter(xAxis => xAxis.primary)[0];
        const domain = xScale.domain();
        const axisName = xChartData.axisName;
        const min = domain[0];
        const max = domain[1];

        // Set the width of the minmaxSlider the same as the axisWidth
        const xAxisElement = svg.select('.xaxis-group .xaxis');
        const xAxisBBox = xAxisElement.node().getBBox();
        const xAxisWidth = xAxisBBox.width;
        const xAxisLeft = xAxisBBox.x;

        const datazoomWrapper = this.#HF.createNewDiv('', '', ['xaxis-datazoom-wrapper', 'datazoom-wrapper'], 
            [{ style: 'width', value: `${xAxisWidth}px` }, { style: 'left', value: `${xAxisLeft}px` }], [], '');
        const datazoomSlider = this.#HF.createNewMinMaxSlider(`xaxis-datazoom-${axisName}`, '', ['xaxis-datazoom-slider', 'datazoom-slider'], [], '', min, max, min, max, 1, 10);
        datazoomWrapper.appendChild(datazoomSlider);
        plotdiv.appendChild(datazoomWrapper);

        const minInput = datazoomSlider.querySelector('.minmax-range-wrapper .min-range-input');
        const maxInput = datazoomSlider.querySelector('.minmax-range-wrapper .max-range-input');

        // Flip the positions of min and max input if xChartData.inverse
        if (xChartData.inverse) {
            minInput.style.transform = 'scaleX(-1)';
            maxInput.style.transform = 'scaleX(-1)';
        }

        // Set event listeners to the minmaxSlider
        minInput.addEventListener('input', () => {
            const minVal = Number(minInput.value);
            const maxVal = Number(maxInput.value);

            const newXScale = xScale.domain([minVal, maxVal]);

            // update xAxis using the new scale
            this.#updateXAxis(svg, chartData, newXScale);

        });
        maxInput.addEventListener('input', () => {
            const minVal = Number(minInput.value);
            const maxVal = Number(maxInput.value);

            const newXScale = xScale.domain([minVal, maxVal]);

            // update xAxis using the new scale
            this.#updateXAxis(svg, chartData, newXScale);

        });

        return datazoomWrapper;
    }


    #drawYDataZoom(plotdiv, svg, chartData, axisIndex, yScale, xScale) {
        const yChartData = chartData['yAxis'][axisIndex];
        console.log(yChartData);

        const domain = yScale.domain();
        const axisName = yChartData.axisName;
        const min = domain[0];
        const max = domain[1];

        // Compute appropriate step & gap for the slider

        const datazoomWrapper = this.#HF.createNewDiv(`yaxis-datazoom-${axisIndex}`, '', ['yaxis-datazoom-wrapper', 'datazoom-wrapper', `axispos-${yChartData.axisPosition}`, `tickpos-${yChartData.tickPosition}`], [], [], '');
        const datazoomSlider = this.#HF.createNewMinMaxSlider(`yaxis-datazoom-${axisName}`, '', ['yaxis-datazoom-slider', 'datazoom-slider'], [], '', min, max, min, max, 0.1, 1);
        datazoomWrapper.appendChild(datazoomSlider);
        plotdiv.appendChild(datazoomWrapper);

        const yAxisGroups = svg.selectAll('.yaxis-group').nodes();
        const yAxisGroup = yAxisGroups.filter(yAxisGroup => yAxisGroup.getAttribute('id') === `yaxis-group-${axisIndex}`)[0];

        console.log(yAxisGroups);
        console.log(yAxisGroup);

        const yAxisBBox = yAxisGroup.getBBox();
        const yAxisHeight = yAxisBBox.height; // Named 'width' because the yaxis-datazoom is rotated 90deg and the height of the yAxis becomes the width of the datazoom
        const yAxisWidth = yAxisBBox.width; // Named 'height' because the yaxis-datazoom is rotated 90deg and the width of the yAxis becomes the height of the datazoom
        const yAxisLeft = yAxisBBox.x; // Named 'right' because the yaxis-datazoom is rotated 90deg / -90deg and the top x position of the yAxis becomes the right position of the datazoom
        const yAxisTop = yAxisBBox.y; // Named 'right' because the yaxis-datazoom is rotated 90deg / -90deg and the top x position of the yAxis becomes the right position of the datazoom

        console.log(yAxisHeight);
        console.log(yAxisWidth);

        datazoomWrapper.style.width = `${yAxisHeight}px`;


        /*const datazoomXPos = yAxisBBox.x - datazoomWrapper.clientHeight;*/
        if (yChartData.axisPosition == 'left') {
            const datazoomHeight = datazoomWrapper.clientHeight;
            let translateX = yAxisLeft - datazoomHeight;
            let translateY = plotdiv.clientHeight - yAxisHeight - yAxisTop + 6;

            /*if (yChartData.tickPosition == 'inside') { // if datazoom has an inside tick position, place the datazoom element next to the axis label next to the other datazoom element
                const firstDz = plotdiv.querySelector('#yaxis-0.datazoom-wrapper');
                const firstDzRect = firstDz.getBoundingClientRect();
                const firstDzPos = firstDzRect.left - plotdiv.getBoundingClientRect().left - datazoomHeight;

                firstDz.style.transform = `translate(${firstDzPos}px, -${translateY}px) rotate(-90deg)`;
                translateX = firstDzPos + datazoomHeight;
            }*/

            if (yChartData.tickPosition == 'inside') {
                // get position from the current yaxis position
                translateX = yAxisLeft - yAxisWidth - datazoomHeight;
            }
            datazoomWrapper.style.transform = `translate(${translateX}px, -${translateY}px) rotate(-90deg)`;
            datazoomWrapper.style.transformOrigin = `0px 0px`;

        }
        else {
            const datazoomHeight = datazoomWrapper.clientHeight;
            let translateX = yAxisLeft + yAxisWidth + datazoomHeight;
            let translateY = plotdiv.clientHeight - yAxisTop + 6; // 6 for the tick size

            /*if (yChartData.tickPosition == 'inside') { // if datazoom has an inside tick position, place the datazoom element next to the axis label next to the other datazoom element
                const firstDz= plotdiv.querySelector('#yaxis-1.datazoom-wrapper');
                const firstDzRect = firstDz.getBoundingClientRect();
                const firstDzPos = firstDzRect.left - plotdiv.getBoundingClientRect().left + (datazoomHeight * 2);

                firstDz.style.transform = `translate(${firstDzPos}px, -${translateY}px) rotate(90deg)`;
                translateX = firstDzPos - datazoomHeight;
            }*/
            if (yChartData.tickPosition == 'inside') { // if datazoom has an inside tick position, place the datazoom element next to the axis label next to the other datazoom element
                translateX = yAxisLeft + yAxisWidth + yAxisWidth + datazoomHeight;
            }

            datazoomWrapper.style.transform = `translate(${translateX}px, -${translateY}px) rotate(90deg)`;
            datazoomWrapper.style.transformOrigin = `0px 0px`;
        }


        // Set the height of the minMaxSlider the same as the axisHeight
        const minInput = datazoomSlider.querySelector('.minmax-range-wrapper .min-range-input');
        const maxInput = datazoomSlider.querySelector('.minmax-range-wrapper .max-range-input');

        // Flip the positions of min and max input if yChartData.inverse
        if ((yChartData.inverse && (yChartData.axisPosition === 'left')) ||
            (!yChartData.inverse && (yChartData.axisPosition === 'right'))) {
            minInput.style.transform = 'scaleX(-1)';
            maxInput.style.transform = 'scaleX(-1)';
        }


        // Set event listeners to the minmaxSlider
        minInput.addEventListener('input', () => {
            const minVal = Number(minInput.value);
            const maxVal = Number(maxInput.value);

            const newYScale = yScale.domain([minVal, maxVal]);

            // update xAxis using the new scale
            this.#updateYAxis(svg, axisIndex, chartData, newYScale, xScale);

        });
        maxInput.addEventListener('input', () => {
            const minVal = Number(minInput.value);
            const maxVal = Number(maxInput.value);

            const newYScale = yScale.domain([minVal, maxVal]);

            // update xAxis using the new scale
            this.#updateYAxis(svg, axisIndex, chartData, newYScale, xScale);

        });


        return datazoomWrapper;
    }


    #updateXAxis(svg, chartData, newXScale) {
        const xChartData = chartData['xAxis'].filter(xAxis => xAxis.primary)[0]; // Get primary xAxis
        const xAxisGroup = svg.select('.xaxis-group');
        const xAxisElement = xAxisGroup.select('.xaxis');
        const xAxis = (xChartData.axisPosition == 'bottom') ? d3.axisBottom(newXScale) : d3.axisTop(newXScale);
        xAxisElement.call(xAxis);

        //--------- Update chart elements with selected options ---------

        // Get yAxisElement dimensions and positions
        const yAxisElement = svg.select('.yaxis-group .yaxis');
        const yAxisBBox = yAxisElement.node().getBBox();
        const yAxisTop = yAxisBBox.y;
        const yAxisHeight = yAxisBBox.height;

        // Get yAxisElement dimensions and positions
        const xAxisBBox = xAxisElement.node().getBBox();
        const xAxisLeft = xAxisBBox.x;
        const xAxisRight = xAxisLeft + xAxisBBox.width;


        // Transform ticks
        let tickSize = (xChartData.tickPosition == 'inside') ? -6 : 6;
        if (!xChartData.ticks) {
            console.log(xChartData.ticks);
            tickSize = 0;
        }
        xAxis.tickSize(tickSize);


        // Adjust tick label positions
        xAxisElement.selectAll('.tick text')
            .attr('dy', function () {
                if (xChartData.axisPosition == 'bottom') {
                    return (xChartData.tickPosition == 'inside') ? '-1.25em' : '1em';
                }
                return (xChartData.tickPosition == 'inside') ? '2em' : '0';
            });

        // Transform major gridlines
        if (xChartData.majorGridLines) {
            const tickVals = newXScale.ticks();
            const tickPositions = tickVals.map(val => newXScale(val));
            const majorGridlines = xAxisGroup.selectAll('.major-gridline').data(tickPositions);
            majorGridlines.attr('x1', d => d).attr('x2', d => d);

            // Get y1 position of gridlines
            let yPos;
            const transformVal = xAxisElement.attr('transform');
            const translateRegex = /translate\(([^)]+)\)/;
            let translate = translateRegex.exec(transformVal);
            if (translate) {
                const [x, y] = translate[1].split(',').map(Number);
                yPos = y;
            }

            majorGridlines.enter().append('line')
                .attr('class', 'major-gridline')
                .attr('y1', yPos)
                .attr('y2', (xChartData.axisPosition == 'bottom') ? yPos - yAxisHeight : yPos + yAxisHeight)
                .attr('stroke', 'lightgray')
                .attr('stroke-width', 1);

            majorGridlines.exit().remove();
        }
        
        // Transform minor gridlines
        if (xChartData.minorGridLines) {
            const tickVals = newXScale.ticks();
            const intervalSpacing = newXScale(tickVals[1]) - newXScale(tickVals[0]);
            const numLines = 5; // Number of lines in between major gridlines
            const minorSpace = intervalSpacing / numLines;

            // Construct an array of all the minor gridline positions
            let tickPositions = [];
            for (let i = 0; i < tickVals.length; i++) {
                let currentPos = newXScale(tickVals[i]);
                for (let j = 0; j < numLines; j++) {
                    if (currentPos < xAxisLeft || currentPos > xAxisRight) { // if the position is within the width of the chart
                        // Exit the loop once the position goes outside of the chart
                        break;
                    }
                    tickPositions.push(currentPos);
                    currentPos = currentPos - minorSpace;
                };

                if (i == tickVals.length - 1) {
                    currentPos = newXScale(tickVals[i]);
                    for (let j = 0; j < numLines; j++) {
                        currentPos = currentPos + minorSpace;
                        if (currentPos < xAxisLeft || currentPos > xAxisRight) { // if the position is within the width of the chart
                            // Exit the loop once the position goes outside of the chart
                            break;
                        }
                        tickPositions.push(currentPos);
                    }
                }
            };

            // Get y1 position of gridlines
            let yPos;
            const transformVal = xAxisElement.attr('transform');
            const translateRegex = /translate\(([^)]+)\)/;
            let translate = translateRegex.exec(transformVal);
            if (translate) {
                const [x, y] = translate[1].split(',').map(Number);
                yPos = y;
            }

            // translate minor gridlines based on newXScale
            const minorGridLines = xAxisGroup.selectAll('.minor-gridline').data(tickPositions);
            minorGridLines.attr('x1', d => d).attr('x2', d => d);

            minorGridLines.enter().append('line')
                .attr('class', 'minor-gridline')
                .attr('x1', d => d)
                .attr('x2', d => d)
                .attr('y1', yPos)
                .attr('y2', (xChartData.axisPosition == 'bottom') ? yPos - yAxisHeight : yPos + yAxisHeight)
                .attr('stroke', 'lightgray')
                .attr('stroke-width', 0.5);

            minorGridLines.exit().remove();
        }


        // Transform series data points
        chartData['series'].forEach(series => {
            const yAxis = chartData['yAxis'][series.yAxisIndex];
            const yScale = yAxis.yScale;

            // filter out data according to the new scale domain
            const domain = newXScale.domain();
            const minVal = domain[0];
            const maxVal = domain[1];
            
            const seriesData = series.data.filter(d => {
                // return false if yScale(d.y) position lies outside of the chart
                const yPos = yScale(d.y);
                if (yPos < yAxisTop || yPos > (yAxisTop + yAxisHeight)) {
                    return false;
                }

                const xValue = d.x;
                // Check if xValue is within the scale's domain
                return xValue >= minVal && xValue <= maxVal;
            });


            // transfrom data points according to the new scale
            const seriesGroup = svg.select('.series-group-' + series.seriesName);
            const seriesElements = seriesGroup.selectAll('.scatter-series').data(seriesData)
                .attr("transform", d => `translate(${newXScale(d.x)}, ${yScale(d.y)})`);

            // add data within the new domain
            seriesElements.enter().append('path')
                .merge(seriesElements)
                .attr('class', 'scatter-series scatter-' + series.seriesName)
                .attr('d', d => this.#symbolPath(series.symbolShape, series.symbolSize * 10))
                .attr('fill', series.symbolColor)
                .attr('opacity', 1)
                .attr('stroke', 'white')
                .attr('stroke-width', 0.5);

            if (series.symbolShape == 'hollow') {
                seriesElements.attr('fill', 'none')
                    .attr('stroke', series.symbolColor)
                    .attr('stroke-width', 1);
            }

            // remove data outside of the new domain
            seriesElements.exit().remove();

        });

    }

    #updateYAxis(svg, axisIndex, chartData, newYScale, xScale) {

        const yChartData = chartData['yAxis'][axisIndex]; // Get y axis of interest
        const yAxisGroups = svg.selectAll('.yaxis-group').nodes();
        const yAxisGroup = yAxisGroups[axisIndex];
        const yAxisElement = d3.select(yAxisGroup).select('.yaxis');
        const yAxis = (yChartData.axisPosition == 'left') ? d3.axisLeft(newYScale) : d3.axisRight(newYScale);

        //--------- Update chart elements with selected options ---------

        // Get xAxisElement dimensions and positions
        const xAxisElement = svg.select('.xaxis-group .xaxis');
        const xAxisBBox = xAxisElement.node().getBBox();
        const xAxisLeft = xAxisBBox.x;
        const xAxisWidth = xAxisBBox.width;

        // Get yAxisElement dimensions and positions
        const yAxisBBox = yAxisElement.node().getBBox();
        const yAxisBottom = yAxisBBox.y;
        const yAxisTop = yAxisBottom + yAxisBBox.height;


        // Transform ticks
        let tickSize = (yChartData.tickPosition === 'inside') ? 6 : 6;
        if (!yChartData.ticks) {
            tickSize = 0;
        }
        else {

            yAxis.tickSizeOuter(tickSize);
        }

        yAxisElement.call(yAxis);


        // Adjust tick label positions
        yAxisElement.selectAll('.tick text')
            .attr('dx', function () {
                if (yChartData.axisPosition == 'left') {
                    return (yChartData.tickPosition == 'inside') ? '2em' : '0'; // change size to the label width and some space
                }
                return (yChartData.tickPosition == 'inside') ? '-2.25em' : '0';  // change size to the label width and some space
            });

        // Transform major gridlines
        if (yChartData.majorGridLines) {
            const tickVals = newYScale.ticks();
            const tickPositions = tickVals.map(val => newYScale(val));
            const majorGridlines = d3.select(yAxisGroup).selectAll('.major-gridline').data(tickPositions);
            majorGridlines.attr('y1', d => d).attr('y2', d => d);

            // Get x1 position of gridlines
            let xPos;
            const transformVal = yAxisElement.attr('transform');
            const translateRegex = /translate\(([^)]+)\)/;
            let translate = translateRegex.exec(transformVal);
            if (translate) {
                const [x, y] = translate[1].split(',').map(Number);
                xPos = x;
            }

            majorGridlines.enter().append('line')
                .attr('class', 'major-gridline')
                .attr('x1', xPos)
                .attr('x2', (yChartData.axisPosition == 'left') ? xPos + xAxisWidth : xPos - xAxisWidth)
                .attr('stroke', 'lightgray')
                .attr('stroke-width', 1);

            majorGridlines.exit().remove();
        }

        // Transform minor gridlines
        if (yChartData.minorGridLines) {
            const tickVals = newYScale.ticks();
            const intervalSpacing = newYScale(tickVals[1]) - newYScale(tickVals[0]);
            const numLines = 5; // Number of lines in between major gridlines
            const minorSpace = intervalSpacing / numLines;

            // Construct an array of all the minor gridline positions
            let tickPositions = [];
            for (let i = 0; i < tickVals.length; i++) {
                const majorPos = tickVals[i];
                let currentPos = newYScale(majorPos);
                for (let j = 0; j < numLines; j++) {
                    if (currentPos < yAxisBottom || currentPos > yAxisTop) { // if the position is within the width of the chart
                        // Exit the loop once the position goes outside of the chart
                        break;
                    }
                    tickPositions.push(currentPos);
                    currentPos = currentPos - minorSpace;
                };

                // if the major tick value is the last one, also add minor lines above it (in addition to the minor lines drawn below it)
                if (i == tickVals.length - 1) {
                    currentPos = newYScale(tickVals[i]);
                    for (let j = 0; j < numLines; j++) {
                        currentPos = currentPos + minorSpace;
                        if (currentPos < yAxisBottom || currentPos > yAxisTop) { // if the position is within the height of the chart
                            // Exit the loop once the position goes outside of the chart
                            break;
                        }
                        tickPositions.push(currentPos);
                    }
                }
            };

            // console.log('minor gridlines tickPositions >>>', tickPositions);

            // Get x1 position of gridlines
            let xPos;
            const transformVal = yAxisElement.attr('transform');
            const translateRegex = /translate\(([^)]+)\)/;
            let translate = translateRegex.exec(transformVal);
            if (translate) {
                const [x, y] = translate[1].split(',').map(Number);
                xPos = x;
            }

            // translate minor gridlines based on newXScale
            const minorGridLines = d3.select(yAxisGroup).selectAll('.minor-gridline').data(tickPositions);
                                            minorGridLines.attr('y1', d => d).attr('y2', d => d);

            minorGridLines.enter().append('line')
                .attr('class', 'minor-gridline')
                .attr('y1', d => d)
                .attr('y2', d => d)
                .attr('x1', xPos)
                .attr('x2', (yChartData.axisPosition == 'left') ? xPos + xAxisWidth : xPos - xAxisWidth)
                .attr('stroke', 'lightgray')
                .attr('stroke-width', 0.5);

            minorGridLines.exit().remove();
        }


        // Transform series data points
        chartData['series'].forEach(series => {

            if (axisIndex == series.yAxisIndex) { // Only transform series position if the current yAxis corresponds to the target yAxis of this series

                // filter out data according to the new scale domain
                const domain = newYScale.domain();
                const minVal = domain[0];
                const maxVal = domain[1];

                const seriesData = series.data.filter(d => {
                    // return false if xScale(d.x) position lies outside of the chart
                    const xPos = xScale(d.x);
                    if (xPos < xAxisLeft || xPos > (xAxisLeft + xAxisWidth)) {
                        return false;
                    }

                    const yValue = d.y;
                    // Check if yValue is within the scale's domain
                    return yValue >= minVal && yValue <= maxVal;
                });

                // transfrom data points according to the new scale
                const seriesGroup = svg.select('.series-group-' + series.seriesName);
                const seriesElements = seriesGroup.selectAll('.scatter-series').data(seriesData)
                    .attr('transform', d => `translate(${xScale(d.x)}, ${newYScale(d.y)})`);


                // draw data points within the new domain
                seriesElements.enter().append('path')
                    .merge(seriesElements)
                    .attr('class', 'scatter-series scatter-' + series.seriesName)
                    .attr('d', d => this.#symbolPath(series.symbolShape, Number(series.symbolSize) * 10))
                    .attr('fill', series.symbolColor)
                    .attr('opacity', 1)
                    .attr('stroke', 'white')
                    .attr('stroke-width', 0.5);

                if (series.symbolShape == 'hollow') {
                    seriesElements.attr('fill', 'none')
                        .attr('stroke', series.symbolColor)
                        .attr('stroke-width', 1);
                }

                // remove data outside of the new domain
                seriesElements.exit().remove();
            }


        });

    }


    resizeChart(div) {
        const divRect = div.getBoundingClientRect();

        // Adjust datazoomWrapper position and length
        const datazoomRangeBars = div.querySelectorAll('.datazoom-wrapper');
        datazoomRangeBars.forEach(datazoom => {
            const datazoomBBox = datazoom.getBoundingClientRect();
            const datazoomWidth = datazoomBBox.width;
            const datazoomHeight = datazoomBBox.height;

            const classList = datazoom.classList;

            if (classList.contains('xaxis-datazoom-wrapper')) {
                const xAxisGroup = div.querySelector('.xaxis-group');

                let xAxisRect = xAxisGroup.getBoundingClientRect(); // Get the resized bounding rect of the xAxis element
                let xAxisWidth = xAxisRect.width;
                let xAxisLeft = xAxisRect.left - divRect.left;

                datazoom.style.width = `${xAxisWidth}px`;
                datazoom.style.left = `${xAxisLeft}px`;
            }
            else if (classList.contains('yaxis-datazoom-wrapper')) {

                const yAxisId = datazoom.getAttribute('id');
                const yAxisIndex = yAxisId.replace('yaxis-datazoom-', '');
                const yAxisGroup = div.querySelector(`#yaxis-group-${yAxisIndex}`);
                console.log(yAxisGroup);
                
                // Adjust the yaxis input range bar height and its x positions according to the current yAxis position

                const yAxisRect = yAxisGroup.getBoundingClientRect(); // Get the resized bounding rect of the yAxis element
                const yAxisWidth = yAxisRect.width;
                const yAxisHeight = yAxisRect.height;
                const yAxisLeft = yAxisRect.x - divRect.x;
                const yAxisTop = yAxisRect.y - divRect.y;

                if (datazoom.classList.contains('axispos-left')) {
                    let translateX = yAxisLeft - datazoomWidth;
                    let translateY = divRect.height - yAxisHeight - yAxisTop + 6; // 6 for the tick size

                    if (datazoom.classList.contains('tickpos-inside')) {
                        translateX = yAxisLeft - yAxisWidth - datazoomWidth;
                    }

                    // Get the datazoom element and resize it to the same length as the yAxisHeight
                    datazoom.style.width = `${yAxisHeight}px`;
                    datazoom.style.transform = `translate(${translateX}px, -${translateY}px) rotate(-90deg)`;
                }
                else {
                    let translateX = yAxisLeft + yAxisWidth + datazoomWidth;
                    let translateY = divRect.height - yAxisTop + 6; // 6 for the tick size

                    if (datazoom.classList.contains('tickpos-inside')) {
                        translateX = yAxisLeft + yAxisWidth + yAxisWidth + datazoomWidth;
                    }

                    // Get the datazoom element and resize it to the same length as the yAxisHeight
                    datazoom.style.width = `${yAxisHeight}px`;
                    datazoom.style.transform = `translate(${translateX}px, -${translateY}px) rotate(90deg)`;
                }

            }

        });

    }

}