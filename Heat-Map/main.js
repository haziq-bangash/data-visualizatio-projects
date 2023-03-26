const margin = { top: 100, right: 50, bottom: 150, left: 100 };
const width = 1200 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;
const padding = 60;

const svg = d3
  .select("#heatmap")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

const tooltip = d3
  .select("#heatmap")
  .append("div")
  .attr("id", "tooltip")
  .style("opacity", 0);

d3.json(
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json"
).then((data) => {
  const baseTemp = data.baseTemperature;
  const dataset = data.monthlyVariance;

  const years = dataset.map((item) => item.year);
  const uniqueYears = years.filter(
    (year, index, self) => self.indexOf(year) === index
  );

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const xScale = d3.scaleBand().domain(uniqueYears).range([0, width]);
  const yScale = d3.scaleBand().domain(months).range([0, height]);

  const legendWidth = 400;
  const legendHeight = 20;

  const legend = svg
    .append("g")
    .attr("id", "legend")
    .attr(
      "transform",
      `translate(${width - legendWidth}, ${height + padding})`
    );

  const colors = [
    "#313695",
    "#4575b4",
    "#74add1",
    "#abd9e9",
    "#e0f3f8",
    "#ffffbf",
    "#fee090",
    "#fdae61",
    "#f46d43",
    "#d73027",
    "#a50026",
  ];

  const colorScale = d3
    .scaleQuantize()
    .domain([
      d3.min(dataset, (d) => baseTemp + d.variance),
      d3.max(dataset, (d) => baseTemp + d.variance),
    ])
    .range(colors);

  legend
    .selectAll("rect")
    .data(colors)
    .enter()
    .append("rect")
    .attr("width", legendWidth / colors.length)
    .attr("height", legendHeight)
    .attr("x", (d, i) => i * (legendWidth / colors.length))
    .attr("fill", (d) => d);

  const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
  const yAxis = d3.axisLeft(yScale);

  svg
    .append("g")
    .attr("id", "x-axis")
    .attr("transform", `translate(0, ${height + padding})`)
    .call(xAxis);

  svg
    .append("g")
    .attr("id", "y-axis")
    .attr("transform", `translate(${padding}, 0)`)
    .call(yAxis);

  svg
    .selectAll("rect")
    .data(dataset)
    .enter()
    .append("rect")
    .attr("class", "cell")
    .attr("x", (d) => xScale(d.year))
    .attr("y", (d) => yScale(months[d.month - 1]))
    .attr("width", xScale.bandwidth())
    .attr("height", yScale.bandwidth())
    .attr("fill", (d) => colorScale(baseTemp + d.variance))
    .on("mouseover", function (d) {
      const tooltip = d3.select("#tooltip").style("opacity", 0.9);
      tooltip
        .attr("data-year", d.year)
        .attr("data-month", d.month - 1)
        .html(
          `${months[d.month - 1]} ${d.year}<br>` +
            `Temperature: ${
              (baseTemp + d.variance).toFixed(1) || ""
            } &#8451;<br>` +
            `Variance: ${d.variance.toFixed(1) || ""} &#8451;`
        )

        .style("left", d3.event.pageX + 10 + "px")
        .style("top", d3.event.pageY - 28 + "px");
    })
    .on("mouseout", function (d) {
      const tooltip = d3.select("#tooltip").style("opacity", 0);
    });
});
