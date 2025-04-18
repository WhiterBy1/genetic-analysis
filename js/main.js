/**
 * Main Application Module
 * Initializes the application and handles user interactions
 */

// Use geneDescriptions from dataProcessor instead of redeclaring it
// const { geneDescriptions } = window.dataProcessor

/**
 * Initializes the application
 */
function initApp() {
  console.log("Initializing application...")

  // Show loading status
  document.getElementById("data-loading-status").innerHTML =
    '<div class="loading-spinner"></div><p>Cargando datos de genes...</p>'

  // Generate gene cards
  generateGeneCards()

  // Load gene data
  window.dataProcessor
    .loadAllGeneData()
    .then(() => {
      // Update loading status
      document.getElementById("data-loading-status").textContent =
        "Datos cargados correctamente. Generando visualizaciones..."

      // Create overview visualizations
      window.visualizations.createVariantsByGeneChart("variants-by-gene-chart")
      window.visualizations.createConsequenceTypesChart("consequence-types-chart")
      window.visualizations.createConsequenceTypesPercentChart("consequence-types-percent-chart")

      // Create multigenic visualizations
      window.visualizations.createSignificantVariantsChart("significant-variants-chart")
      window.visualizations.createConsequenceDistributionChart("consequence-distribution-chart")
      window.visualizations.createGeneComparisonTable("gene-comparison-table")
      window.visualizations.populateMultigenicFindings("multigenic-findings")

      // Update loading status
      document.getElementById("data-loading-status").textContent =
        "Análisis completado. Explore los resultados a continuación."

      console.log("Application initialized successfully")
    })
    .catch((error) => {
      console.error("Error initializing application:", error)
      document.getElementById("data-loading-status").textContent =
        "Error cargando datos. Por favor, recargue la página."
    })
}

/**
 * Generates gene cards
 */
function generateGeneCards() {
  const geneGrid = document.getElementById("gene-grid")
  const genes = window.dataProcessor.geneData.genes

  let cardsHtml = ""

  genes.forEach((gene) => {
    cardsHtml += `
            <div class="gene-card" onclick="openGenePage('${gene}')">
                <div class="gene-header">
                    <div class="gene-name">${gene}</div>
                </div>
                <div class="gene-body">
                    <p class="gene-description">${geneDescriptions[gene]}</p>
                    <button class="view-btn">Ver Detalles</button>
                </div>
            </div>
        `
  })

  geneGrid.innerHTML = cardsHtml
}

/**
 * Opens a gene page
 * @param {string} gene - Gene name
 */
function openGenePage(gene) {
  // In a real application, this would navigate to a separate page
  // For this demo, we'll open a new window with the gene page
  const genePageUrl = `gene.html?gene=${gene}`
  window.open(genePageUrl, "_blank")
}

/**
 * Expande un gráfico en un modal
 * @param {string} chartId - ID del gráfico a expandir
 * @param {string} title - Título para mostrar en el modal
 */
function expandChart(chartId, title) {
  // Obtener el modal
  const modal = document.getElementById("chart-modal")
  const modalTitle = document.getElementById("chart-modal-title")
  const modalBody = document.getElementById("chart-modal-body")

  // Establecer el título
  modalTitle.textContent = title

  // Crear un nuevo div para el gráfico expandido
  const expandedChartDiv = document.createElement("div")
  expandedChartDiv.id = "expanded-" + chartId
  expandedChartDiv.style.width = "100%"
  expandedChartDiv.style.height = "100%"

  // Limpiar el cuerpo del modal y agregar el nuevo div
  modalBody.innerHTML = ""
  modalBody.appendChild(expandedChartDiv)

  // Mostrar el modal
  modal.style.display = "flex"

  // Recrear el gráfico en el modal con dimensiones más grandes
  const originalChart = document.getElementById(chartId)

  // Determinar qué tipo de gráfico es y recrearlo
  if (chartId === "variants-by-gene-chart") {
    window.visualizations.createVariantsByGeneChart("expanded-" + chartId)
  } else if (chartId === "consequence-types-chart") {
    window.visualizations.createConsequenceTypesChart("expanded-" + chartId)
  } else if (chartId === "consequence-types-percent-chart") {
    window.visualizations.createConsequenceTypesPercentChart("expanded-" + chartId)
  } else if (chartId === "significant-variants-chart") {
    window.visualizations.createSignificantVariantsChart("expanded-" + chartId)
  } else if (chartId === "consequence-distribution-chart") {
    window.visualizations.createConsequenceDistributionChart("expanded-" + chartId)
  }

  // Redimensionar el gráfico para que se ajuste al modal
  // Check if Plotly is defined before using it
  if (typeof Plotly !== "undefined") {
    setTimeout(() => {
      Plotly.relayout("expanded-" + chartId, {
        autosize: true,
      })
    }, 100)
  } else {
    console.error("Plotly is not defined. Make sure it is properly imported.")
  }
}

/**
 * Cierra el modal del gráfico expandido
 */
function closeExpandedChart() {
  const modal = document.getElementById("chart-modal")
  modal.style.display = "none"
}

// Initialize the application when the DOM is loaded
document.addEventListener("DOMContentLoaded", initApp)

// Make openGenePage available globally
window.openGenePage = openGenePage

// Make chart expansion functions available globally
window.expandChart = expandChart
window.closeExpandedChart = closeExpandedChart
