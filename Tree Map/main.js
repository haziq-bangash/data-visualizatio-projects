const URLS = {
  movie:
    "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json",
  game: "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json",
  kickstarter:
    "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json",
};

const colors = [
  "#e6194B",
  "#3cb44b",
  "#ffe119",
  "#4363d8",
  "#f58231",
  "#911eb4",
  "#46f0f0",
  "#f032e6",
  "#bcf60c",
  "#fabebe",
  "#008080",
  "#e6beff",
  "#9a6324",
  "#fffac8",
  "#800000",
  "#aaffc3",
  "#808000",
  "#ffd8b1",
  "#000075",
  "#808080",
];

const getTooltipHTML = (d) => `
    <div><b>${d.data.name}</b></div>
    <div>Category: ${d.data.category}</div>
    <div>Value: ${d3.format("$,.0f")(d.data.value)}</div>
  `;

const createTreeMap = (data) => {
  const hierarchy = d3
    .hierarchy(data)
    .sum((d) => d.value)
    .sort((a, b) => b.value - a.value);

  const treemapLayout = d3.treemap().size([960, 570]);
  const rootNode = treemapLayout(hierarchy);

  const svg = d3
    .select("#chart")
    .append("svg")
    .attr("width", 960)
    .attr("height", 570);

  const cell = svg
    .selectAll(".tile")
    .data(rootNode.leaves())
    .enter()
    .append("g")
    .attr("class", "tile")
    .attr("transform", (d) => `translate(${d.x0},${d.y0})`);

  cell
    .append("rect")
    .attr("class", "tile")
    .attr("fill", (d) => {
      const category = d.data.category;
      return colors[category.charCodeAt(0) % colors.length];
    })
    .attr("data-name", (d) => d.data.name)
    .attr("data-category", (d) => d.data.category)
    .attr("data-value", (d) => d.data.value)
    .attr("width", (d) => d.x1 - d.x0)
    .attr("height", (d) => d.y1 - d.y0)
    .on("mouseover", (event, d) => {
      d3.select("#tooltip")
        .style("opacity", 0.9)
        .attr("data-value", d.data.value)
        .html(getTooltipHTML(d));
      d3.select(event.target)
        .attr("stroke", "#000")
        .attr("stroke-width", "2px");
    })
    .on("mouseout", (event, d) => {
      d3.select("#tooltip").style("opacity", 0);

      d3.select(event.target)
        .attr("stroke", "#fff")
        .attr("stroke-width", "0.5px");
    });
  cell
    .append("text")
    .attr("class", "tile-text")
    .selectAll("tspan")
    .data((d) => d.data.name.split(/(?=[A-Z][^A-Z])/g))
    .enter()
    .append("tspan")
    .attr("x", 4)
    .attr("y", (d, i) => 13 + i * 10)
    .text((d) => d);
  const legend = d3
    .select("#legend")
    .append("svg")
    .attr("width", 600)
    .attr("height", 60);

  const legendItems = legend
    .selectAll(".legend-item")
    .data(rootNode.leaves().map((d) => d.data.category))
    .enter()
    .append("g")
    .attr("class", "legend-item")
    .attr("transform", (d, i) => `translate(${i * 80}, 0)`);

  legendItems
    .append("rect")
    .attr("class", "legend-item")
    .attr("fill", (d, i) => colors[i % colors.length])
    .attr("width", 20)
    .attr("height", 20);
  legendItems
    .append("text")
    .text((d) => d)
    .attr("x", 25)
    .attr("y", 15);
};

const getData = (url) => {
  d3.json(url).then((data) => {
    createTreeMap(data);
  });
};

// get data on page load
window.addEventListener("load", () => {
  getData(URLS.movie);
  getData(URLS.game);
  getData(URLS.kickstarter);
});
