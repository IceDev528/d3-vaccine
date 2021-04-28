var width = 960;
var height = 500;

// D3 Projection
var projection = d3.geo.albersUsa()
				   .translate([width/2, height/2])    // translate to center of screen
				   .scale([1000]);          // scale things down so see entire US
        
// Define path generator
var path = d3.geo.path()               // path generator that will convert GeoJSON to SVG paths
		  	 .projection(projection);  // tell path generator to use albersUsa projection

		
// Define linear scale for output
var color = d3.scale.linear()
			  .range(["#c2e1f4","#86c3e8","#55acdf","#306785"]);

var legendText = ["Group 4:  p > 23%", "Group 3:  21% < p <= 23%", "Group 2:  19% < p <= 21%", "Group 1: 0 <= p <= 19%"];

//Create SVG element and append map to the SVG
var svg = d3.select("#svg_chart")
			.append("svg")
			.attr("width", width)
    .attr("height", height);
            
// Load in my states data!
d3.csv("data/vaccine.csv", function (data) {
    console.log(data);
    color.domain([1,2,3,4]); // setting the range of the input data

    // Load GeoJSON data and merge with states data
    d3.json("data/us-states.json", function(json) {

    // Loop through each state data value in the .csv file
    for (var i = 0; i < data.length; i++) {

        // Grab State Name
        var dataState = data[i].state;

        // Grab data value 
        var dataValue = data[i].one_dose;
        var dataFull = data[i].full;
        
        // Find the corresponding state inside the GeoJSON
        for (var j = 0; j < json.features.length; j++)  {
            var jsonState = json.features[j].properties.name;

            if (dataState == jsonState) {

            // Copy the data value into the JSON
            json.features[j].properties.one_dose = dataValue; 
            json.features[j].properties.full = dataFull; 
            // Stop looking through the JSON
            break;
            }
        }
    }
        function tooltipHtml(n, d) {	/* function to create html content string in tooltip div. */
        return "<h4>"+n+"</h4><table>"+
        "<tr><td>At least one dose</td><td>"+(d.one_dose)+"</td></tr>"+
        "<tr><td>Fully vaccinated</td><td>"+(d.full)+"</td></tr>"+
        "</table>";
    }
    // Bind the data to the SVG and create one path per GeoJSON feature
    svg.selectAll("path")
        .data(json.features)
        .enter()
        .append("path")
        .attr("d", path)
        .style("stroke", "#fff")
        .style("stroke-width", "1")
        .style("fill", function(d) {

        // Get data value
            var value = d.properties.one_dose;
            var flag = 0;
            if (value <= 19 && value > 0) flag = 1;
            else if (value > 19 && value <= 21) flag = 2;
            else if (value > 21 && value <= 23) flag = 3;
            else if (value > 23) flag = 4;

            if (flag) {
                //If value exists…
                return color(flag);
            } else {
                console.log("undefined value");
                //If value is undefined…
                return "#000";
            }
        })
        .on("mousemove", function (d) {
            d3.select("#tooltip").transition().duration(200).style("opacity", .9);      
			d3.select("#tooltip").html(tooltipHtml(d.properties.name, d.properties))  
				.style("left", (d3.event.pageX) + "px")     
				.style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            d3.select("#tooltip").transition().duration(500).style("opacity", 0);   
        });

    // Modified Legend Code from Mike Bostock: http://bl.ocks.org/mbostock/3888852
    var legend = d3.select("#svg_chart").append("svg")
      			.attr("class", "legend")
     			.attr("width", 200)
    			.attr("height", 200)
   				.selectAll("g")
   				.data(color.domain().slice().reverse())
   				.enter()
   				.append("g")
     			.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  	legend.append("rect")
   		  .attr("width", 18)
   		  .attr("height", 18)
   		  .style("fill", color);

  	legend.append("text")
  		  .data(legendText)
      	  .attr("x", 24)
      	  .attr("y", 9)
      	  .attr("dy", ".35em")
      	  .text(function(d) { return d; });
	});
});