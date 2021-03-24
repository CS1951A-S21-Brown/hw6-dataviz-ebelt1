//Dimensions
const MAX_WIDTH = Math.max(1080, window.innerWidth);
const MAX_HEIGHT = 720;
const margin = {top: 40, right: 100, bottom: 40, left: 250};

//Colors
let blue = ["#66a0e2", "#0D1A7E", "#0576F7", "#5DEFFF"];
let pink = ["#F9B9EB", "#BE1299", "#FF00EE", "#9E0064"]
let purple = ["#A15390", "#9480CA", "#C0A4CD", "#3A0D76"];
let green = ["#BFD805", "#96C710", "#1C3D02", "#24A208"];
let orange = ["#ED8916","#C55900", "#E48E79", "#B73D1F"];
let red = ["#CD5B5B","#E51717", "#840202", "#B53C14"];
let yellow = ["#FFC800", "#D6AB12", "#FAD962", "#FFEC19"]
var colors = [blue, pink, purple, green, orange, red, yellow];
var current_color = colors[0][0];

//Graph1: Number of Movies Per Genre
let graph_1_width = (MAX_WIDTH / 2), graph_1_height = 400;

let svg1 = d3.select("#graph1")
    .append("svg")
    .attr("width", graph_1_width)     
    .attr("height", graph_1_height)     
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

let tooltip1 = d3.select("#graph1")    
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

let countRef1 = svg1.append("g");

let y_axis_label1 = svg1.append("g");

let title1 = svg1.append("text")
    .attr("transform", `translate(${(graph_1_width - margin.left - margin.right)/2}, ${-10})`)       
    .style("text-anchor", "middle")
    .style("font-size", 15);

svg1.append("text")
    .attr("transform", `translate(${(-2.5*margin.left)/4}, ${(graph_1_height - margin.top - margin.bottom)/2+3})`)       
    .style("text-anchor", "middle")
    .text("Genre");

svg1.append("text")
    .attr("transform", `translate(${2*(graph_1_width - margin.left - margin.right)/3}, ${(graph_1_height - margin.top - margin.bottom)})`)       
    .style("text-anchor", "middle")
    .text("Count");

//This function setData1 controls the button in graph 1. 
//It allows the graph to switch between displaying the number of titles for the 
//most and least popular genres.
function setData1(index, add_to_title) {

    d3.csv("./data/netflix.csv").then(function(data) {

        let all_genres = [].concat.apply([], data.map(function(d) {
            return d.listed_in.split(", ");}));

        var all_genres_helper = all_genres;

        var unique_genres= all_genres_helper.filter((genre, i) => all_genres_helper.indexOf(genre) === i);

        var num_titles1 = [];

        for (i = 0; i < unique_genres.length; i++) {
            num_titles1.push(all_genres.filter(genre => genre === unique_genres[i]).length);
        }
        var data1 = unique_genres.map(function(g, i) {
            return {genre: g, count: num_titles1[i]};
        });

        //The set of the top half of genres and their respective counts of titles
        data1_most_popular = cleanData(data1, function(a, b){
            return parseInt(b.count)-parseInt(a.count);}, 0, Math.round(num_titles1.length/2));

        //The set of the bottom half of genres and their respective counts of titles
        data1_less_viewed = cleanData(data1, function(a, b){
            return parseInt(b.count)-parseInt(a.count);}, Math.round(num_titles1.length/2), num_titles1.length);
        
        data1_sets = [data1_most_popular, data1_less_viewed]
        
        let x1 = d3.scaleLinear()
        .domain([0, d3.max(data1_sets[index], function(d) {
            return d["count"];})])
        .range([0, graph_1_width - margin.left - margin.right]);

        let y1 = d3.scaleBand()
        .domain(data1_sets[index].map(function(d) {
            return d["genre"];}))
        .range([0, graph_1_height - margin.top - margin.bottom])
        .padding(0.1);

        y_axis_label1.call(d3.axisLeft(y1).tickSize(0).tickPadding(10));

        //Mouseover and mouseout functions that assist with the tooltip.
        let mouseover1 = function(d) {
            let color_span = `<span style="color: ${d3.rgb(d3.select(this).attr("fill")).darker(0.75)};">`;
            d3.select(this).attr("fill", function() {
                return d3.rgb(d3.select(this).attr("fill")).darker(0.75);});
            let html = `${d.genre}<br/>
                ${color_span}${d.count + " Titles"}</span>`; 
            tooltip1.html(html)
                .style("left", `${2*graph_1_width/3}px`)
                .style("top", `${(graph_1_height - margin.top - margin.bottom)/2+3}px`)
                .style("box-shadow", `2px 2px 5px ${d3.rgb(d3.select(this).attr("fill")).darker(0.75)}`)
                .transition()
                .duration(200)
                .style("opacity", 0.9);
        };
            
        let mouseout1 = function(d) {
            d3.select(this).attr("fill", function() {
                return d3.rgb(d3.select(this).attr("fill")).brighter(0.75);});
            tooltip1.transition()
                .duration(200)
                .style("opacity", 0);
        };

        //Adding the bars to the graph
        let bars1 = svg1.selectAll("rect").data(data1_sets[index]);

        bars1.enter()
            .append("rect")
            .merge(bars1)
            .on("mouseover", mouseover1)
            .on("mouseout", mouseout1)
            .transition()
            .duration(1000)
            .attr("x", x1(0))
            .attr("y", function(d) {
                return y1(d["genre"]);
            })               
            .attr("width", function(d) {
                return x1(d["count"]);
            })
            .attr("height",  y1.bandwidth())
            .attr("fill", current_color);

        //Adding the count to the graph
        let counts1 = countRef1.selectAll("text").data(data1_sets[index]);
    
        counts1.enter()
            .append("text")
            .merge(counts1)
            .transition()
            .duration(1000)  
            .attr("x", function(d) { return x1(d["count"]) + 10; })       
            .attr("y", function(d) { return y1(d["genre"]) + 10; })    
            .style("text-anchor", "start")
            .text(function(d) {
                return d["count"];
            });

        title1.text("Number of Titles Per Genre on Netflix" + add_to_title);

        //Exiting out of the bars and counts so that this information is removed when the 
        //user clicks the button that changes the genres displayed in the bar graph.
        bars1.exit().remove();
        counts1.exit().remove();
        x1.exit;
        y1.exit;
    });
};

//When the dashboard is first opened, this is the default display of the bar graph.
setData1(0, ': Most Popular Genres');


//Graph2: Average Runtime of Movies by Release Year.
let graph_2_width = (3*MAX_WIDTH / 5), graph_2_height =  250;

let svg2 = d3.select("#graph2")
    .append("svg")
    .attr("width", graph_2_width)     
    .attr("height", graph_2_height)     
    .append("g")
    .attr("transform", `translate(${margin.left - 100},${margin.top})`);

let tooltip2 = d3.select("#graph2")    
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

svg2.append("text")
    .attr("transform", `translate(${(graph_2_width - margin.left - margin.right)/2}, ${-10})`)       
    .style("text-anchor", "middle")
    .style("font-size", 15)
    .text("Average Netflix Movie Duration By Year");

svg2.append("text")
    .attr("transform", `translate(${-55}, ${(graph_1_height - 4.5 * margin.top - margin.bottom)/2})`)       
    .style("text-anchor", "middle")
    .text("Duration");

svg2.append("text")
    .attr("transform", `translate(${(graph_2_width - margin.left - margin.right)/2}, ${200})`)       
    .style("text-anchor", "middle")
    .text("Year");

d3.csv("./data/netflix.csv").then(function(data) {

    //Data retrieval for movie durations in each year (note, TV shows not included)
    var movies_and_duration = new Object();
    for (i = 0; i < data.length; i++) {
        new_duration = parseInt(data[i].duration);
        if ((!(parseInt(data[i].release_year) in movies_and_duration)) && (data[i].duration.split(" ").includes("min"))) {
            movies_and_duration[parseInt(data[i].release_year)] = [new_duration];
        } else if ((parseInt(data[i].release_year) in movies_and_duration) && (data[i].duration.split(" ").includes("min"))) {
            old_value = movies_and_duration[parseInt(data[i].release_year)];
            movies_and_duration[parseInt(data[i].release_year)] = old_value.concat([new_duration]);
        };
    };
    
    years = Object.keys(movies_and_duration);

    min = Math.min.apply(Math, years);

    max = Math.max.apply(Math, years);

    for (i = min; i < (max + 1); i++) {
        if ((i in movies_and_duration)) {
            duration_array = movies_and_duration[i];
            average_movie_duration = duration_array.reduce((d1, d2) => (d1 + d2))/(duration_array.length);
            movies_and_duration[i] = average_movie_duration;
        };
    };

    years = Object.keys(movies_and_duration);

    var data2 = years.map(function(y) {
        return {year: parseInt(y), duration: movies_and_duration[y]};
    });

    //Final data set with average movie duration for each year and sorted by year
    data2 = cleanData(data2, function(a, b){return parseInt(b.year)-parseInt(a.year);}, 0, years.length);

    let x2 = d3.scaleTime().domain([Date.parse(min), Date.parse(max)]).range([0, graph_2_width - margin.left - margin.right]);
    svg2.append("g").attr("transform", `translate(0, ${graph_2_height - margin.top - margin.bottom})`).call(d3.axisBottom(x2));

    let y2 = d3.scaleLinear().domain([d3.max(data2, function(d) { 
        return d.duration; }), 0]).range([0, graph_2_height - margin.top - margin.bottom]);
    svg2.append("g").call(d3.axisLeft(y2));

    //Mouseover and mouseout functions that assist with the tooltip
    let mouseover2 = function(d) {
        let color_span = `<span style="color: ${d3.rgb(d3.select(this).style("fill")).darker(0.75)};">`;
        d3.select(this).attr("r", 6).style("fill", function() {
            return d3.rgb(d3.select(this).style("fill")).darker(0.75);});
        let html = `${d.year}<br/>${color_span}${"Average Duration: " + Math.round(d.duration)}</span>`; 
        tooltip2.html(html)
            .style("left", `${d3.event.pageX}px`)
            .style("top", `${d3.event.pageY - 100}px`)
            .style("box-shadow", `2px 2px 5px ${d3.rgb(d3.select(this).style("fill")).darker(0.75)}`)
            .style("background","#FFFFFF")
            .transition()
            .duration(200)
            .style("opacity", 0.9);
        };
            
    let mouseout2 = function(d) {
        d3.select(this).attr("r", 4).style("fill", function() {
            return d3.rgb(d3.select(this).style("fill")).brighter(0.75);});
        tooltip2.transition()
            .duration(200)
            .style("opacity", 0);
        };

    //Adding the dots to the graph.
    let dots = svg2.selectAll("dot").data(data2);
    dots.enter()
        .append("circle")
        .on("mouseover", mouseover2)
        .on("mouseout", mouseout2)
        .transition()
        .duration(1000)
        .attr("cx", function (d) { return x2(Date.parse(d.year)); })      
        .attr("cy", function (d) { return y2(d.duration); })      
        .attr("r", 4)       
        .style("fill",  function (d) { return colors[0][Math.floor(Math.random() * 4)]; 
        });
});

//Graph3: Actor Flowchart
let graph_3_width = MAX_WIDTH / 2, graph_3_height = MAX_HEIGHT;

let svg3 = d3.select("#graph3")
    .append("svg")
    .attr("width", graph_3_width)     
    .attr("height", graph_3_height)     
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

let tooltip3 = d3.select("#graph3")    
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

let tooltip4 = d3.select("#graph3")    
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

svg3.append("text")
    .attr("transform", `translate(${(graph_3_width - 1.75*margin.left - margin.right)/2}, ${(-10)})`)       
    .style("text-anchor", "middle")
    .style("font-size", 15)
    .text("Popular Actors Who Have Appeared in a Title Together on Netflix");

d3.csv("./data/netflix.csv").then(function(data) {

    //Data retrieval for each actor (and number of times they appar) and 
    //each pair of actors (and number of times they have worked together)
    var actors_and_count = new Object();

    var partners_and_count = new Object();

    for (i = 0; i < data.length; i++) {
        cast_array = data[i].cast.split(", ");
        for (j = 0; j < cast_array.length; j++) {
            for (k = 0; k < cast_array.length; k++) {
                if ((!([cast_array[j], cast_array[k]] in partners_and_count)) && (cast_array[j] < cast_array[k])) {
                    partners_and_count[[cast_array[j], cast_array[k]]] = 1;
                } else if ((([cast_array[j], cast_array[k]] in partners_and_count)) && (cast_array[j] < cast_array[k])) {
                    partners_and_count[[cast_array[j], cast_array[k]]] = partners_and_count[[cast_array[j], cast_array[k]]] + 1;
                }
            }
            if (!(cast_array[j] in actors_and_count)) {
                actors_and_count[cast_array[j]] = 1;
            } else {
                actors_and_count[cast_array[j]] = actors_and_count[cast_array[j]] + 1;
            };
        };
    };

    delete actors_and_count[""];

    actors = Object.keys(actors_and_count);
    
    var nodes1 = actors.map(function(a) {
        return {actor: a, count: actors_and_count[a]};
    });

    //Final set of nodes (where each node represents an actor); there are 50 actors and
    //each one is in the top 50 actors by count of titles they have been in.
    nodes1 = cleanData(nodes1, function(a, b){
        return parseInt(b.count)-parseInt(a.count);}, 0, 50);

    popular_actors = nodes1.map(function(d) {
        return d["actor"];});

    //Creation of links where each link represents a source and target node (where each is an actor).
    //A link only appears between two actors if the actors have appeared in at least one title together.
    var links1 = [];

    for (i = 0; i < popular_actors.length; i++) {
        for (j = 0; j < popular_actors.length; j++) {
            if ([popular_actors[i], popular_actors[j]] in partners_and_count) {
                links1.push({source: popular_actors[i], target: popular_actors[j]});
            };
         };
    };

    //Final data set with nodes and links
    data3 = {nodes: nodes1, links: links1};

    //Mouseover and mouseout function that controls the tooltip corresponding to the links
    let mouseover3 = function(d) {
        let html = `${d.source.actor + " <-> " + d.target.actor}<br/>
            ${"Titles Together: " + partners_and_count[[d.source.actor, d.target.actor]]}</span>`; 
        d3.select(this).style("stroke-width", '4px');
        tooltip3.html(html)
            .style("left", `${d3.event.pageX - 750}px`)
            .style("top", `${(d3.event.pageY - 100)}px`)
            .style("box-shadow", `2px 2px 5px ${d3.rgb(d3.select(this).style("fill")).darker(0.75)}`)
            .style("background","#FFFFFF")
            .transition()
            .duration(200)
            .style("opacity", 0.9);
    };
        
    let mouseout3 = function(d) {
        d3.select(this).style("stroke-width", '1px');
        tooltip3.transition()
            .duration(200)
            .style("opacity", 0);
    };

    //Mouseover and mouseout function that controls the tooltip corresponding to the nodes
    let mouseover4 = function(d) {
        let html = `${d.actor}<br/></span>`; 
        d3.select(this).attr("r", 14);
        tooltip4.html(html)
            .style("left", `${d3.event.pageX - 750}px`)
            .style("top", `${(d3.event.pageY) - 100}px`)
            .style("box-shadow", `2px 2px 5px ${d3.rgb(d3.select(this).style("fill")).darker(0.75)}`)
            .style("background","#FFFFFF")
            .transition()
            .duration(200)
            .style("opacity", 0.9);
    };
    
    let mouseout4 = function(d) {
        d3.select(this).attr("r", 10);
        tooltip4.transition()
            .duration(200)
            .style("opacity", 0);
    };

    //Adding the links to the graph.
    let links2 = svg3.selectAll("line")
        .data(data3.links)
        .enter()
        .append("line")
        .on("mouseover", mouseover3) 
        .on("mouseout", mouseout3)  
        .style("stroke", "#CFCFCF");
    
    //Adding the nodes to the graph.
    let nodes2 = svg3.selectAll("circle")
        .data(data3.nodes)
        .enter()
        .append("circle")
        .attr("r", 10)
        .style("fill", function (d) { return colors[0][Math.floor(Math.random() * 4)];})
        .on("mouseover", mouseover4) 
        .on("mouseout", mouseout4);

    //This function adds the links and nodes to the graph and helps position them.
    //It's called when forcing the simulation of the network (below).
    function linksAndNodes() {
        links2.transition()
            .duration(1000)
            .attr("x1", function(d) { return d.source.x;})
            .attr("y1", function(d) { return d.source.y;})
            .attr("x2", function(d) { return d.target.x;})
            .attr("y2", function(d) { return d.target.y;});
        nodes2.transition()
            .duration(1000)
            .attr("cx", function(d) { return d.x + 1.5;})
            .attr("cy", function(d) { return d.y - 1.5;});
    };

    //Creating the links, center, and strength of graph
    d3.forceSimulation(data3.nodes)                 
        .force("link", d3.forceLink().id(function(d) { return d.actor; }).links(data3.links))
        .force("charge", d3.forceManyBody().strength(-250).distanceMax(100))         
        .force("center", d3.forceCenter((graph_3_width - margin.left - 2*margin.right)/2, graph_3_height/2))   
        .on("tick", linksAndNodes);
});

//This function controls the color buttons on the top of the graph. Using the colors described at the top
//of this file, this function sets the fill of the bars (in graph 1), the dots (in graph 2), and the 
//nodes (in graph 3) to the selected color. 
function setData2(color_index) {
    chosen_color = colors[color_index]
    svg1.selectAll("rect").attr("fill", chosen_color[0]);
    svg2.selectAll("circle").style("fill", function (d) { return chosen_color[Math.floor(Math.random() * 4)]; });
    svg3.selectAll("circle").style("fill", function (d) { return chosen_color[Math.floor(Math.random() * 4)]; });
    current_color = chosen_color[0];
};

//This function helps to sort, cut, and clean the data. It is used to help clean the data in all three graphs. 
function cleanData(data, comparator, start, end) {
    data = data.sort((a, b) => comparator(a, b));
    data = data.slice(start, end);
    return data;
};
