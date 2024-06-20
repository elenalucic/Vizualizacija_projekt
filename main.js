
var width = window.innerWidth;
var height = window.innerHeight;

var projection = d3.geoMercator()
    .scale(200)
    .translate([width / 2.9, height / 2 + 50]);

var path = d3.geoPath().projection(projection);

var svg = d3.select("#map").append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("background", "darkgray");

var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip");

var zoom = d3.zoom()
    .scaleExtent([1, 8])
    .on("zoom", zoomed);

svg.call(zoom);

function zoomed() {
    svg.selectAll("path")
        .attr("transform", d3.event.transform);
}

var colorScale = d3.scaleOrdinal()
.domain(["Apple", "Samsung", "Xiaomi", "Oppo", "Tecno", "Unknown", "NoInfo", "Google", "Motorola", "Huawei", "Vivo", "Infinix", "LG"])
.range(["blue", "green", "red", "purple", "yellow", "orange", "gray", "cyan", "magenta", "lime", "brown", "pink", "teal"]);


var legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", "translate(20,370)");

var legendItems = legend.selectAll(".legend-item")
    .data(colorScale.domain())
    .enter().append("g")
    .attr("class", "legend-item")
    .attr("transform", function (d, i) { return "translate(0," + i * 28 + ")"; });

legendItems.append("rect")
    .attr("x", 0)
    .attr("width", 15)
    .attr("height", 20)
    .style("fill", colorScale);

legendItems.append("text")
    .attr("x", 24)
    .attr("y", 12)
    .attr("dy", ".35em")
    .text(function (d) { return d; });

var selectedBrands = [];

function loadData() {
    d3.json("data/world-countries.json").then(function (topoJSONdata) {
        d3.json("data/phones2.json").then(function (phoneData) {
            var states = svg.selectAll('path')
                .data(topojson.feature(topoJSONdata, topoJSONdata.objects.countries1).features)
                .enter()
                .append('path')
                .attr('class', 'country')
                .attr('d', path)
                .style("fill", function (d) {
                    var countryId = d.id;
                    var brand = phoneData.find(function (item) {
                        return item.id === countryId && item["#1_brand"];
                    });
                    if (brand) {
                        return colorScale(brand["#1_brand"]);
                    } else {
                        return "gray";
                    }
                })
                .style("stroke", "black")
                .style("stroke-width", 0.5)
                .on("mouseover", function (d) {
                    var countryId = d.id;
                    var countryData = phoneData.find(function (item) {
                        return item.id === countryId;
                    });
                    if (countryData) {
                        var totalSmartphones = countryData.total_smartphones_users;
                        tooltip.style("display", "block")
                            .html("<strong style='text-transform: uppercase;'>" + d.properties.name + "</strong>, Total smartphones number: " + totalSmartphones)
                            .style("left", (d3.event.pageX + 10) + "px")
                            .style("top", (d3.event.pageY - 20) + "px");
                    } else {
                        tooltip.style("display", "none");
                    }
                })
                .on("mouseout", function () {
                    tooltip.style("display", "none");
                })
                .on("click", function (d) {
                    var countryId = d.id;
                    var countryData = phoneData.find(function (item) {
                        return item.id === countryId;
                    });
                    if (countryData) {
                        updateBarChart(countryData);
                    }
                });

            legendItems.on("click", function (d) {
                var selectedBrand = d;
                var index = selectedBrands.indexOf(selectedBrand);
                if (index > -1) {
                    selectedBrands.splice(index, 1);
                } else {
                    selectedBrands.push(selectedBrand);
                }
                updateMapColors(phoneData);
            });
            showTopBrandsBarChart(phoneData);
        });
    });
}




var margin = { top: 10, right: 50, bottom: 30, left: 40 },
    barWidth = width / 4 - margin.left - margin.right,
    barHeight = height / 3 - margin.top - margin.bottom;

var x = d3.scaleBand().range([0, barWidth]).padding(0.1),
    y = d3.scaleLinear().range([barHeight, 0]);

var svgBar = d3.select("#bar").append("svg")
    .attr("width", barWidth + margin.left + margin.right)
    .attr("height", barHeight + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(88,18)") 
 

    function updateBarChart(countryData) {
    var data = [
        { brand: countryData["#1_brand"], value: countryData["#1_market_share"] },
        { brand: countryData["#2_brand"], value: countryData["#2_market_share"] },
        { brand: countryData["#3_brand"], value: countryData["#3_market_share"] }
    ];

    x.domain(data.map(function (d) { return d.brand; }));
    y.domain([0,0.70]); 

    svgBar.selectAll(".bar").remove();
    svgBar.selectAll(".axis").remove();
    svgBar.selectAll("text").remove();

    svgBar.append("text")
        .attr("x", (barWidth/2)) 
        .attr("y", -5) 
        .attr("text-anchor", "middle")
        .style("font-size", "15px")
        .text("Top 3 Brands Market Share in " + countryData.country);

    svgBar.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", function (d) { return x(d.brand); })
        .attr("width", x.bandwidth())
        .attr("y", function (d) { return y(parseFloat(d.value.replace("%", "")) / 100); }) 
        .attr("height", function (d) { return barHeight - y(parseFloat(d.value.replace("%", "")) / 100); }) 
        .attr("fill", function (d) { return colorScale(d.brand); });


    svgBar.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + barHeight + ")")
        .call(d3.axisBottom(x));

    svgBar.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(y).tickFormat(d3.format(".0%")));
}





var barWidth2 = width / 5.57;
var barHeight2 = height/ 3.5;

var svgBar2 = d3.select("#bar2").append("svg") 
    .attr("width", barWidth2)
    .attr("height", barHeight2)
    .append("g")
    .attr("transform", "translate(88,50)");

d3.json("data/phones2.json").then(function (data) {
    data.sort((a, b) => b.total_smartphones_users.replace("M", "") - a.total_smartphones_users.replace("M", ""));
    var top10 = data.slice(0, 10);

    var x = d3.scaleLinear()
        .domain([0, d3.max(top10, function (d) { return +d.total_smartphones_users.replace("M", ""); })])
        .range([0, barWidth]);

    svgBar2.append("g")
        .attr("transform", "translate(0," + barHeight2 + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("text-anchor", "end");

    var y = d3.scaleBand()
        .range([0, barHeight2])
        .domain(top10.map(function (d) { return d.country; }))
        .padding(0.1);

    svgBar2.append("g")
        .call(d3.axisLeft(y));

    svgBar2.append("text")
        .attr("x", (barWidth/2)) 
        .attr("y", -10) 
        .attr("text-anchor", "middle")
        .style("font-size", "15px")
        .text("Top 10 Countries by Smartphone Usage");

    svgBar2.selectAll("myRect")
        .data(top10)
        .enter()
        .append("rect")
        .attr("x", 0)
        .attr("y", function (d) { return y(d.country); })
        .attr("width", function (d) { return x(+d.total_smartphones_users.replace("M", "")); })
        .attr("height", y.bandwidth())
        .attr("fill", "lightblue")
        .attr("id", function(d, i) { return "bar-" + i; }) 
    
        .on("mouseover", function(d, i) {
            d3.select("#bar-text-" + i).style("display", "block"); 
            
        })
        .on("mouseout", function(d, i) {
            d3.select("#bar-text-" + i).style("display", "none"); 
        });

    svgBar2.selectAll(".bar-text")
        .data(top10)
        .enter()
        .append("text")
        .attr("class", "bar-text") 
        .attr("id", function(d, i) { return "bar-text-" + i; }) 
        .attr("x", function(d) { return x(+d.total_smartphones_users.replace("M", "")) + 10; }) 
        .attr("y", function(d) { return y(d.country) + y.bandwidth() / 2; })
        .attr("dy", ".35em")
        .text(function(d) { return d.total_smartphones_users; })
        .style("display", "none"); 
});


function updateMapColors(phoneData) {
    svg.selectAll(".country-label").remove();
    svg.selectAll(".country")
        .style("fill", function (d) {
            var countryId = d.id;
            var brand = phoneData.find(function (item) {
                return item.id === countryId && item["#1_brand"];
            });
            if (brand && selectedBrands.length > 0) {
                if (selectedBrands.includes(brand["#1_brand"])) {
                    var brandColor = colorScale(brand["#1_brand"]); 
                    var marketShare = parseFloat(brand["#1_market_share"].replace("%", "")) / 100; 
                    return d3.interpolateRgb(brandColor, "white")(1 - marketShare); 
                } else {
                    return "gray"; 
                }
            } else if (brand) {
                return colorScale(brand["#1_brand"]); 
            } else {
                return "gray"; 
            }
        })
     
 
}

function showTopBrandsBarChart(phoneData) {
    var totalPhones = phoneData.reduce(function (acc, curr) {
        return acc + parseFloat(curr.total_smartphones_users.replace("M", ""));
    }, 0);

    var topBrands = getTopBrands(phoneData, 3);
    var topBrandData = topBrands.map(function (brand) {
        var brandCount = phoneData.filter(function (item) {
            return item["#1_brand"] === brand;
        }).reduce(function (acc, curr) {
            return acc + parseFloat(curr.total_smartphones_users.replace("M", ""));
        }, 0);
        return {
            brand: brand,
            value: brandCount / totalPhones
        };
    });

    x.domain(topBrandData.map(function (d) { return d.brand; }));
    y.domain([0, 0.5]);

    svgBar.selectAll(".bar").remove();
    svgBar.selectAll(".axis").remove();

    svgBar.append("text")
        .attr("x", (barWidth/2)) 
        .attr("y", -5) 
        .attr("text-anchor", "middle")
        .style("font-size", "15px")
        .text("Top 3 Brands Market Share");


    svgBar.selectAll(".bar")
        .data(topBrandData)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", function (d) { return x(d.brand); })
        .attr("width", x.bandwidth())
        .attr("y", function (d) { return y(d.value); })
        .attr("height", function (d) { return barHeight - y(d.value); })
        .attr("fill", function (d) { return colorScale(d.brand); });

    svgBar.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + barHeight + ")")
        .call(d3.axisBottom(x));

    svgBar.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(y).tickFormat(d3.format(".0%")));
}



function getTopBrands(data, n) {
    var brandCounts = {};
    data.forEach(function (item) {
        var brand = item["#1_brand"];
        if (brand && !brandCounts[brand]) {
            brandCounts[brand] = 0;
        }
        if (brand) {
            brandCounts[brand]++;
        }
    });

    var sortedBrands = Object.keys(brandCounts).sort(function (a, b) {
        return brandCounts[b] - brandCounts[a];
    });

    return sortedBrands.slice(0, n);
}



loadData();

window.addEventListener('resize', function () {
    width = window.innerWidth;
    height = window.innerHeight;
    svg.attr("width", width)
        .attr("height", height);
    projection.translate([width / 2.9, height / 2 + 50]);
    svg.selectAll('path').attr('d', path);
    barWidth = width / 4 - margin.left - margin.right;
    barHeight = height / 2 - margin.top - margin.bottom;
    svgBar.attr("width", barWidth)
        .attr("height", barHeight);
    x.range([0, barWidth]);
    svgBar.select('.x.axis')
        .attr("transform", "translate(0," + barHeight + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("text-anchor", "end");
    barWidth2 = width / 5.57;
    barHeight2 = height / 3.5;
    svgBar2.attr("width", barWidth2)
        .attr("height", barHeight2);
});



