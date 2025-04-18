/**
 * Visualizations Module
 * Creates interactive visualizations using Plotly.js
 */

// Declare Plotly as a global variable
var Plotly = window.Plotly

/**
 * Creates a bar chart showing variant counts by gene
 * @param {string} elementId - ID of the container element
 */
function createVariantsByGeneChart(elementId) {
  const { geneData } = window.dataProcessor

  if (!geneData.isLoaded) {
    console.error("Cannot create chart: data not loaded")
    return
  }

  const genes = geneData.genes
  const variantCounts = genes.map((gene) => (geneData.summaries[gene] ? geneData.summaries[gene].totalVariants : 0))

  const data = [
    {
      x: genes,
      y: variantCounts,
      type: "bar",
      marker: {
        color: "#6d5dfc",
        opacity: 0.7,
      },
    },
  ]

  const layout = {
    title: "Número Total de Variantes por Gen",
    xaxis: {
      title: "Gen",
    },
    yaxis: {
      title: "Número de Variantes",
    },
    margin: {
      l: 50,
      r: 20,
      t: 50,
      b: 50,
    },
  }

  Plotly.newPlot(elementId, data, layout)
}

/**
 * Creates a stacked bar chart showing consequence types by gene
 * @param {string} elementId - ID of the container element
 */
function createConsequenceTypesChart(elementId) {
  const { geneData } = window.dataProcessor

  if (!geneData.isLoaded) {
    console.error("Cannot create chart: data not loaded")
    return
  }

  const genes = geneData.genes

  // Get all unique consequence types across all genes
  const allConsequenceTypes = new Set()
  genes.forEach((gene) => {
    if (geneData.summaries[gene] && geneData.summaries[gene].consequenceCounts) {
      Object.keys(geneData.summaries[gene].consequenceCounts).forEach((type) => {
        allConsequenceTypes.add(type)
      })
    }
  })

  const consequenceTypes = Array.from(allConsequenceTypes)

  // Create traces for each consequence type
  const traces = consequenceTypes.map((type) => {
    return {
      x: genes,
      y: genes.map((gene) => {
        if (geneData.summaries[gene] && geneData.summaries[gene].consequenceCounts) {
          return geneData.summaries[gene].consequenceCounts[type] || 0
        }
        return 0
      }),
      name: type,
      type: "bar",
    }
  })

  const layout = {
    title: "Distribución de Tipos de Consecuencia por Gen",
    barmode: "stack",
    xaxis: {
      title: "Gen",
    },
    yaxis: {
      title: "Número de Variantes",
    },
    legend: {
      title: {
        text: "Tipo de Consecuencia",
      },
    },
    margin: {
      l: 50,
      r: 20,
      t: 50,
      b: 50,
    },
  }

  Plotly.newPlot(elementId, traces, layout)
}

/**
 * Creates a bar chart showing significant variants by gene
 * @param {string} elementId - ID of the container element
 */
function createSignificantVariantsChart(elementId) {
  const { geneData } = window.dataProcessor

  if (!geneData.isLoaded) {
    console.error("Cannot create chart: data not loaded")
    return
  }

  const genes = geneData.genes

  // Prepare data for significant variants
  const significantCounts = genes.map((gene) => (geneData.summaries[gene] ? geneData.summaries[gene].significant : 0))

  // Prepare data for case-only variants
  const caseOnlyCounts = genes.map((gene) => (geneData.summaries[gene] ? geneData.summaries[gene].caseOnly : 0))

  const data = [
    {
      x: genes,
      y: significantCounts,
      type: "bar",
      name: "Variantes Significativas (p<0.05)",
      marker: {
        color: "#ff7070",
      },
    },
    {
      x: genes,
      y: caseOnlyCounts,
      type: "bar",
      name: "Variantes Exclusivas en Casos",
      marker: {
        color: "#70ff70",
      },
    },
  ]

  const layout = {
    title: "Variantes Significativas y Exclusivas por Gen",
    barmode: "group",
    xaxis: {
      title: "Gen",
    },
    yaxis: {
      title: "Número de Variantes",
    },
    legend: {
      x: 0,
      y: 1.1,
      orientation: "h",
    },
    margin: {
      l: 50,
      r: 20,
      t: 50,
      b: 50,
    },
  }

  Plotly.newPlot(elementId, data, layout)
}

/**
 * Creates a heatmap showing consequence distribution by gene
 * @param {string} elementId - ID of the container element
 */
function createConsequenceDistributionChart(elementId) {
  const { geneData } = window.dataProcessor

  if (!geneData.isLoaded) {
    console.error("Cannot create chart: data not loaded")
    return
  }

  const genes = geneData.genes

  // Get all unique consequence types across all genes
  const allConsequenceTypes = new Set()
  genes.forEach((gene) => {
    if (geneData.summaries[gene] && geneData.summaries[gene].consequenceCounts) {
      Object.keys(geneData.summaries[gene].consequenceCounts).forEach((type) => {
        allConsequenceTypes.add(type)
      })
    }
  })

  const consequenceTypes = Array.from(allConsequenceTypes)

  // Create z values for heatmap
  const zValues = consequenceTypes.map((type) => {
    return genes.map((gene) => {
      if (geneData.summaries[gene] && geneData.summaries[gene].consequenceCounts) {
        return geneData.summaries[gene].consequenceCounts[type] || 0
      }
      return 0
    })
  })

  // Calculate percentages for each gene
  const zPercent = consequenceTypes.map((type, i) => {
    return genes.map((gene, j) => {
      const total = geneData.summaries[gene] ? geneData.summaries[gene].totalVariants : 0
      return total > 0 ? ((zValues[i][j] / total) * 100).toFixed(1) + "%" : "0%"
    })
  })

  const data = [
    {
      z: zValues,
      x: genes,
      y: consequenceTypes,
      type: "heatmap",
      colorscale: "Viridis",
      showscale: true,
      text: zPercent,
      hoverinfo: "text+y+x",
      hovertemplate: "%{y} en %{x}: %{z} variantes (%{text})<extra></extra>",
    },
  ]

  const layout = {
    title: "Distribución de Tipos de Consecuencia por Gen",
    xaxis: {
      title: "Gen",
    },
    yaxis: {
      title: "Tipo de Consecuencia",
    },
    margin: {
      l: 150,
      r: 20,
      t: 50,
      b: 50,
    },
  }

  Plotly.newPlot(elementId, data, layout)
}

/**
 * Creates a scatter plot comparing case vs control frequencies for a gene
 * @param {string} elementId - ID of the container element
 * @param {string} gene - Gene name
 */
function createFrequencyComparisonChart(elementId, gene) {
  const { geneData } = window.dataProcessor

  if (!geneData.isLoaded || !geneData.data[gene]) {
    console.error(`Cannot create chart: data for ${gene} not loaded`)
    return
  }

  const data = geneData.data[gene]

  // Filter out variants with missing frequencies
  const filteredData = data.filter((v) => !isNaN(v.afCase) && !isNaN(v.afControl) && (v.afCase > 0 || v.afControl > 0))

  // Create traces for different consequence types
  const consequenceTypes = [...new Set(filteredData.map((v) => v.consequenceType))]

  const traces = consequenceTypes.map((type) => {
    const typeData = filteredData.filter((v) => v.consequenceType === type)

    return {
      x: typeData.map((v) => v.afControl),
      y: typeData.map((v) => v.afCase),
      text: typeData.map(
        (v) =>
          `ID: ${v.variantId}<br>` +
          `Consecuencia: ${v.consequence}<br>` +
          `AF Caso: ${v.afCase.toExponential(2)}<br>` +
          `AF Control: ${v.afControl.toExponential(2)}`,
      ),
      mode: "markers",
      type: "scatter",
      name: type,
      marker: {
        size: 10,
        opacity: 0.7,
      },
      hoverinfo: "text",
    }
  })

  // Add diagonal line
  const maxVal = Math.max(...filteredData.map((v) => Math.max(v.afCase || 0, v.afControl || 0)))

  traces.push({
    x: [0, maxVal],
    y: [0, maxVal],
    mode: "lines",
    type: "scatter",
    name: "Equivalencia",
    line: {
      dash: "dash",
      color: "gray",
    },
    hoverinfo: "none",
  })

  const layout = {
    title: `Frecuencia Alélica: Casos vs Controles (${gene})`,
    xaxis: {
      title: "Frecuencia Alélica en Controles",
      type: "log",
      autorange: true,
    },
    yaxis: {
      title: "Frecuencia Alélica en Casos",
      type: "log",
      autorange: true,
    },
    legend: {
      title: {
        text: "Tipo de Consecuencia",
      },
    },
    margin: {
      l: 60,
      r: 20,
      t: 50,
      b: 60,
    },
    hovermode: "closest",
  }

  Plotly.newPlot(elementId, traces, layout)
}

/**
 * Creates a volcano plot for a gene
 * @param {string} elementId - ID of the container element
 * @param {string} gene - Gene name
 */
function createVolcanoPlot(elementId, gene) {
  const { geneData } = window.dataProcessor

  if (!geneData.isLoaded || !geneData.data[gene]) {
    console.error(`Cannot create chart: data for ${gene} not loaded`)
    return
  }

  const data = geneData.data[gene]

  // Filter out variants with missing p-values or estimates
  const filteredData = data.filter((v) => !isNaN(v.pVal) && !isNaN(v.estimate))

  // Separate significant and non-significant variants
  const significant = filteredData.filter((v) => v.pVal < 0.05)
  const nonSignificant = filteredData.filter((v) => v.pVal >= 0.05)

  const traces = [
    {
      x: nonSignificant.map((v) => v.estimate),
      y: nonSignificant.map((v) => -Math.log10(v.pVal)),
      text: nonSignificant.map(
        (v) =>
          `ID: ${v.variantId}<br>` +
          `Consecuencia: ${v.consequence}<br>` +
          `P-valor: ${v.pVal.toExponential(2)}<br>` +
          `Estimado: ${v.estimate.toFixed(3)}`,
      ),
      mode: "markers",
      type: "scatter",
      name: "No Significativo",
      marker: {
        color: "gray",
        size: 8,
      },
      hoverinfo: "text",
    },
  ]

  // Add significant variants if any
  if (significant.length > 0) {
    traces.push({
      x: significant.map((v) => v.estimate),
      y: significant.map((v) => -Math.log10(v.pVal)),
      text: significant.map(
        (v) =>
          `ID: ${v.variantId}<br>` +
          `Consecuencia: ${v.consequence}<br>` +
          `P-valor: ${v.pVal.toExponential(2)}<br>` +
          `Estimado: ${v.estimate.toFixed(3)}`,
      ),
      mode: "markers",
      type: "scatter",
      name: "Significativo (p<0.05)",
      marker: {
        color: "red",
        size: 10,
      },
      hoverinfo: "text",
    })
  }

  const layout = {
    title: `Gráfico de Volcán: Significancia de Variantes (${gene})`,
    xaxis: {
      title: "Estimación del Efecto",
      zeroline: true,
      zerolinecolor: "#969696",
      zerolinewidth: 1,
    },
    yaxis: {
      title: "-log10(P-valor)",
    },
    shapes: [
      {
        type: "line",
        y0: -Math.log10(0.05),
        y1: -Math.log10(0.05),
        x0: Math.min(...filteredData.map((v) => v.estimate)),
        x1: Math.max(...filteredData.map((v) => v.estimate)),
        line: {
          color: "red",
          dash: "dash",
        },
      },
    ],
    legend: {
      x: 0,
      y: 1,
      orientation: "h",
    },
    margin: {
      l: 60,
      r: 20,
      t: 50,
      b: 60,
    },
    hovermode: "closest",
  }

  Plotly.newPlot(elementId, traces, layout)
}

/**
 * Creates a genomic distribution plot for a gene
 * @param {string} elementId - ID of the container element
 * @param {string} gene - Gene name
 */
function createGenomicDistributionPlot(elementId, gene) {
  const { geneData } = window.dataProcessor

  if (!geneData.isLoaded || !geneData.data[gene]) {
    console.error(`Cannot create chart: data for ${gene} not loaded`)
    return
  }

  const data = geneData.data[gene]

  // Filter out variants with missing positions
  const filteredData = data.filter((v) => v.position !== null)

  // Create traces for different consequence types
  const consequenceTypes = [...new Set(filteredData.map((v) => v.consequenceType))]

  const traces = consequenceTypes.map((type) => {
    const typeData = filteredData.filter((v) => v.consequenceType === type)

    return {
      x: typeData.map((v) => v.position),
      y: Array(typeData.length).fill(type),
      text: typeData.map(
        (v) =>
          `ID: ${v.variantId}<br>` +
          `Consecuencia: ${v.consequence}<br>` +
          `Casos: ${v.acCase}<br>` +
          `Controles: ${v.acControl}`,
      ),
      mode: "markers",
      type: "scatter",
      name: type,
      marker: {
        size: 10,
        symbol: typeData.map((v) => (v.acCase > 0 ? "circle" : "square")),
      },
      hoverinfo: "text",
    }
  })

  const layout = {
    title: `Distribución Genómica de Variantes (${gene})`,
    xaxis: {
      title: `Posición en Cromosoma`,
    },
    yaxis: {
      title: "Tipo de Consecuencia",
      type: "category",
    },
    legend: {
      title: {
        text: "Tipo de Consecuencia",
      },
    },
    margin: {
      l: 150,
      r: 20,
      t: 50,
      b: 60,
    },
    hovermode: "closest",
  }

  Plotly.newPlot(elementId, traces, layout)
}

/**
 * Creates a data table for a gene
 * @param {string} elementId - ID of the container element
 * @param {string} gene - Gene name
 */
function createDataTable(elementId, gene) {
  const { geneData } = window.dataProcessor

  if (!geneData.isLoaded || !geneData.data[gene]) {
    console.error(`Cannot create table: data for ${gene} not loaded`)
    return
  }

  const data = geneData.data[gene]

  // Create table HTML
  let tableHtml = `
        <div class="table-controls">
            <input type="text" class="table-search" id="search-${elementId}" placeholder="Buscar variantes...">
            <div class="table-pagination" id="pagination-${elementId}">
                <button class="pagination-btn" data-page="1">1</button>
            </div>
        </div>
        <div class="data-table-container">
            <table class="data-table" id="table-${elementId}">
                <thead>
                    <tr>
                        <th>Variant ID</th>
                        <th>HGVSp/c</th>
                        <th>Consequence</th>
                        <th>AC Case</th>
                        <th>AC Control</th>
                        <th>AF Case</th>
                        <th>AF Control</th>
                        <th>P-Val</th>
                        <th>Estimate</th>
                    </tr>
                </thead>
                <tbody>
    `

  // Add first page of data rows
  const pageSize = 10
  const pageCount = Math.ceil(data.length / pageSize)

  for (let i = 0; i < Math.min(pageSize, data.length); i++) {
    const v = data[i]
    tableHtml += `
            <tr>
                <td>${v.variantId}</td>
                <td>${v.hgvs || ""}</td>
                <td>${v.consequence || ""}</td>
                <td>${v.acCase}</td>
                <td>${v.acControl}</td>
                <td>${v.afCase.toExponential(4)}</td>
                <td>${v.afControl.toExponential(4)}</td>
                <td>${v.pVal ? v.pVal.toExponential(4) : "NA"}</td>
                <td>${v.estimate ? v.estimate.toFixed(3) : "NA"}</td>
            </tr>
        `
  }

  tableHtml += `
                </tbody>
            </table>
        </div>
    `

  // Set table HTML
  document.getElementById(elementId).innerHTML = tableHtml

  // Create pagination buttons
  const paginationElement = document.getElementById(`pagination-${elementId}`)
  paginationElement.innerHTML = ""

  for (let i = 1; i <= Math.min(5, pageCount); i++) {
    const button = document.createElement("button")
    button.className = "pagination-btn" + (i === 1 ? " active" : "")
    button.textContent = i
    button.setAttribute("data-page", i)
    button.addEventListener("click", function () {
      updateTablePage(elementId, gene, Number.parseInt(this.getAttribute("data-page")))

      // Update active button
      document.querySelectorAll(`#pagination-${elementId} .pagination-btn`).forEach((btn) => {
        btn.classList.remove("active")
      })
      this.classList.add("active")
    })

    paginationElement.appendChild(button)
  }

  if (pageCount > 5) {
    const moreButton = document.createElement("button")
    moreButton.className = "pagination-btn"
    moreButton.textContent = "..."
    moreButton.disabled = true
    paginationElement.appendChild(moreButton)

    const lastButton = document.createElement("button")
    lastButton.className = "pagination-btn"
    lastButton.textContent = pageCount
    lastButton.setAttribute("data-page", pageCount)
    lastButton.addEventListener("click", function () {
      updateTablePage(elementId, gene, pageCount)

      // Update active button
      document.querySelectorAll(`#pagination-${elementId} .pagination-btn`).forEach((btn) => {
        btn.classList.remove("active")
      })
      this.classList.add("active")
    })

    paginationElement.appendChild(lastButton)
  }

  // Add search functionality
  const searchInput = document.getElementById(`search-${elementId}`)
  searchInput.addEventListener("input", function () {
    filterTable(elementId, gene, this.value)
  })
}

/**
 * Updates table page
 * @param {string} elementId - ID of the container element
 * @param {string} gene - Gene name
 * @param {number} page - Page number
 */
function updateTablePage(elementId, gene, page) {
  const { geneData } = window.dataProcessor

  if (!geneData.isLoaded || !geneData.data[gene]) {
    return
  }

  const data = geneData.data[gene]
  const pageSize = 10
  const startIndex = (page - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, data.length)

  const tableBody = document.querySelector(`#table-${elementId} tbody`)
  tableBody.innerHTML = ""

  for (let i = startIndex; i < endIndex; i++) {
    const v = data[i]
    const row = document.createElement("tr")

    row.innerHTML = `
            <td>${v.variantId}</td>
            <td>${v.hgvs || ""}</td>
            <td>${v.consequence || ""}</td>
            <td>${v.acCase}</td>
            <td>${v.acControl}</td>
            <td>${v.afCase.toExponential(4)}</td>
            <td>${v.afControl.toExponential(4)}</td>
            <td>${v.pVal ? v.pVal.toExponential(4) : "NA"}</td>
            <td>${v.estimate ? v.estimate.toFixed(3) : "NA"}</td>
        `

    tableBody.appendChild(row)
  }
}

/**
 * Filters table by search term
 * @param {string} elementId - ID of the container element
 * @param {string} gene - Gene name
 * @param {string} searchTerm - Search term
 */
function filterTable(elementId, gene, searchTerm) {
  const { geneData } = window.dataProcessor

  if (!geneData.isLoaded || !geneData.data[gene]) {
    return
  }

  const data = geneData.data[gene]

  // Filter data
  const filteredData = data.filter((v) => {
    const searchTermLower = searchTerm.toLowerCase()
    return (
      v.variantId.toLowerCase().includes(searchTermLower) ||
      (v.hgvs && v.hgvs.toLowerCase().includes(searchTermLower)) ||
      (v.consequence && v.consequence.toLowerCase().includes(searchTermLower))
    )
  })

  // Update table with first page of filtered data
  const tableBody = document.querySelector(`#table-${elementId} tbody`)
  tableBody.innerHTML = ""

  const pageSize = 10
  const pageCount = Math.ceil(filteredData.length / pageSize)

  for (let i = 0; i < Math.min(pageSize, filteredData.length); i++) {
    const v = filteredData[i]
    const row = document.createElement("tr")

    row.innerHTML = `
            <td>${v.variantId}</td>
            <td>${v.hgvs || ""}</td>
            <td>${v.consequence || ""}</td>
            <td>${v.acCase}</td>
            <td>${v.acControl}</td>
            <td>${v.afCase.toExponential(4)}</td>
            <td>${v.afControl.toExponential(4)}</td>
            <td>${v.pVal ? v.pVal.toExponential(4) : "NA"}</td>
            <td>${v.estimate ? v.estimate.toFixed(3) : "NA"}</td>
        `

    tableBody.appendChild(row)
  }

  // Update pagination
  const paginationElement = document.getElementById(`pagination-${elementId}`)
  paginationElement.innerHTML = ""

  for (let i = 1; i <= Math.min(5, pageCount); i++) {
    const button = document.createElement("button")
    button.className = "pagination-btn" + (i === 1 ? " active" : "")
    button.textContent = i
    button.setAttribute("data-page", i)
    button.setAttribute("data-filtered", "true")
    button.addEventListener("click", function () {
      updateFilteredTablePage(elementId, gene, Number.parseInt(this.getAttribute("data-page")), searchTerm)

      // Update active button
      document.querySelectorAll(`#pagination-${elementId} .pagination-btn`).forEach((btn) => {
        btn.classList.remove("active")
      })
      this.classList.add("active")
    })

    paginationElement.appendChild(button)
  }

  if (pageCount > 5) {
    const moreButton = document.createElement("button")
    moreButton.className = "pagination-btn"
    moreButton.textContent = "..."
    moreButton.disabled = true
    paginationElement.appendChild(moreButton)

    const lastButton = document.createElement("button")
    lastButton.className = "pagination-btn"
    lastButton.textContent = pageCount
    lastButton.setAttribute("data-page", pageCount)
    lastButton.setAttribute("data-filtered", "true")
    lastButton.addEventListener("click", function () {
      updateFilteredTablePage(elementId, gene, pageCount, searchTerm)

      // Update active button
      document.querySelectorAll(`#pagination-${elementId} .pagination-btn`).forEach((btn) => {
        btn.classList.remove("active")
      })
      this.classList.add("active")
    })

    paginationElement.appendChild(lastButton)
  }
}

/**
 * Updates filtered table page
 * @param {string} elementId - ID of the container element
 * @param {string} gene - Gene name
 * @param {number} page - Page number
 * @param {string} searchTerm - Search term
 */
function updateFilteredTablePage(elementId, gene, page, searchTerm) {
  const { geneData } = window.dataProcessor

  if (!geneData.isLoaded || !geneData.data[gene]) {
    return
  }

  const data = geneData.data[gene]

  // Filter data
  const filteredData = data.filter((v) => {
    const searchTermLower = searchTerm.toLowerCase()
    return (
      v.variantId.toLowerCase().includes(searchTermLower) ||
      (v.hgvs && v.hgvs.toLowerCase().includes(searchTermLower)) ||
      (v.consequence && v.consequence.toLowerCase().includes(searchTermLower))
    )
  })

  const pageSize = 10
  const startIndex = (page - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, filteredData.length)

  const tableBody = document.querySelector(`#table-${elementId} tbody`)
  tableBody.innerHTML = ""

  for (let i = startIndex; i < endIndex; i++) {
    const v = filteredData[i]
    const row = document.createElement("tr")

    row.innerHTML = `
            <td>${v.variantId}</td>
            <td>${v.hgvs || ""}</td>
            <td>${v.consequence || ""}</td>
            <td>${v.acCase}</td>
            <td>${v.acControl}</td>
            <td>${v.afCase.toExponential(4)}</td>
            <td>${v.afControl.toExponential(4)}</td>
            <td>${v.pVal ? v.pVal.toExponential(4) : "NA"}</td>
            <td>${v.estimate ? v.estimate.toFixed(3) : "NA"}</td>
        `

    tableBody.appendChild(row)
  }
}

/**
 * Creates a gene comparison table
 * @param {string} elementId - ID of the container element
 */
function createGeneComparisonTable(elementId) {
  const { geneData } = window.dataProcessor

  if (!geneData.isLoaded || !geneData.multigenic) {
    console.error("Cannot create table: multigenic data not available")
    return
  }

  const comparisonData = geneData.multigenic.comparisonTable

  // Create table HTML
  const tableHtml = `
        <table class="gene-comparison">
            <tr>
                <th>Característica</th>
                ${geneData.genes.map((gene) => `<th>${gene}</th>`).join("")}
            </tr>
            <tr>
                <td>Total de variantes</td>
                ${geneData.genes
                  .map((gene) => {
                    const data = comparisonData.find((d) => d.gene === gene)
                    return `<td>${data ? data.totalVariants : 0}</td>`
                  })
                  .join("")}
            </tr>
            <tr>
                <td>Variantes exclusivas en casos</td>
                ${geneData.genes
                  .map((gene) => {
                    const data = comparisonData.find((d) => d.gene === gene)
                    return `<td>${data ? data.caseOnly : 0}</td>`
                  })
                  .join("")}
            </tr>
            <tr>
                <td>Variantes missense</td>
                ${geneData.genes
                  .map((gene) => {
                    const data = comparisonData.find((d) => d.gene === gene)
                    return `<td>${data ? data.missense : 0}</td>`
                  })
                  .join("")}
            </tr>
            <tr>
                <td>Variantes significativas (p<0.05)</td>
                ${geneData.genes
                  .map((gene) => {
                    const data = comparisonData.find((d) => d.gene === gene)
                    return `<td>${data ? data.significant : 0}</td>`
                  })
                  .join("")}
            </tr>
            <tr>
                <td>Variantes de alto impacto</td>
                ${geneData.genes
                  .map((gene) => {
                    const data = comparisonData.find((d) => d.gene === gene)
                    const isHighest = data && data.highImpact === Math.max(...comparisonData.map((d) => d.highImpact))
                    return `<td class="${isHighest ? "highlight" : ""}">${data ? data.highImpact : 0}</td>`
                  })
                  .join("")}
            </tr>
        </table>
    `

  // Set table HTML
  document.getElementById(elementId).innerHTML = tableHtml
}

/**
 * Populates multigenic findings section
 * @param {string} elementId - ID of the container element
 */
function populateMultigenicFindings(elementId) {
  const { geneData } = window.dataProcessor

  if (!geneData.isLoaded || !geneData.multigenic) {
    console.error("Cannot populate findings: multigenic data not available")
    return
  }

  const findings = geneData.multigenic.findings

  // Create HTML
  let html = "<ul>"
  findings.forEach((finding) => {
    html += `<li>${finding}</li>`
  })
  html += "</ul>"

  // Set HTML
  document.getElementById(elementId).innerHTML = html
}

// Export functions for use in other modules
window.visualizations = {
  createVariantsByGeneChart,
  createConsequenceTypesChart,
  createSignificantVariantsChart,
  createConsequenceDistributionChart,
  createFrequencyComparisonChart,
  createVolcanoPlot,
  createGenomicDistributionPlot,
  createDataTable,
  createGeneComparisonTable,
  populateMultigenicFindings,
}
