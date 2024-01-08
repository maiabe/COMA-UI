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
        /*const myChart = echarts.init(pdiv, theme);
        const option = this.#optionGenerationMap.get(coordinateSystem)(data, type, coordinateSystem);
        option && myChart.setOption(option);
        this.resizeEchart(myChart, width, height);
        return myChart;*/

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
            .attr("preserveAsoectRatio", 'none');
            /*.attr("preserveAsoectRatio", 'xMidYMid meet');*/

        // Add Chart Title
        const titleWrapper = svg.append('g')
            .attr('class', 'title-group-' + chartData.chartTitle);

        titleWrapper.append('text')
            .attr('class', 'chart-title')
            .attr('text-anchor', 'middle')
            .attr('x', width / 2)
            .attr('y', 30)
            .text(chartData.chartTitle);

        /**************** x-axis ****************/
        const xChartData = chartData['xAxis'].filter(xa => xa.primary)[0];

        //-- Draw x-axis
        const xScale = this.#drawXAxis(svg, xChartData, height, width, margin);


        /************* custom label (as additional x-axis) *************/
        const customChartData = chartData['xAxis'].filter(xa => !xa.primary);
        if (customChartData.length > 0) {
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

            // Get corresponding yAxis data for this series
            const yAxis = chartData['yAxis'][series.yAxisIndex];
            const yScale = yAxis.yScale;

            const seriesGroupWrapper = svg.append("g")
                                          .attr("class", "series-group-" + series.seriesName);
            // Draw scatter plot points
            seriesGroupWrapper.selectAll(".dot-" + series.seriesName)
                .data(series.data)
                .join("circle")
                .attr("class", "dot dot-" + series.seriesName)
                .attr("cx", d => xScale(d.x))
                .attr("cy", d => yScale(d.y))
                .attr("r", series.symbolSize) // Adjust the radius as needed
                .attr("fill", series.symbolColor);
            //--TODO: create function for drawing different symbols
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
        let tickPos = (xChartData.tickPosition == 'inside') ? -6 : 6;

        //-- Create x-axis
        const xAxis = (xChartData.axisPosition == 'bottom') ? d3.axisBottom(xScale) : d3.axisTop(xScale);
        xAxis.tickSize(tickPos);

        const xAxisElement = wrapper.append("g")
                                    .attr("transform", `translate(0, ${yPos})`)
                                    .call(xAxis);

        //-- Create x-axis label
        const axisBBox = xAxisElement.node().getBBox();
        const axisHeight = axisBBox.height;

        const label = wrapper.append('text')
                             .attr('class', 'x-axis-label')
                             .attr('text-anchor', 'middle')
                             .style('font-size', '12px')
                             .attr('x', (width / 2))
                             .text(xChartData.labelName);

        // adjust label y position
        const labelHeight = label.node().getBBox().height;

        if (xChartData.axisPosition == 'bottom') {
            label.attr('y', yPos + axisHeight + labelHeight);
        } else {
            label.attr('y', yPos - axisHeight - labelHeight);
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
        const tickInterval = Math.ceil(data.length / (width / 200));

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
            console.log(customLabel);

            // Adjust label positions
            const textElement = d3.select(this);
            const xPos = xScale(customLabel.x);
            const textWidth = this.getBBox().width;
            const textHeight = this.getBBox().height;

            // Define spacing between label and tick
            let labelSpacing = (tickPos == 'inside') ? 3 : 9;
            if (axisPos == 'bottom') {
                labelSpacing = (tickPos == 'inside') ? 9 : 3;
            }
            const adjustedXPos = xPos + (textHeight / 3);

            /*console.log(xScale(d));
            console.log(textHeight);
            console.log(adjustedXPos);*/

            const adjustedYPos = yPos - (textWidth / 2) - labelSpacing;
            textElement
                .attr('transform', `rotate(-90, ${adjustedXPos}, ${adjustedYPos})`)
                .attr('x', adjustedXPos)
                .attr('y', adjustedYPos);

            // Add custom ticks
            const tickLength = 6;
            const tickY1 = yPos;
            let tickY2 = (tickPos == 'inside') ? yPos + tickLength : yPos - tickLength;
            if (axisPos == 'bottom') {
                tickY2 = (tickPos == 'inside') ? yPos - tickLength : yPos + tickLength;
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
        let tickPos = (yChartData.tickPosition == 'inside') ? -6 : 6;

        //-- Create y-axis element
        const yAxis = (axisPos == 'left') ? d3.axisLeft(yScale) : d3.axisRight(yScale);
        yAxis.tickSize(tickPos);

        const axisElement = wrapper.append("g")
            .attr("transform", `translate(${xPos}, 0)`)
            .call(yAxis);

        const axisHeight = axisElement.node().getBBox().height;
        const axisWidth = axisElement.node().getBBox().width;

        // Calculate the position based on the axis position
        const labelX = (axisPos == 'left') ? - (axisHeight / 2) - margin.top : (axisHeight / 2) + margin.top; // This centers the label across the length of the axis
        const labelY = (axisPos == 'left') ? (margin.left / 2) + offset : (- width + (margin.right / 2)) - offset; // Adjust based on side

        // Constructing the transform attribute
        const rotateAngle = axisPos == 'left' ? -90 : 90;
        const labelTransform = `rotate(${rotateAngle}) translate(${labelX}, ${labelY})`;

        // Add y-axis label
        wrapper.append("text")
            .attr("class", "y-axis-label")
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .attr("transform", labelTransform)
            .text(yChartData.labelName);

        return yScale;
    }

    resizeChart(moduleKey, width, height) {
        /*const chartToResize = document.getElementById(`plot_${moduleKey}`).querySelector('svg');
        chartToResize.setAttribute('viewBox', `0 0 ${width} ${height}`);*/
    }

}