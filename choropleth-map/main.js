// Define the size of the svg container
const width = 960;
const height = 600;

// Create the svg container
const svg = d3
  .select("body")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

// Define the tooltip
const tooltip = d3
  .select("body")
  .append("div")
  .attr("id", "tooltip")
  .style("opacity", 0);

// Define the color scale
const colorScale = d3
  .scaleThreshold()
  .domain([10, 20, 30, 40, 50, 60, 70])
  .range(d3.schemeGreens[7]);

// Load the county data
d3.json(
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json"
).then((topojsonData) => {
  // Load the education data
  d3.json(
    "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json"
  ).then((educationData) => {
    // Convert the county data to geojson format
    const geojsonData = topojson.feature(
      topojsonData,
      topojsonData.objects.counties
    );

    // Create the counties
    svg
      .selectAll("path")
      .data(geojsonData.features)
      .enter()
      .append("path")
      .attr("d", d3.geoPath())
      .attr("class", "county")
      .attr("data-fips", (d) => d.id)
      .attr("data-education", (d) => {
        const county = educationData.find((c) => c.fips === d.id);
        return county ? county.bachelorsOrHigher : 0;
      })
      .attr("fill", (d) => {
        const county = educationData.find((c) => c.fips === d.id);
        return county ? colorScale(county.bachelorsOrHigher) : colorScale(0);
      })
      .on("mouseover", (d, i) => {
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip
          .html(() => {
            const county = educationData.find((c) => c.fips === d.id);
            return county
              ? `${county.area_name}, ${county.state}: ${county.bachelorsOrHigher}%`
              : "No data available";
          })
          .attr("data-education", () => {
            const county = educationData.find((c) => c.fips === d.id);
            return county ? county.bachelorsOrHigher : 0;
          })
          .style("left", `${d3.event.pageX + 10}px`)
          .style("top", `${d3.event.pageY - 28}px`);
      })
      .on("mouseout", () => {
        tooltip.transition().duration(500).style("opacity", 0);
      });

    // Create the legend
    const legend = svg
      .append("g")
      .attr("id", "legend")
      .attr("transform", `translate(${width - 300}, ${height - 100})`);

    legend
      .selectAll("rect")
      .data(
        colorScale.range().map((d) => {
          const r = colorScale.invertExtent(d);
          return r[0];
        })
      )
      .enter()
      .append("rect")
      .attr("x", (d, i) => i * 40)
      .attr("y", 0)
      .attr("width", 40)
      .attr("height", 20)
      .attr("fill", (d) => colorScale(d));

    // Add legend labels
    legend
      .selectAll("text")
      .data(
        colorScale.range().map((d) => {
          const r = colorScale.invertExtent(d);
          return r[0];
        })
      )
      .enter()
      .append("text")
      .attr("x", (d, i) => i * 40)
      .attr("y", 30)
      .text((d) => `${Math.round(d)}%`)
      .style("font-size", "12px")
      .attr("text-anchor", "middle");
  });
});
