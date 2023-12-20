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
        const margin = { top: 150, right: 60, bottom: 45, left: 65 };

        const svg = d3.select(pdiv)
            .append("svg")
            .attr("width", '100%')
            .attr("height", '100%')
            .attr("viewBox", `0 0 ${width} ${height}`)
            .attr("preserveAsoectRatio", 'none');
            /*.attr("preserveAsoectRatio", 'xMidYMid meet');*/


        /**************** x-axis ****************/
        const primaryXAxis = chartData['xAxis'].filter(xa => xa.primary)[0];
        const xAxisData = primaryXAxis.data;
        const leftPos = primaryXAxis.inverse ? (width - margin.right) : (margin.left);
        const rightPos = primaryXAxis.inverse ? (margin.left) : (width - margin.right);

        //-- Create x-axis scale
        const xScale = this.#getXScale(primaryXAxis.dataType, xAxisData, leftPos, rightPos);

        const xAxisWrapper = svg.append("g")
            .attr("class", "xaxis-group-" + primaryXAxis.axisName);

        const xAxisPos = (primaryXAxis.position == 'bottom') ? height - margin.bottom : margin.top;

        //-- Create x-axis element
        const xAxis = d3.axisBottom(xScale);
        const xAxisElement = xAxisWrapper.append("g")
            .attr("transform", `translate(0, ${xAxisPos})`)
            .call(xAxis);

        const xAxisBox = xAxisElement.node().getBBox();
        const xAxisHeight = xAxisBox.height;
        const xAxisWidth = xAxisBox.width;

        //-- Create x-axis label
        xAxisWrapper.append("text")
            .attr("class", "x-axis-label")
            .attr("text-anchor", "middle")
            .attr("x", (xAxisWidth / 2) + margin.left)
            .attr("y", (xAxisPos) + xAxisHeight + 20) // 20 is height of this text
            .text(primaryXAxis.labelName);


        /************* custom label *************/
        const xAxisLabels = chartData['xAxis'].filter(xa => !xa.primary);
        if (xAxisLabels.length > 0) {
            xAxisLabels.forEach((xAxisLabel, i) => {
                console.log(xAxisLabel);

                const customLabels = xAxisLabel.data;
                const tickInterval = Math.ceil(customLabels.length / (width / 200));
                const axisPosition = xAxisLabel.position;
                const yPos = (axisPosition == 'top') ? margin.top : (height - margin.bottom);

                const customLabelGroupWrapper = svg.append("g")
                    .attr("class", "custom-label-group");

                // Add custom x-axis labels
                const customTicks = customLabelGroupWrapper.selectAll(".custom-tick")
                                        .data(xAxisData.filter((d, i) => i % tickInterval === 0))
                                        .enter().append("text")
                                        .attr("class", "custom-tick")
                                        .attr("text-anchor", "middle")
                                        .style("font-size", "12px")
                                        .text(function (d, i) { return customLabels[Math.floor(i * tickInterval)]; });

                // Adjust position and rotation
                customTicks.each(function (d) {
                    const textElement = d3.select(this);
                    const x = xScale(d);
                    const textWidth = this.getBBox().width;
                    const adjustedYPos = yPos - (textWidth / 2);
                    textElement
                        .attr('transform', `rotate(-90, ${x}, ${adjustedYPos})`)
                        .attr('x', x)
                        .attr('y', adjustedYPos);
                });

            });
        }
        /*const customTicks = [232.133, 298.911, 357.857, 19.647];
        const customLabels = ["2015-07-29", "2022-03-21", "2023-03-19", "2023-07-06"];


        const customLabelGroupWrapper = svg.append("g")
                                           .attr("class", "custom-label-group");
        // Add custom x-axis labels
        customLabelGroupWrapper.selectAll(".custom-tick")
            .data(customTicks)
            .enter().append("text")
            .attr("class", "custom-tick")
            .attr("x", function (d) { return xScale(d); })
            .attr("y", margin.top/2)
            *//*.attr("dy", ".35em")*//*
            .attr("text-anchor", "middle")
            .attr("transform", function (d) {
                const x = xScale(d);
                const y = margin.top/2;
                return `rotate(-90, ${x}, ${y})`;
            }) // Rotate the text vertically around its position
            .style("font-size", "12px")
            .text(function (d, i) { return customLabels[i]; });*/


        /**************** y-axis ****************/
        chartData['yAxis'].forEach(ya => {
            //-- Create y-axis scale
            const yScale = d3.scaleLinear()
                .domain([d3.min(ya.data), d3.max(ya.data)])
                .range(ya.inverse ? [margin.top, height - margin.bottom] : [height - margin.bottom, margin.top]);
            ya['yScale'] = yScale;

            const yAxisWrapper = svg.append("g")
                .attr("class", "yaxis-group-" + ya.axisName);

            //-- Create y-axis element
            const yAxis = d3.axisLeft(yScale);
            const yAxisElement = yAxisWrapper.append("g")
                .attr("transform", `translate(${margin.left}, 0)`)
                .call(yAxis);

            const yAxisHeight = yAxisElement.node().getBBox().height;

            // Add y-axis label
            yAxisWrapper.append("text")
                .attr("class", "y-axis-label")
                .attr("text-anchor", "middle")
                .attr("transform", "rotate(-90) translate(-" + margin.top + ")")
                .attr("x", -(yAxisHeight / 2))
                .attr("y", margin.left / 2)
                .text(ya.labelName);
        });




        /**************** series ****************/
        chartData['series'].forEach(series => {

            // Get corresponding yAxis data for this series
            const yAxis = chartData['yAxis'][series.yAxisIndex];
            const yScale = yAxis.yScale;


            console.log(series.seriesName);

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
        console.log(dataType);

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


    resizeChart(moduleKey, width, height) {
        /*const chartToResize = document.getElementById(`plot_${moduleKey}`).querySelector('svg');
        chartToResize.setAttribute('viewBox', `0 0 ${width} ${height}`);*/
    }

}