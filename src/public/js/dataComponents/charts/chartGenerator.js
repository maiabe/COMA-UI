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
    plotData = (chartData, type, pdiv, width, height, theme, coordinateSystem) => {
        return this.#drawChart(chartData, type, pdiv, width, height);
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
    #drawChart = (chartData, type, pdiv, width, height) => {

        console.log(chartData);

        // top margin space should depend on the length of x-axis label and chart title
        const margin = {
            top: Number(chartData.marginTop), left: Number(chartData.marginLeft),
            bottom: Number(chartData.marginBottom), right: Number(chartData.marginRight),
        };

        const svg = d3.select(pdiv)
            .append("svg")
            .attr("width", '100%')
            .attr("height", '100%')
            .attr("viewBox", `0 0 ${width} ${height}`)
            .attr("preserveAsoectRatio", 'none')
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
        this.#drawLegend(legendWrapper, seriesChartData, width, height, margin);

        /**************** x-axis ****************/
        const xChartData = chartData['xAxis'].filter(xa => xa.primary)[0];

        //-- Draw x-axis
        const xScale = this.#drawXAxis(svg, xChartData, height, width, margin);


        /************* custom label (as additional x-axis) *************/
        const customChartData = chartData['xAxis'].filter(xa => !xa.primary);
        if ((customChartData.length > 0) && (chartData['series'].length > 0)) {
            customChartData.forEach((chartData, i) => {
                this.#drawCustomLabel(xScale, svg, chartData, height, width, margin);
            });
        }

        /**************** y-axis ****************/
        chartData['yAxis'].forEach(yChartData => {
            const yScale = this.#drawYAxis(svg, yChartData, height, width, margin);
            yChartData['yScale'] = yScale;
        });


        /**************** series ****************/
        chartData['series'].forEach(series => {
            console.log(series);

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


        // Draw x-axis labels on the other side
        /*svg.selectAll(".x-label")
            .data(data)
            .enter().append("text")
            .attr("class", "x-label")
            .attr("x", d => xScale(d.x) + 10) // Adjust the offset as needed
            .attr("y", height) // Adjust the y position as needed
            .attr("dy", "1em") // Adjust the vertical alignment
            .attr("text-anchor", "middle") // Center the text on the x-axis point
            .text(d => d.label)
            .attr("transform", "rotate(-90)")
            .attr("translate", "5px"); */

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
    #drawXAxis(svg, xChartData, height, width, margin) {

        //-- Create x-axis scale
        const data = xChartData.data;
        const leftPos = xChartData.inverse ? (width - margin.right) : (margin.left);
        const rightPos = xChartData.inverse ? (margin.left) : (width - margin.right);

        const xScale = this.#getXScale(xChartData.dataType, data, leftPos, rightPos);


        //-- Create x-axis wrapper group
        const wrapper = svg.append("g")
                           .attr("class", "xaxis-group-" + xChartData.axisName);

        //-- Axis & Tick Positions
        const offset = Number(xChartData.offset);
        const yPos = (xChartData.axisPosition == 'bottom') ? height - margin.bottom + offset : margin.top + offset;
        const tickPos = xChartData.tickPosition;
        let tickSize = (tickPos == 'inside') ? -6 : 6;
        if (!xChartData.ticks) {
            tickSize = 0;
        }

        //-- Create x-axis
        const xAxis = (xChartData.axisPosition == 'bottom') ? d3.axisBottom(xScale) : d3.axisTop(xScale);
        xAxis.tickSize(tickSize);

        const xAxisElement = wrapper.append("g")
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

        return xScale;
    }

    //-- draw custom label as additional x-axis
    #drawCustomLabel(xScale, svg, customChartData, height, width, margin) {
        console.log(customChartData);

        const data = customChartData.data;
        const axisPos = customChartData.axisPosition;
        const offset = customChartData.offset;
        const yPos = (axisPos == 'top') ? margin.top + offset : height - margin.bottom + offset;

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
        axisLine.attr('x1', margin.left)
            .attr('y1', yPos)
            .attr('x2', width - margin.right)
            .attr('y2', yPos);
    }

    //-- draw each y axis
    #drawYAxis(svg, yChartData, height, width, margin) {

        //-- Create y-axis scale
        const yScale = d3.scaleLinear()
            .domain([d3.min(yChartData.data), d3.max(yChartData.data)])
            .range(yChartData.inverse ? [margin.top, height - margin.bottom] : [height - margin.bottom, margin.top]);

        const wrapper = svg.append("g")
            .attr("class", "yaxis-group-" + yChartData.axisName);

        const axisPos = yChartData.axisPosition;
        const offset = yChartData.offset;
        const xPos = (axisPos == 'left') ? margin.left + offset : width - margin.right + offset;
        const tickPos = yChartData.tickPosition;
        let tickSize = (tickPos == 'inside') ? -6 : 6;
        if (!yChartData.ticks) {
            console.log('yChartData tickSize ' + tickSize);
            tickSize = 0;
        }

        //-- Create y-axis element
        const yAxis = (axisPos == 'left') ? d3.axisLeft(yScale) : d3.axisRight(yScale);
        yAxis.tickSize(tickSize);

        const axisElement = wrapper.append("g")
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
        const labelX = (axisPos == 'left') ? ((tickPos == 'outside') ? ((margin.left / 2) + offset) : (margin.left + axisWidth + offset + labelHeight))
                                           : ((tickPos == 'outside') ? (width - (margin.right / 2) - offset) : (width - margin.right - axisWidth - offset - labelHeight));
        const labelY = (axisHeight / 2) + margin.top; // This centers the label across the length of the axis

        const rotateAngle = (axisPos == 'left') ?  ((tickPos == 'outside') ? -90 : 90) : ((tickPos == 'outside') ? 90 : -90);
        const labelTransform = `translate(${labelX}, ${labelY}) rotate(${rotateAngle})`;

        labelElement.attr("transform", labelTransform);

        return yScale;
    }

    #drawSeries(wrapper, series, type, xScale, yScale) {
        const symbolSize = Number(series.symbolSize) * 10;
        switch (type) {
            case 'scatter':
                wrapper.selectAll(".scatter-" + series.seriesName)
                    .data(series.data)
                    .join("path")
                    .attr("class", "scatter-series scatter-" + series.seriesName)
                    .attr("d", d => this.#symbolPath(series.symbolShape, symbolSize))
                    .attr("transform", d => `translate(${xScale(d.x)}, ${yScale(d.y)})`)
                    .attr("fill", series.symbolColor)
                    .attr('opacity', 0.5);
        }
    }

    #symbolPath(symbolShape, size) {
        const symbols = {
            circle: d3.symbol().type(d3.symbolCircle).size(size),
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

    #drawLegend(wrapper, seriesChartData, width, height, margin) {

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

    resizeChart(moduleKey, width, height) {
        /*const chartToResize = document.getElementById(`plot_${moduleKey}`).querySelector('svg');
        chartToResize.setAttribute('viewBox', `0 0 ${width} ${height}`);*/
    }

}