import React, { useEffect } from 'react';
import * as d3 from 'd3';


function MultiLineChart(props) {
    const { data, width, height , style } = props;

    useEffect(() => {
        drawChart();
    }, [data]);
    
    
    function drawChart(){
        
        
        console.log(data)
        d3.select("#line_container").select('svg').remove();
        
        
        
        const line = d3.line()
            .defined(d => !isNaN(d))
            .x((d, i) => x(data.dates[i]))
            .y(d => y(d))
            
        const margin = ({top: 20, right: 20, bottom: 30, left: 30})
        
        const x = d3.scaleUtc()
            .domain(d3.extent(data.dates))
            .range([margin.left, width - margin.right])
        
        const y = d3.scaleLinear()
            .domain([0, d3.max(data.series, d => d3.max(d.values))]).nice()
            .range([height - margin.bottom, margin.top])
        
        const xAxis = g => g
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))
            
        const yAxis = g => g
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y))
            .call(g => g.select(".domain").remove())
            .call(g => g.select(".tick:last-of-type text").clone()
                .attr("x", 3)
                .attr("text-anchor", "start")
                .attr("font-weight", "bold")
                .text(data.y))
        
        const svg = d3.select('#line_container').append("svg")
            .attr("viewBox", [0, 0, width, height])
            .style("overflow", "visible");
        
        svg.append("g")
            .call(xAxis);
        
        svg.append("g")
            .call(yAxis);
        
        const path = svg.append("g")
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 2)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .selectAll("path")
            .data(data.series)
            .join("path")
            .style("mix-blend-mode", "multiply")
            .attr("d", d => line(d.values));
        
        
            function hover(svg, path) {
    
                if ("ontouchstart" in document) svg
                    .style("-webkit-tap-highlight-color", "transparent")
                    .on("touchmove", moved)
                    .on("touchstart", entered)
                    .on("touchend", left)
                else svg
                    .on("mousemove", moved)
                    .on("mouseenter", entered)
                    .on("mouseleave", left);
                
                const dot = svg.append("g")
                    .attr("display", "none");
                
                dot.append("circle")
                    .attr("r", 4)
                    .style("fill", "none")
                    .attr("stroke", "black")
                
                dot.append("text")
                    .attr("font-family", "sans-serif")
                    .attr("font-size", 10)
                    .attr("text-anchor", "middle")
                    .attr("y", -8);
                
                function moved(event) {
                    event.preventDefault();
                    const pointer = d3.pointer(event, this);
                    const xm = x.invert(pointer[0]);
                    const ym = y.invert(pointer[1]);
                    const i = d3.bisectCenter(data.dates, xm);
                    const s = d3.least(data.series, d => Math.abs(d.values[i] - ym));
                    path.attr("stroke", d => d === s ? null : "#ddd").filter(d => d === s).raise();
                    dot.attr("transform", `translate(${x(data.dates[i])},${y(s.values[i])})`);
                    dot.select("text").text(s.name);
                }
                
                function entered() {
                    path.style("mix-blend-mode", null).attr("stroke", "#ddd");
                    dot.attr("display", null);
                }
                
                function left() {
                    path.style("mix-blend-mode", "multiply").attr("stroke", null);
                    dot.attr("display", "none");
                }
            }
        
        svg.call(hover, path);
    
    }
    return <div id="line_container" />;
}

export default MultiLineChart;