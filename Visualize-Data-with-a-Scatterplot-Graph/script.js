const url =
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json";

// Define the dimensions of the SVG container
const width = 800;
const height = 500;
const padding = 60;

// Define the SVG container
const svg = d3
  .select("body")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

// Define the tooltip element
const tooltip = d3
  .select("body")
  .append("div")
  .attr("id", "tooltip")
  .style("opacity", 0);

// Load the data from the JSON file
d3.json(url).then((data) => {
  // Convert the time strings to Date objects
  const parseTime = d3.timeParse("%M:%S");
  data.forEach((d) => {
    d.Time = parseTime(d.Time);
  });

  // Define the scales for the x and y axes
  const xScale = d3
    .scaleLinear()
    .domain([d3.min(data, (d) => d.Year - 1), d3.max(data, (d) => d.Year + 1)])
    .range([padding, width - padding]);

  const yScale = d3
    .scaleTime()
    .domain(d3.extent(data, (d) => d.Time))
    .range([padding, height - padding]);

  // Define the axes
  const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));

  const yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat("%M:%S"));

  // Add the x and y axes to the SVG container
  svg
    .append("g")
    .attr("id", "x-axis")
    .attr("transform", `translate(0, ${height - padding})`)
    .call(xAxis);

  svg
    .append("g")
    .attr("id", "y-axis")
    .attr("transform", `translate(${padding}, 0)`)
    .call(yAxis);

  // Add the data points to the SVG container
  const dotRadius = 6;
  svg
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("data-xvalue", (d) => d.Year)
    .attr("data-yvalue", (d) => d.Time.toISOString())
    .attr("cx", (d) => xScale(d.Year))
    .attr("cy", (d) => yScale(d.Time))
    .attr("r", dotRadius)
    .attr("fill", (d) => (d.Doping === "" ? "#FFA500" : "#FF3F3F"))
    .attr("opacity", 0.8)
    .on("mouseover", (event, d) => {
      tooltip
        .attr("id", "tooltip")
        .attr("data-year", d.Year)
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 30 + "px")
        .style("opacity", 0.9)
        .html(
          `${d.Name}: ${d.Nationality}<br>Year: ${
            d.Year
          }, Time: ${d.Time.getMinutes()}:${d.Time.getSeconds()}${
            d.Doping === "" ? "" : "<br><br>" + d.Doping
          }`
        );
    })
    .on("mouseout", () => {
      tooltip.style("opacity", 0);
    });

  // Add the legend to the SVG container
  const legend = svg
    .append("g")
    .attr("id", "legend")
    .attr("transform", translate(`${width - padding - 200}, ${padding + 10}`));

  legend
    .append("rect")
    .attr("id", "legend-box")
    .attr("width", 20)
    .attr("height", 20)
    .attr("fill", "#FFA500");

  legend
    .append("text")
    .attr("x", 30)
    .attr("y", 15)
    .text("No doping allegations");

  legend
    .append("rect")
    .attr("id", "legend-box")
    .attr("width", 20)
    .attr("height", 20)
    .attr("fill", "#FF3F3F")
    .attr("transform", translate(0, 25));

  legend
    .append("text")
    .attr("x", 30)
    .attr("y", 40)
    .text("Riders with doping allegations");
});
