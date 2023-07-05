//checking the file is loaded correctly
console.log("app.js loaded");

//using the D3 library to read the sample file  
d3.json("./samples.json").then(function(data) {
  //accessing the required data
  const samples = data.samples;
  const metadata = data.metadata;

  //update data based on selection of test subject
  function updateChart(selectedIndividual) {
    //filter the data for the selection
    const selectedSample = samples.find(sample => sample.id === selectedIndividual);

    //extraction of the topo OTUs
    const top10OTUs = selectedSample.otu_ids.slice(0, 10);
    const top10Values = selectedSample.sample_values.slice(0, 10);
    const top10Labels = selectedSample.otu_labels.slice(0, 10);

    //horizontal bar chart
    const barTrace = {
      x: top10Values.reverse(),
      y: top10OTUs.map(otu => `OTU ${otu}`).reverse(),
      text: top10Labels.reverse(),
      type: "bar",
      orientation: "h"
    };
    const barData = [barTrace];
    const barLayout = {
      title: "Top 10 OTUs",
      yaxis: {
        automargin: true
      }
    };
    Plotly.newPlot("bar", barData, barLayout);

    //bubble chart
    const bubbleTrace = {
      x: selectedSample.otu_ids,
      y: selectedSample.sample_values,
      text: selectedSample.otu_labels,
      mode: "markers",
      marker: {
        size: selectedSample.sample_values,
        color: selectedSample.otu_ids,
      }
    };
    const bubbleData = [bubbleTrace];
    const bubbleLayout = {
      xaxis: {
        title: "OTU ID"
      }
    };
    Plotly.newPlot("bubble", bubbleData, bubbleLayout);

    //display demographic info
    displayMetadata(selectedIndividual);
  }
  
  //get the metadata for the selected subject
  function displayMetadata(selectedIndividual) {
    const selectedMetadata = metadata.find(meta => meta.id === parseInt(selectedIndividual));
    const metadataElement = d3.select("#sample-metadata");

    //clear metadata for wehn selection changes
    metadataElement.html("");

    //appending keys and their values as paragraphs
    Object.entries(selectedMetadata).forEach(([key, value]) => {
      metadataElement.append("p")
        .text(`${key}: ${value}`);
    });
  }

  //dropdown menu
  function optionChanged(value) {
    updateChart(value);
  }

  //set so it starts with the first individual
  const initialIndividual = samples[0].id;
  updateChart(initialIndividual);

  //populate dropdown menu
  const dropdown = d3.select("#selDataset");
  dropdown.selectAll("option")
    .data(samples.map(sample => sample.id))
    .enter()
    .append("option")
    .text(d => d)
    .attr("value", d => d);
  dropdown.on("change", function() {
    const selectedValue = d3.select(this).property("value");
    optionChanged(selectedValue);
  });
});
